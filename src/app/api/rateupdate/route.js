import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RateUpdate from "@/models/RateUpdate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  try {
    if (!verifyApiKey(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companies } = await req.json();

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: "Invalid companies" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const updated = await RateUpdate.findOneAndUpdate(
      { date: today },
      { companies },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("RateUpdate POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await RateUpdate.find().sort({ date: -1 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("RateUpdate GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
