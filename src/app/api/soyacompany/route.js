import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const targetCommodities = [
      "SBM 46%",
      "SBM 47%",
      "SBM 48%",
      "SBM 49%",
      "SBM 50%",
      "SBM 51%",
      "H Soya",
    ];

    const companies = await ManageCompany.find({
      type: { $in: ["seller"] },
      commodities: { $in: targetCommodities },
    })
      .select("_id name commodities type")
      .sort({ name: 1 })
      .lean();

    const result = companies.map((c) => ({
      _id: c._id,
      name: c.name,
      type: c.type,
      commodities: c.commodities.filter((item) =>
        targetCommodities.includes(item)
      ),
    }));

    return NextResponse.json(
      { companies: result, total: result.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /soyacompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch soya companies" },
      { status: 500 }
    );
  }
}
