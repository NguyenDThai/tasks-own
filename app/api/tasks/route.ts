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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Return tasks where user is owner OR assigned as member
    const query: any = { $or: [{ ownerId: userId }, { members: userId }] };
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(query)
      .populate("members", "_id name email")
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const title = body.title?.trim();
    const description = body.description || "";

    if (!title) {
      return NextResponse.json({ error: "Tiêu đề không được để trống" }, { status: 400 });
    }
    
    if (title.length > 100) {
      return NextResponse.json({ error: "Tiêu đề tối đa 100 ký tự" }, { status: 400 });
    }

    if (description.length > 500) {
      return NextResponse.json({ error: "Mô tả tối đa 500 ký tự" }, { status: 400 });
    }
    
    if (body.deadline) {
      const deadlineDate = new Date(body.deadline);
      if (deadlineDate < new Date()) {
        return NextResponse.json({ error: "Deadline phải lớn hơn thời gian hiện tại" }, { status: 400 });
      }
    }

    const task = await Task.create({ ...body, ownerId: userId, members: body.members ?? [] });

    // Create notifications for members (excluding the creator)
    if (body.members && body.members.length > 0) {
      const assignedMembers = body.members.filter((id: string) => id.toString() !== userId.toString());
      if (assignedMembers.length > 0) {
        const notifications = assignedMembers.map((memberId: string) => ({
          userId: memberId,
          type: "TASK_ASSIGNED",
          title: "Bạn được giao một nhiệm vụ mới",
          message: `Bạn đã được thêm vào nhiệm vụ: ${title}`,
          taskId: task._id
        }));
        await Notification.insertMany(notifications);
      }
    }

    // Trả về task đã được populate members để UI hiển thị đúng ngay lập tức
    const populatedTask = await Task.findById(task._id).populate("members", "_id name email");
    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
