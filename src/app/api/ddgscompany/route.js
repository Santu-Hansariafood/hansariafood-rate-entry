import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const targetCommodities = ["Maize DDGS", "Rice DDGS", "Mix DDGS"];

    const query = {
      type: "seller",
      commodities: { $in: targetCommodities },
      isDDGSVisible: true,
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const companies = await ManageCompany.find(query)
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
    console.error("Error in GET /ddgscompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch DDGS companies" },
      { status: 500 }
    );
  }
}
