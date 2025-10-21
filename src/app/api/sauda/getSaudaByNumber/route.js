import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const saudaNumber = searchParams.get("saudaNumber");

    if (!saudaNumber) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 }
      );
    }

    const allEntries = await SaudaEntry.find({});
    let saudaDetails = null;

    for (const entry of allEntries) {
      if (entry.saudaEntries) {
        for (const [key, list] of entry.saudaEntries.entries()) {
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.saudaNo === saudaNumber) {
                saudaDetails = {
                  ...item.toObject(),
                  date: entry.date,
                  time: entry.time,
                  company: entry.company,
                  buyer: entry.buyer,
                  seller: entry.seller,
                  type: key.includes("purchase") ? "Purchase" : "Sale",
                };
                break;
              }
            }
          }
          if (saudaDetails) break;
        }
      }
      if (saudaDetails) break;
    }

    if (!saudaDetails) {
      return NextResponse.json({ error: "Sauda not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: saudaDetails });
  } catch (error) {
    console.error("Error fetching sauda details:", error);
    return NextResponse.json(
      { error: "Failed to fetch sauda details" },
      { status: 500 }
    );
  }
}
