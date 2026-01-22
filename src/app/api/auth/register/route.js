import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

const success = (msg, data = {}) =>
  NextResponse.json({ success: true, message: msg, ...data }, { status: 200 });

const error = (msg, status = 500, extra = {}) =>
  NextResponse.json({ success: false, message: msg, ...extra }, { status });

export async function POST(req) {
  if (!verifyApiKey(req)) return error("Unauthorized", 401);

  try {
    await connectDB();
    const { name, mobile, password, email } = await req.json();

    if (!name || !mobile || !password || !email)
      return error("All fields are required", 400);

    const existing = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existing) {
        if (existing.mobile === mobile) return error("Mobile number already registered", 400);
        if (existing.email === email) return error("Email already registered", 400);
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, mobile, email, password: hash });

    return success("User registered successfully");
  } catch (err) {
    console.error("Registration Error:", err);
    return error("Internal Server Error", 500, { detail: err.message });
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) return error("Unauthorized", 401);

  try {
    await connectDB();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    return error("Failed to fetch users");
  }
}

export async function PUT(req) {
  if (!verifyApiKey(req)) return error("Unauthorized", 401);

  try {
    await connectDB();
    const { mobile, password, pages } = await req.json();

    if (!mobile)
      return error("Mobile number is required", 400);

    const user = await User.findOne({ mobile });
    if (!user) return error("User not found", 404);

    let message = "User updated successfully";

    if (password) {
      user.password = await bcrypt.hash(password, 10);
      message = "Password updated successfully";
    }

    if (pages) {
      user.pages = pages;
      message = "Pages updated successfully";
    }

    await user.save();

    return success(message);
  } catch (err) {
    console.error("Update User Error:", err);
    return error("Failed to update user");
  }
}

export async function DELETE(req) {
  if (!verifyApiKey(req)) return error("Unauthorized", 401);

  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) return error("User ID is required", 400);

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return error("User not found", 404);

    return success("User deleted successfully");
  } catch (err) {
    console.error("Delete User Error:", err);
    return error("Failed to delete user");
  }
}

export async function PATCH(req) {
  if (!verifyApiKey(req)) return error("Unauthorized", 401);

  try {
    await connectDB();
    const { mobile } = await req.json();

    if (!mobile) return error("Mobile number is required", 400);

    const user = await User.findOne({ mobile });
    if (!user) return error("Mobile not registered", 404);

    const tempPassword = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    user.password = await bcrypt.hash(tempPassword, 10);
    await user.save();

    const var1 = user.name.trim();
    const var2 = `Your temporary login password is ${tempPassword}. Please login and change it immediately. https://hansariafood.site`;

    const apiKey = process.env.WHATSAPP_API_KEY;
    const template = "details_confirmation";

    const whatsappUrl = `http://official.nkinfo.in/wapp/api/v2/send/bytemplate/json?apikey=${apiKey}&templatename=${template}&mobile=${mobile}&var1=${encodeURIComponent(
      var1
    )}&var2=${encodeURIComponent(var2)}`;

    console.log("📨 Sending WhatsApp Request:", whatsappUrl);

    const wpRes = await fetch(whatsappUrl);
    const result = await wpRes.json();

    if (wpRes.ok && result.status === "success") {
      return success("Temporary password sent via WhatsApp", {
        name: user.name,
      });
    } else {
      console.error("WhatsApp API Error:", result);
      return error("Failed to send WhatsApp message", 500, { detail: result });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return error("Internal Server Error", 500, { detail: err.message });
  }
}
