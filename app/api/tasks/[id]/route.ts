import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await props.params;

    // 1. Tìm task để kiểm tra quyền sở hữu
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json(
        { error: "Task không tồn tại" },
        { status: 404 },
      );
    }

    // 2. Kiểm tra quyền và phân loại hành động
    const isOwner = task.ownerId.toString() === userId.toString();
    const isMember = task.members.some(
      (mId: any) => mId.toString() === userId.toString(),
    );

    const body = await req.json();

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa task này." },
        { status: 403 },
      );
    }

    // Nếu là member nhưng không phải owner
    let updateData = body;
    if (!isOwner && isMember) {
      // Thành viên chỉ được phép update "status"
      updateData = { status: body.status };

      // Kiểm tra nếu người dùng thực sự cố gắng thay đổi các trường khác (không bắt buộc nhưng tốt cho feedback)
      // Tuy nhiên, để đơn giản và tránh lỗi do frontend gửi thừa data, ta chỉ cần filter updateData.
    }

    const title = body.title?.trim();
    const description = body.description || "";

    if (body.title !== undefined && !title) {
      return NextResponse.json(
        { error: "Tiêu đề không được để trống" },
        { status: 400 },
      );
    }

    if (title && title.length > 100) {
      return NextResponse.json(
        { error: "Tiêu đề tối đa 100 ký tự" },
        { status: 400 },
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Mô tả tối đa 500 ký tự" },
        { status: 400 },
      );
    }

    if (body.deadline) {
      const deadlineDate = new Date(body.deadline);
      if (deadlineDate < new Date()) {
        return NextResponse.json(
          { error: "Deadline phải lớn hơn thời gian hiện tại" },
          { status: 400 },
        );
      }
    }

    // Identify new members being added to notify them
    if (isOwner && body.members && Array.isArray(body.members)) {
      const oldMemberIds = task.members.map((m: any) => m.toString());
      const newMemberIds = body.members.filter(
        (mId: string) =>
          !oldMemberIds.includes(mId.toString()) &&
          mId.toString() !== userId.toString(),
      );

      if (newMemberIds.length > 0) {
        const notifications = newMemberIds.map((memberId: string) => ({
          userId: memberId,
          type: "TASK_ASSIGNED",
          title: "Bạn được giao một nhiệm vụ mới",
          message: `Bạn vừa được thêm vào nhiệm vụ: ${body.title || task.title}`,
          taskId: task._id,
        }));
        await Notification.insertMany(notifications, { ordered: false }).catch(
          () => {},
        );
      }
    }

    // 3. Thực hiện cập nhật
    const updatedTask = await Task.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("members", "_id name email");

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await props.params;

    // 1. Tìm task đầu tiên để kiểm tra quyền sở hữu
    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json(
        { error: "Task không tồn tại" },
        { status: 404 },
      );
    }

    // 2. Kiểm tra ownership: Chỉ owner mới có quyền xóa task
    if (task.ownerId.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          error:
            "Bạn không có quyền xóa task này. Chỉ chủ sở hữu mới có quyền xóa.",
        },
        { status: 403 },
      );
    }

    // 3. Thực hiện xóa
    await Task.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: "Xóa task thành công" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
