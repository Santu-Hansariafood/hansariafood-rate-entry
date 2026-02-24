import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";
import { generatePasswordExpiryEmailTemplate } from "@/lib/email/templates/passwordExpiryTemplate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const twentyFiveDaysAgo = new Date(now.getTime() - (25 * 24 * 60 * 60 * 1000));

    // Find users whose password was reset between 25 and 30 days ago
    // and who haven't received a reminder today
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    
    const usersToRemind = await User.find({
      email: { $exists: true, $ne: "" },
      passwordLastReset: { $lte: twentyFiveDaysAgo },
      $or: [
        { lastReminderSent: { $lt: startOfToday } },
        { lastReminderSent: { $exists: false } }
      ]
    });

    let emailsSent = 0;
    const results = [];

    for (const user of usersToRemind) {
      const lastReset = new Date(user.passwordLastReset);
      const diffTime = Math.abs(now - lastReset);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // We only care about the window of 25 to 30 days
      if (diffDays >= 25) {
        const daysRemaining = Math.max(0, 30 - diffDays);
        
        try {
          await sendEmail({
            to: user.email,
            subject: `Action Required: Password Expiry in ${daysRemaining} Days`,
            html: generatePasswordExpiryEmailTemplate(user.name, daysRemaining)
          });
          
          user.lastReminderSent = new Date();
          await user.save();
          
          emailsSent++;
          results.push({ mobile: user.mobile, status: "sent", daysRemaining });
        } catch (emailError) {
          console.error(`Failed to send reminder to ${user.email}:`, emailError);
          results.push({ mobile: user.mobile, status: "failed", error: emailError.message });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${usersToRemind.length} users, sent ${emailsSent} emails.`,
      results 
    });

  } catch (error) {
    console.error("Password Expiry Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
