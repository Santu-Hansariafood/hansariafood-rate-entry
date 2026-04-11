import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

const companyMappings = {
  "Agri Rise": ["Agri Rise Pvt Ltd", "Shivansh Trading Company"],
  "Balaji Exim Enterprises": [
    "Balaji Enterprises - Kolkata",
    "Shivansh Trading Company",
  ],
  Shivansh: ["Shivansh Trading Company"],
};

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const company = searchParams.get("company");

    const query = {};
    if (company) {
      const mappedCompanies = companyMappings[company] || [company];
      query.company = { $in: mappedCompanies };
    }

    if (fromDate && toDate) {
      query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    const entries = await SaudaEntry.find(query).lean();

    const formatted = entries.flatMap((doc) =>
      Object.entries(doc.saudaEntries || {}).flatMap(([unit, list]) =>
        (list || [])
          .filter(
            (item) =>
              (item.sellerName &&
                item.sellerName.toUpperCase() === "AGARWAL") ||
              (doc.seller && doc.seller.toUpperCase() === "AGARWAL"),
          )
          .map((item) => ({
            date: doc.date,
            time: doc.time,
            company: doc.company,
            buyer: doc.buyer || "",
            seller: doc.seller || "",
            unit,
            ...item,
          })),
      ),
    );

    return NextResponse.json({ entries: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /sell-agarwal:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching sell entries for AGARWAL" },
      { status: 500 },
    );
  }
}
