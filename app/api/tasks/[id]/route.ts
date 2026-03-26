import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
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

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await props.params;
    const body = await req.json();
    const title = body.title?.trim();
    const description = body.description || "";

    if (body.title !== undefined && !title) {
      return NextResponse.json({ error: "Tiêu đề không được để trống" }, { status: 400 });
    }

    if (title && title.length > 100) {
      return NextResponse.json({ error: "Tiêu đề tối đa 100 ký tự" }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: "Mô tả tối đa 500 ký tự" }, { status: 400 });
    }

    if (body.deadline) {
      const deadlineDate = new Date(body.deadline);
      if (deadlineDate < new Date()) {
        return NextResponse.json({ error: "Deadline phải lớn hơn thời gian hiện tại" }, { status: 400 });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId },
      body,
      { new: true, runValidators: true }
    );
    
    if (!task) return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await props.params;
    const task = await Task.findOneAndDelete({ _id: params.id, userId });
    
    if (!task) return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
