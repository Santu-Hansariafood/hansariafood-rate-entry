import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { name, mobile, password } = await req.json();

    const existingUser = await User.findOne({ mobile });
    if (existingUser) return NextResponse.json({ message: "Mobile number already registered" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, mobile, password: hashedPassword });

    await newUser.save();
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error registering user" }, { status: 500 });
  }
}
