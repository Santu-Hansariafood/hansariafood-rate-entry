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
    const category = searchParams.get("category"); // ignored for seller listings
    const destination = searchParams.get("destination"); // optional buyer location to include freight for this destination

    if (!commodityQuery) {
      return NextResponse.json(
        { error: "commodity query param is required" },
        { status: 400 }
      );
    }

    const normalizedCommodity = commodityQuery.trim().toLowerCase();

    let docs = [];

    if (normalizedCommodity === "soya") {
      docs = await RateHistory.find({
        $or: [
          { commodity: { $regex: /soya/i } },
          { commodity: { $regex: /sbm/i } },
        ],
      }).lean();
    } else {
      const escapeRegex = (s) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const commodityRegex = new RegExp(escapeRegex(commodityQuery), "i");

      docs = await RateHistory.find({ commodity: commodityRegex }).lean();
    }
    if (!docs.length) {
      return NextResponse.json([], { status: 200 });
    }

    // Join with ManageCompany to get company names (and filter by category if provided)
    const companyIds = [...new Set(docs.map((d) => String(d.companyId)))];
    const companyFilter = { _id: { $in: companyIds } };
    // Always target sellers for rate listing (buyers are not the source of rates)
    companyFilter.type = "seller";
    const companies = await ManageCompany.find(companyFilter)
      .select("_id name")
      .lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c.name]));

    // Map docs -> flattened entries for the selectedDate (same logic as /ratehistory/[id]) plus landedRate
    const results = docs
      .filter((doc) => companyMap.has(String(doc.companyId)))
      .map((doc) => {
        const histArr = Array.isArray(doc.history) ? doc.history : [];
        // dates are stored as YYYY-MM-DD strings; lexical sort works
        const history = [...histArr].sort((a, b) =>
          (b?.date || "").localeCompare(a?.date || "")
        );
        const today = history.find((h) => h.date === selectedDate);
        const previous = history.find((h) => h.date < selectedDate);

        const baseRate =
          (today?.finalRate != null ? today.finalRate : undefined) ??
          (previous?.finalRate != null ? previous.finalRate : 0) ??
          0;
        const todayFreight = today?.freightRate || 0;
        const todayDestination = today?.destinationLocation || "";

        // Add freight only if destination is provided and matches the record's destination
        const shouldAddFreight =
          destination &&
          todayDestination &&
          todayDestination.toLowerCase().trim() ===
            destination.toLowerCase().trim();
        const landedRate = shouldAddFreight ? baseRate + todayFreight : baseRate;

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
          landedRate,
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
