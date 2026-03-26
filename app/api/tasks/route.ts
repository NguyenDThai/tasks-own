import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getUserId() {
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

    const query: any = { userId };
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(query).sort({ createdAt: -1 });
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

    const task = await Task.create({ ...body, userId });
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
