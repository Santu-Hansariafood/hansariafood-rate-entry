import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const targetCommodities = ["M DOC", "Maize Ddgs Doc"];

    const companies = await ManageCompany.find({
      type: "seller",
      commodities: { $in: targetCommodities },
    })
      .select("_id name isMDOCVisible commodities")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
