import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { getOtpEmailTemplate } from "@/lib/email/templates/otpTemplate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { sendTemplateToUser } from "@/lib/hansariaMessages";

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

    let inAppDelivery;
    try {
      inAppDelivery = await sendTemplateToUser(
        user,
        "HANSARIA_OTP_TEMPLATE_ID",
        { otp }
      );
    } catch (messageError) {
      console.error("Failed to send OTP template message:", messageError);
      inAppDelivery = { sent: 0, error: messageError.message };
    }

    return NextResponse.json(
      {
        message:
          inAppDelivery.sent > 0
            ? "OTP sent to your registered email and app."
            : inAppDelivery.error
              ? "OTP sent to email, but the app message could not be sent."
              : inAppDelivery.skipped
                ? "OTP sent to email; link your app account to receive OTP messages there."
                : "OTP sent to your registered email.",
        email: user.email,
        inAppDelivery,
      },
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
