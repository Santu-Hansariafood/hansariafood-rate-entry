import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { connectDB } from "@/lib/mongodb";
import RateHistory from "@/models/RateHistory";
import ManageCompany from "@/models/ManageCompany";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const commodityQuery = searchParams.get("commodity");
    const selectedDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const category = searchParams.get("category"); // optional filter, e.g., "Feed Mills"

    if (!commodityQuery) {
      return NextResponse.json(
        { error: "commodity query param is required" },
        { status: 400 }
      );
    }

    const commodityRegex = new RegExp(commodityQuery, "i");

    // Fetch all rate history docs matching the commodity
    const docs = await RateHistory.find({ commodity: commodityRegex }).lean();
    if (!docs.length) {
      return NextResponse.json([], { status: 200 });
    }

    // Join with ManageCompany to get company names (and filter by category if provided)
    const companyIds = [...new Set(docs.map((d) => String(d.companyId)))];
    const companyFilter = { _id: { $in: companyIds } };
    if (category) {
      companyFilter.category = category;
    }
    const companies = await ManageCompany.find(companyFilter)
      .select("_id name")
      .lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c.name]));

    // Map docs -> flattened entries for the selectedDate (same logic as /ratehistory/[id])
    const results = docs
      .filter((doc) => companyMap.has(String(doc.companyId)))
      .map((doc) => {
        const history = [...doc.history].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const today = history.find((h) => h.date === selectedDate);
        const previous = history.find((h) => h.date < selectedDate);

        return {
          companyId: doc.companyId,
          companyName: companyMap.get(String(doc.companyId)),
          location: doc.location,
          commodity: doc.commodity,
          oldRate: today?.oldRate ?? previous?.finalRate ?? 0,
          tempRates: today?.tempRates || [],
          newRate: today?.finalRate || "",
          others: today?.others || "",
          destinationLocation: today?.destinationLocation || "",
          freightRate: today?.freightRate || 0,
          date: selectedDate,
        };
      });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("GET ratehistory/by-commodity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

