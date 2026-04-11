import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { connectDB } from "@/lib/mongodb";
import RateHistory from "@/models/RateHistory";
import ManageCompany from "@/models/ManageCompany";
import Freight from "@/models/Freight";

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
    const destination = searchParams.get("destination");

    if (!commodityQuery) {
      return NextResponse.json(
        { error: "commodity query param is required" },
        { status: 400 },
      );
    }

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const raw = commodityQuery.trim();
    const lower = raw.toLowerCase();

    const exactRegex = new RegExp(`^${escapeRegex(raw)}$`, "i");
    let docs = await RateHistory.find({ commodity: exactRegex }).lean();

    if (!docs.length) {
      let fallbackRegex;

      if (lower.includes("sbm")) {
        fallbackRegex = /sbm/i;
      } else if (lower.includes("mdoc") || lower.includes("m doc")) {
        fallbackRegex = /m\s*doc/i;
      } else if (lower.includes("ddgs")) {
        fallbackRegex = /ddgs/i;
      } else {
        fallbackRegex = new RegExp(escapeRegex(raw), "i");
      }

      docs = await RateHistory.find({ commodity: fallbackRegex }).lean();
    }

    if (!docs.length) {
      return NextResponse.json([], { status: 200 });
    }

    const safeDocs = docs.filter((d) => {
      if (!d.companyId) return false;
      const str = String(d.companyId);
      return /^[0-9a-fA-F]{24}$/.test(str);
    });

    if (!safeDocs.length) {
      return NextResponse.json([], { status: 200 });
    }

    const companyIds = [...new Set(safeDocs.map((d) => String(d.companyId)))];

    const companyFilter = { _id: { $in: companyIds }, type: "seller" };

    let companies = [];
    try {
      companies = await ManageCompany.find(companyFilter)
        .select("_id name")
        .lean();
    } catch (err) {
      console.error("GET /landingcost company lookup error:", err);
      companies = [];
    }

    const companyMap = new Map(companies.map((c) => [String(c._id), c.name]));

    const toTime = (value) => {
      if (!value) return 0;
      const date = value instanceof Date ? value : new Date(value);
      const time = date.getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const locations = [
      ...new Set(
        safeDocs
          .map((d) => d.location)
          .filter((loc) => typeof loc === "string" && loc.trim().length > 0),
      ),
    ];

    const destKey = destination ? destination.toLowerCase().trim() : "";

    let freightMap = new Map();

    if (destKey && locations.length) {
      try {
        const freightDocs = await Freight.find({
          commodity: raw,
          location: { $in: locations },
          deliveryLocation: destination,
        })
          .select("location deliveryLocation freightRate createdAt")
          .lean();

        freightDocs.forEach((f) => {
          const key = `${String(f.location).toLowerCase().trim()}|${String(
            f.deliveryLocation,
          )
            .toLowerCase()
            .trim()}`;
          const existing = freightMap.get(key);
          if (
            !existing ||
            new Date(f.createdAt) > new Date(existing.createdAt)
          ) {
            freightMap.set(key, f);
          }
        });
      } catch (err) {
        console.error("GET /landingcost freight lookup error:", err);
      }
    }

    const results = safeDocs
      .filter((doc) => companyMap.has(String(doc.companyId)))
      .map((doc) => {
        const histArr = Array.isArray(doc.history) ? doc.history : [];
        const history = [...histArr].sort(
          (a, b) => toTime(b?.date) - toTime(a?.date),
        );
        const today = history.find((h) => h.date === selectedDate);
        const previous = history.find((h) => h.date < selectedDate);

        const baseRate =
          (today?.finalRate != null ? today.finalRate : undefined) ??
          (previous?.finalRate != null ? previous.finalRate : 0) ??
          0;

        let freightRate = 0;
        if (destKey && doc.location) {
          const key = `${String(doc.location).toLowerCase().trim()}|${destKey}`;
          const freightDoc = freightMap.get(key);
          if (freightDoc) {
            freightRate = Number(freightDoc.freightRate) || 0;
          }
        }

        const landedRate = baseRate + freightRate;

        return {
          companyId: doc.companyId,
          companyName: companyMap.get(String(doc.companyId)),
          location: doc.location,
          commodity: doc.commodity,
          oldRate: today?.oldRate ?? previous?.finalRate ?? 0,
          tempRates: today?.tempRates || [],
          newRate: baseRate,
          others: today?.others || "",
          destinationLocation: destination || "",
          freightRate,
          date: selectedDate,
          landedRate,
        };
      });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("GET /landingcost error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
