import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { getOtpEmailTemplate } from "@/lib/email/templates/otpTemplate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { email, mobile } = await req.json();

    if (!email && !mobile) {
      return NextResponse.json(
        { message: "Please provide email or mobile number" },
        { status: 400 },
      );
    }

    const query = email ? { email } : { mobile };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json(
        {
          message:
            "No email address linked to this account. Please contact support.",
        },
        { status: 400 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Code - Hansaria Food",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
      html: getOtpEmailTemplate(user.name, otp),
    });

    return NextResponse.json(
      { message: "OTP sent to your registered email.", email: user.email },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
