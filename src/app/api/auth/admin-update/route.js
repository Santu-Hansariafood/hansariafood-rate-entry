import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function PUT(req) {
  if (!verifyApiKey(req)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id, name, mobile, email, password } = await req.json();

    if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (name) user.name = name;
    if (mobile) {
        if (user.mobile !== Number(mobile)) {
             const exist = await User.findOne({ mobile });
             if (exist) return NextResponse.json({ message: "Mobile already in use" }, { status: 400 });
        }
        user.mobile = mobile;
    }
    if (email) {
         if (user.email !== email) {
             const exist = await User.findOne({ email });
             if (exist) return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }
        user.email = email;
    }

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
