import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeletedSauda from "@/models/DeletedSauda";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email/sendEmail";
import { generateDeletedSaudaEmailTemplate } from "@/lib/email/templates/deletedSaudaTemplate";
import { emitNotification } from "@/lib/socket";
import { sendTemplateToRegisteredUsers } from "@/lib/hansariaMessages";
import { validationPatterns } from "@/utils/validationPatterns/validationPatterns";
import { rateLimitGuard } from "@/lib/apiUtils";

export async function POST(req) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const {
      company,
      date,
      saudaEntry,
      reason,
      mobile: userMobile,
    } = await req.json();

    if (!company || !date || !saudaEntry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      userMobile &&
      !validationPatterns.mobile.test(String(userMobile).trim())
    ) {
      return NextResponse.json(
        { error: "Invalid mobile number. It must be 10 digits starting 6-9." },
        { status: 400 },
      );
    }

    const sellerName = (saudaEntry.sellerName || "").trim();
    if (sellerName && !validationPatterns.name.test(sellerName)) {
      return NextResponse.json(
        {
          error:
            "Invalid seller name. Use letters, numbers, spaces and common symbols (2-100 characters).",
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "";
    const userName = session?.user?.name || "";

    const doc = await DeletedSauda.create({
      company: company.trim(),
      date: date.trim(),
      time,
      saudaNo: saudaEntry.saudaNo || "",
      unit: saudaEntry.unit || "",
      commodity: saudaEntry.commodity || "",
      tons: Number(saudaEntry.tons) || 0,
      finalRate: Number(saudaEntry.finalRate) || 0,
      sellerName: saudaEntry.sellerName || "",
      sellerCompany: saudaEntry.sellerCompany || "",
      deliveryDate: saudaEntry.deliveryDate || "",
      others: saudaEntry.others || "",
      deletedReason: reason || "",
      deletedByName: userName,
      deletedByEmail: userEmail,
      deletedByMobile: userMobile || "",
      deletedAt: now,
    });

    try {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const recipients = [...adminEmails];
      if (userEmail && !recipients.includes(userEmail)) {
        recipients.push(userEmail);
      }

      if (recipients.length > 0) {
        const html = generateDeletedSaudaEmailTemplate({
          company: doc.company,
          date: doc.date,
          time: doc.time,
          saudaEntry: saudaEntry,
          reason,
          userName,
          userEmail,
          userMobile,
        });

        await sendEmail({
          to: recipients.join(", "),
          subject: `Sauda Deleted - ${doc.company} - ${doc.date} - ${
            doc.saudaNo || "No Number"
          }`,
          text: `Sauda entry deleted for ${doc.company} on ${doc.date}. Sauda No: ${
            doc.saudaNo || "N/A"
          }. Deleted by: ${userName || userEmail || userMobile || "Unknown"}.`,
          html,
        });
      }

      emitNotification({
        type: "sauda",
        data: {
          company: doc.company,
          date: doc.date,
          action: "delete",
        },
      });
    } catch (emailError) {
      console.error("Error sending deleted sauda email:", emailError);
    }

    // Delivery happens after the response is flushed so logging stays snappy.
    const notificationPayload = {
      company: doc.company,
      date: doc.date,
      time: doc.time,
      saudaDetails: [
        "Deleted sauda",
        `Sauda No: ${doc.saudaNo || "N/A"}`,
        `Commodity: ${doc.commodity || "N/A"}`,
        `Tons: ${doc.tons}`,
        `Rate: ${doc.finalRate}`,
        `Seller: ${doc.sellerCompany || doc.sellerName || "N/A"}`,
        `Reason: ${doc.deletedReason || "Not provided"}`,
      ].join(", "),
    };

    after(async () => {
      try {
        await sendTemplateToRegisteredUsers(
          "HANSARIA_SAUDA_TEMPLATE_ID",
          notificationPayload
        );
      } catch (messageError) {
        console.error(
          "Failed to send deleted sauda template messages:",
          messageError
        );
      }
    });

    return NextResponse.json(
      {
        message: "Deleted sauda logged successfully",
        notificationDelivery: { queued: true },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /save-sauda/delete-entry:", error);
    return NextResponse.json(
      { error: "Failed to log deleted sauda" },
      { status: 500 },
    );
  }
}
