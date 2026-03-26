import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      await dbConnect();
      const user = await User.findById((session.user as any).id).select("-passwordHash");
      if (user) return NextResponse.json({ user });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "invalidToken" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "userNotFound" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi" }, { status: 500 });
  }
}
