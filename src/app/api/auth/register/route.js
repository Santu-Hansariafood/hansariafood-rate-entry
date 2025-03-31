import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Create User
export async function POST(req) {
  try {
    await connectDB();
    const { name, mobile, password } = await req.json();

    if (!name || !mobile || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json({ message: "Mobile number already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, mobile, password: hashedPassword });
    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// List Users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, { password: 0 }); // Exclude passwords for security
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

// Update User
export async function PUT(req) {
  try {
    await connectDB();
    const { id, name, mobile, password } = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.name = name || user.name;
    user.mobile = mobile || user.mobile;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

// Delete User
export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
