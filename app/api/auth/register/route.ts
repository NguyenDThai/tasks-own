import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "pleaseFillAll" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "passwordTooShort" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "passwordsDontMatch" }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "emailAlreadyInUse" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      passwordHash,
    });

    await newUser.save();

    return NextResponse.json({ message: "Đăng ký thành công" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi" }, { status: 500 });
  }
}
