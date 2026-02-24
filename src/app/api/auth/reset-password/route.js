import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { email, mobile, otp, newPassword } = await req.json();

    if ((!email && !mobile) || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = email ? { email } : { mobile };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Password validation: length, letter, number, special char
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long and include letters, numbers, and special characters." },
        { status: 400 }
      );
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { message: "New password cannot be the same as the current password." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordLastReset = new Date();
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully. Please login." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
