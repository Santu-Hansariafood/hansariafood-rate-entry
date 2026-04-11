import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { sendEmail } from "@/lib/email/sendEmail";
import { generateSaudaEmailTemplate } from "@/lib/email/templates/saudaTemplate";
import DeletedSauda from "@/models/DeletedSauda";
import { emitNotification } from "@/lib/socket";

export async function POST(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      company,
      date,
      time,
      saudaEntries,
      buyer,
      seller,
      mobile,
      lastUpdated: clientLastUpdated,
    } = body;

    if (
      !company ||
      !date ||
      !saudaEntries ||
      typeof saudaEntries !== "object"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    let existingEntry;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries) {
      try {
        existingEntry = await SaudaEntry.findOne({ company, date });
        
        if (
          existingEntry &&
          existingEntry.lastUpdated &&
          clientLastUpdated &&
          new Date(clientLastUpdated).getTime() !==
            new Date(existingEntry.lastUpdated).getTime()
        ) {
          return NextResponse.json(
            { conflict: true, message: "Data has changed. Please refresh." },
            { status: 409 }
          );
        }

        const normalizedEntries = {};

        for (const [key, list] of Object.entries(saudaEntries)) {
          if (!Array.isArray(list)) continue;

          const processedEntries = [];
          for (const entry of list) {
            // Skip entries with no tons or rate to avoid saving empty rows
            if (!Number(entry.tons) || !Number(entry.finalRate)) continue;

            let saudaNumber = String(entry.saudaNo || "").trim();

            if (!saudaNumber) {
              saudaNumber = await SaudaEntry.getNextSaudaNumber(date);
            }

            processedEntries.push({
              tons: Number(entry.tons) || 0,
              others: (entry.others || "").trim(),
              saudaNo: saudaNumber,
              finalRate: Number(entry.finalRate) || 0,
              unit: (entry.unit || "").trim(),
              commodity: (entry.commodity || "").trim(),
              sellerName: (entry.sellerName || "").trim(),
              sellerCompany: (entry.sellerCompany || "").trim(),
              deliveryDate: (entry.deliveryDate || "").trim(),
            });
          }

          if (processedEntries.length > 0) {
            normalizedEntries[key] = processedEntries;
          }
        }

        if (existingEntry) {
          const deletedDocs = await DeletedSauda.find({
            company: company.trim(),
            date: date.trim(),
          })
            .select("saudaNo")
            .lean();
          const deletedSet = new Set(
            (deletedDocs || []).map((d) => String(d.saudaNo || "").trim()).filter(Boolean)
          );

          let overallHasChanges = false;
          for (const [key, newList] of Object.entries(normalizedEntries)) {
            let keyHasChanges = false;
            const currentList = Array.isArray(existingEntry.saudaEntries.get(key))
              ? existingEntry.saudaEntries.get(key)
              : [];

            const currentMap = new Map(
              currentList
                .filter((item) => item && String(item.saudaNo || "").trim() && !deletedSet.has(String(item.saudaNo || "").trim()))
                .map((item) => [String(item.saudaNo).trim(), item])
            );

            for (const item of newList) {
              const no = String(item.saudaNo || "").trim();
              if (!no) continue;
              
              const existingItem = currentMap.get(no);
              if (!existingItem || 
                  Number(existingItem.tons) !== Number(item.tons) || 
                  Number(existingItem.finalRate) !== Number(item.finalRate) ||
                  String(existingItem.sellerName || "").trim() !== String(item.sellerName || "").trim() ||
                  String(existingItem.sellerCompany || "").trim() !== String(item.sellerCompany || "").trim() ||
                  String(existingItem.others || "").trim() !== String(item.others || "").trim() ||
                  String(existingItem.deliveryDate || "").trim() !== String(item.deliveryDate || "").trim()) {
                currentMap.set(no, item);
                keyHasChanges = true;
                overallHasChanges = true;
              }
            }

            if (keyHasChanges) {
              const mergedList = Array.from(currentMap.values());
              existingEntry.saudaEntries.set(key, mergedList);
            }
          }

          if (overallHasChanges || buyer || seller || mobile) {
            existingEntry.time = time || existingEntry.time;
            if (buyer) existingEntry.buyer = buyer.trim();
            if (seller) existingEntry.seller = seller.trim();
            if (mobile) existingEntry.mobile = mobile;
            existingEntry.company = company.trim();
            existingEntry.lastUpdated = new Date();

            await existingEntry.save();
          }
        } else {
          existingEntry = await SaudaEntry.create({
            company: company.trim(),
            date: date.trim(),
            time: time || "",
            buyer: buyer?.trim(),
            seller: seller?.trim(),
            mobile: mobile,
            saudaEntries: normalizedEntries,
            lastUpdated: new Date(),
          });
        }
        
        // If we reached here, save was successful
        // Emit socket notification
        emitNotification({
          type: 'sauda',
          data: {
            company: existingEntry.company,
            date: existingEntry.date,
            time: existingEntry.time,
            saudaEntries: existingEntry.saudaEntries,
            updateTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          }
        });
        break;

      } catch (error) {
        // Handle duplicate key error (code 11000)
        if (error.code === 11000 && retryCount < maxRetries - 1) {
          retryCount++;
          continue;
        }
        throw error; // Re-throw if not a duplicate key error or max retries reached
      }
    }

    try {
      const saudaEntriesObject = {};
      if (existingEntry.saudaEntries instanceof Map) {
        for (const [key, value] of existingEntry.saudaEntries.entries()) {
          saudaEntriesObject[key] = value;
        }
      } else {
        Object.assign(saudaEntriesObject, existingEntry.saudaEntries);
      }

      const session = await getServerSession(authOptions);
      const userEmail = session?.user?.email;
      const userName = session?.user?.name;

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const recipients = [...adminEmails];
      if (userEmail && !recipients.includes(userEmail)) {
        recipients.push(userEmail);
      }

      const emailHtml = generateSaudaEmailTemplate({
        company: existingEntry.company,
        date: existingEntry.date,
        time: existingEntry.time,
        saudaEntries: saudaEntriesObject,
        userEmail,
        userName,
      });

      if (recipients.length > 0) {
        await sendEmail({
          to: recipients.join(", "),
          subject: `Sauda Report - ${existingEntry.company} - ${existingEntry.date}`,
          text: `Please view the Sauda Report for ${existingEntry.company} dated ${existingEntry.date} in the email body.`,
          html: emailHtml,
        });
      }
    } catch (emailError) {
      console.error("Error generating or sending email:", emailError);
    }

    return NextResponse.json(
      { message: "Sauda entry saved successfully", entry: existingEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /save-sauda:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const companies = searchParams.get("companies");
    const date = searchParams.get("date");
    const resetCounter = searchParams.get("resetCounter");
    const newCounterValue = searchParams.get("newCounterValue");
    
    if (resetCounter === "true" && newCounterValue) {
      const Counter = mongoose.models.Counter;
      if (!Counter) {
        return NextResponse.json(
          { error: "Counter model not found" },
          { status: 500 }
        );
      }

      await Counter.findByIdAndUpdate(
        { _id: "saudaNumber" },
        { seq: parseInt(newCounterValue) },
        { upsert: true }
      );

      return NextResponse.json(
        { message: `Sauda counter reset to ${newCounterValue}` },
        { status: 200 }
      );
    }

    if (companies && date) {
      const companyList = companies
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const entries = await SaudaEntry.find({
        company: { $in: companyList },
        date: date,
      })
        .select("company saudaEntries")
        .lean();
      
      const entriesMap = {};
      entries.forEach(entry => {
        entriesMap[entry.company] = entry;
      });
      
      return NextResponse.json({ entries: entriesMap }, { status: 200 });
    }

    const query = {};
    if (company) query.company = company;
    if (date) query.date = date;

    const entry = await SaudaEntry.findOne(query).lean();
    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /save-sauda:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entry" },
      { status: 500 }
    );
  }
}
