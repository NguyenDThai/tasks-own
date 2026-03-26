import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * Lấy userId từ session (NextAuth) hoặc JWT token (cookie)
 */
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (session.user as any).id || null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

/**
 * POST /api/tasks/[id]/add-member
 * Thêm thành viên vào task. Chỉ owner mới có quyền.
 *
 * Body: { userId: string }
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Kiểm tra xác thực (người thực hiện yêu cầu)
    const currentUserId = await getUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await props.params;
    const { id } = params;

    // 2. Lấy nội dung body
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId không được thiếu" }, { status: 400 });
    }

    // Kiểm tra định dạng ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "userId không hợp lệ" }, { status: 400 });
    }

    // 3. Tìm task và kiểm tra quyền sở hữu
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task không tồn tại" }, { status: 404 });
    }

    /**
     * Chỉ owner mới có quyền thêm thành viên
     */
    if (task.ownerId.toString() !== currentUserId.toString()) {
      return NextResponse.json(
        { error: "Chỉ chủ sở hữu (owner) mới có quyền thêm thành viên" },
        { status: 403 }
      );
    }

    /**
     * 4. Cập nhật task: thêm userId vào members array.
     * Sử dụng MongoDB operator `$addToSet` để đảm bảo:
     * - Thành viên sẽ không bị trùng lặp nếu API được gọi nhiều lần cho cùng một user.
     */
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true, runValidators: true }
    ).populate("members", "_id name email");

    return NextResponse.json(
      {
        message: "Thêm thành viên thành công",
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API add-member error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống khi thêm thành viên" },
      { status: 500 }
    );
  }
}
