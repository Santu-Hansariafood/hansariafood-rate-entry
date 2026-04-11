import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaStatus from "@/models/SaudaStatus";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { saudaNo, status, unit, commodity, sellerName, sellerCompany } =
      await req.json();

    if (!saudaNo) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await SaudaStatus.findOneAndUpdate(
      { saudaNo },
      {
        saudaNo,
        status: status || "Pending",
        unit,
        commodity,
        sellerName,
        sellerCompany,
      },
      { new: true, upsert: true },
    );

    return NextResponse.json(
      { message: "Status saved successfully", sauda: updated },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /sauda-status error:", error);
    return NextResponse.json(
      { error: "Failed to save sauda status" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const statuses = await SaudaStatus.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ statuses }, { status: 200 });
  } catch (error) {
    console.error("GET /sauda-status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sauda statuses" },
      { status: 500 },
    );
  }
}
