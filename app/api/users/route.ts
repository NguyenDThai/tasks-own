import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

/**
 * Lấy userId từ session (NextAuth) hoặc JWT token (cookie)
 * (Lưu ý: Đoạn này nên được tách riêng ra một file common để tái sử dụng)
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
 * GET /api/users
 * Trả về danh sách user: _id, name, email
 * Dùng cho tính năng chọn thành viên (select member)
 */
export async function GET(req: NextRequest) {
  try {
    // Chỉ những user đã đăng nhập mới được xem danh sách user khác
    const currentUserId = await getUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Chỉ chọn các trường cần thiết: _id, name, email
    // Đồng thời sắp xếp theo tên để dễ quan sát trong list select
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("_id name email")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống khi lấy danh sách user" },
      { status: 500 },
    );
  }
}
