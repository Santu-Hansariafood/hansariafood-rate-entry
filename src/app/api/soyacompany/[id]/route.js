import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req, { params }) {
  try {
    if (!verifyApiKey(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const awaitedParams = await params;

    await connectDB();

    const targetCommodities = [
      "SBM 46%",
      "SBM 47%",
      "SBM 48%",
      "SBM 49%",
      "SBM 50%",
      "SBM 51%",
      "H Soya"
    ];

    const company = await ManageCompany.findById(awaitedParams.id)
      .select("name locationDetails commodities")
      .lean();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      plantName: company.name,

      locations: company.locationDetails?.map(loc => ({
        location: loc.name,
        state: loc.state
      })) || [],

      commodities: company.commodities.filter(item =>
        targetCommodities.includes(item)
      )
    });

  } catch (err) {
    console.error("Error fetching soya company by ID:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
