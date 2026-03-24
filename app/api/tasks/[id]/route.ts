import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
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

    const task = await Task.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await props.params;
    const task = await Task.findByIdAndDelete(params.id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
