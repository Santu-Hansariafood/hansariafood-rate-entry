import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

const encodeBase64 = (str) => Buffer.from(str, "utf-8").toString("base64");

const decodeBase64 = (str) => Buffer.from(str, "base64").toString("utf-8");

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { name, mobile, password } = await req.json();

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { message: "Mobile number already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, mobile, password: hashedPassword });
    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const users = await User.find({}, { password: 0 });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { mobile, password } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { message: "Mobile and new password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await req.json();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json(
        { message: "Mobile number is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return NextResponse.json(
        { message: "Mobile number not registered" },
        { status: 404 }
      );
    }

    const encodedPassword = user.password ? encodeBase64(user.password) : "";

    const var1 = (user.name || "").trim();
    const var2 = `Your password is ${encodedPassword}. Please login at https://hansariafood.site`;

    if (!var1 || !var2) {
      console.error("Template vars missing", { var1, var2 });
      return NextResponse.json(
        { message: "WhatsApp template variables are blank", var1, var2 },
        { status: 400 }
      );
    }

    const apiKey = "cdbcead5dfba4eb7a4b3f16b62dc2bb8";
    const templateName = "details_confirmation";

    const whatsappUrl = `http://official.nkinfo.in/wapp/api/v2/send/bytemplate/json?apikey=${apiKey}&templatename=${templateName}&mobile=${mobile}&var1=${encodeURIComponent(
      var1
    )}&var2=${encodeURIComponent(var2)}`;

    console.log("📨 Sending WhatsApp:", whatsappUrl);

    const response = await fetch(whatsappUrl);
    const result = await response.json();

    if (response.ok && result.status === "success") {
      return NextResponse.json(
        { message: "Details sent via WhatsApp", name: user.name },
        { status: 200 }
      );
    } else {
      console.error("WhatsApp API Error:", result);
      return NextResponse.json(
        { message: "WhatsApp message failed to send", detail: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
