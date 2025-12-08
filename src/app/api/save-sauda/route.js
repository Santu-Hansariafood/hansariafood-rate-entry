import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      company,
      date,
      time,
      saudaEntries,
      buyer,
      seller,
      lastUpdated: clientLastUpdated,
    } = await req.json();

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

    let existingEntry = await SaudaEntry.findOne({ company, date });
    if (
      existingEntry &&
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
    const existingSaudaNumbers = new Set();
    if (existingEntry) {
      for (const [, entries] of existingEntry.saudaEntries.entries()) {
        for (const entry of entries) {
          if (entry.saudaNo) {
            existingSaudaNumbers.add(entry.saudaNo);
          }
        }
      }
    }

    for (const [key, list] of Object.entries(saudaEntries)) {
      if (!Array.isArray(list)) continue;

      const processedEntries = [];
      for (const entry of list) {
        let saudaNumber = String(entry.saudaNo || "").trim();

        if (!saudaNumber && existingEntry) {
          const existingList = existingEntry.saudaEntries.get(key) || [];

          const matchingEntry = existingList.find(
            (existingEntry) =>
              existingEntry.commodity === (entry.commodity || "").trim() &&
              existingEntry.sellerCompany ===
                (entry.sellerCompany || "").trim() &&
              Math.abs(existingEntry.tons - (Number(entry.tons) || 0)) < 0.001
          );

          if (matchingEntry && matchingEntry.saudaNo) {
            saudaNumber = matchingEntry.saudaNo;
          }
        }

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

      normalizedEntries[key] = processedEntries;
    }

    if (existingEntry) {
      for (const [key, newList] of Object.entries(normalizedEntries)) {
        existingEntry.saudaEntries.set(key, newList);
      }

      existingEntry.time = time || existingEntry.time;
      if (buyer) existingEntry.buyer = buyer.trim();
      if (seller) existingEntry.seller = seller.trim();
      existingEntry.company = company.trim();
      existingEntry.lastUpdated = new Date();

      await existingEntry.save();
    } else {
      existingEntry = await SaudaEntry.create({
        company: company.trim(),
        date: date.trim(),
        time: time || "",
        buyer: buyer?.trim(),
        seller: seller?.trim(),
        saudaEntries: normalizedEntries,
        lastUpdated: new Date(),
      });
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
      const companyList = companies.split(",").map(c => c.trim()).filter(Boolean);
      const entries = await SaudaEntry.find({
        company: { $in: companyList },
        date: date
      });
      
      const entriesMap = {};
      entries.forEach(entry => {
        entriesMap[entry.company] = entry;
      });
      
      return NextResponse.json({ entries: entriesMap }, { status: 200 });
    }

    const query = {};
    if (company) query.company = company;
    if (date) query.date = date;

    const entry = await SaudaEntry.findOne(query);
    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /save-sauda:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entry" },
      { status: 500 }
    );
  }
}
