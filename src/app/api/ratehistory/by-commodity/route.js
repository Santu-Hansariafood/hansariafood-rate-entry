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
    const category = searchParams.get("category");
    const destination = searchParams.get("destination");

    if (!commodityQuery) {
      return NextResponse.json(
        { error: "commodity query param is required" },
        { status: 400 }
      );
    }

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const raw = commodityQuery.trim();
    const lower = raw.toLowerCase();

    // 1) Try exact match first (case-insensitive)
    const exactRegex = new RegExp(`^${escapeRegex(raw)}$`, "i");
    let docs = await RateHistory.find({ commodity: exactRegex }).lean();

    // 2) If nothing found, fall back to a looser "contains" match,
    // with special handling for SBM / MDOC style names.
    if (!docs.length) {
      let fallbackRegex;

      if (lower.includes("sbm")) {
        // Match any SBM variant (e.g. "SBM 46%", "SBM 48 DOC", etc.)
        fallbackRegex = /sbm/i;
      } else if (lower.includes("mdoc") || lower.includes("m doc")) {
        // Match "M DOC", "MDOC", with/without space
        fallbackRegex = /m\s*doc/i;
      } else if (lower.includes("ddgs")) {
        // Generic DDGS fallback
        fallbackRegex = /ddgs/i;
      } else {
        // Generic "contains" fallback
        fallbackRegex = new RegExp(escapeRegex(raw), "i");
      }

      docs = await RateHistory.find({ commodity: fallbackRegex }).lean();
    }

    if (!docs.length) {
      return NextResponse.json([], { status: 200 });
    }

    // Collect only valid (non-null) companyIds to avoid cast errors
    const companyIds = [
      ...new Set(
        docs
          .map((d) => d.companyId)
          .filter((id) => !!id)
          .map((id) => String(id))
      ),
    ];
    const companyFilter = { _id: { $in: companyIds } };
    companyFilter.type = "seller";
    const companies = await ManageCompany.find(companyFilter)
      .select("_id name")
      .lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c.name]));

    const toTime = (value) => {
      if (!value) return 0;
      const date =
        value instanceof Date ? value : new Date(value);
      const time = date.getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const results = docs
      .filter((doc) => companyMap.has(String(doc.companyId)))
      .map((doc) => {
        const histArr = Array.isArray(doc.history) ? doc.history : [];
        const history = [...histArr].sort(
          (a, b) => toTime(b?.date) - toTime(a?.date)
        );
        const today = history.find((h) => h.date === selectedDate);
        const previous = history.find((h) => h.date < selectedDate);

        const baseRate =
          (today?.finalRate != null ? today.finalRate : undefined) ??
          (previous?.finalRate != null ? previous.finalRate : 0) ??
          0;
        const todayFreight = today?.freightRate || 0;
        const todayDestination = today?.destinationLocation || "";

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
