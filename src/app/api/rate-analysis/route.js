import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";

    const companyFilter = {};

    if (search.trim()) {
      companyFilter.name = { $regex: search.trim(), $options: "i" };
    }

    if (["buyer", "seller"].includes(type)) {
      companyFilter.type = type;
    }

    const companies = await ManageCompany.find(companyFilter)
      .sort({ name: 1 })
      .select("name location type category commodities");

    const companyNames = companies.map((c) => c.name);

    const rateFilter = {};
    if (companyNames.length > 0) {
      rateFilter.company = { $in: companyNames };
    }

    const rates = await Rate.find(rateFilter);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedRates = rates.map((rate) => {
      const lastUpdated = new Date(rate.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);
      const isToday = lastUpdated.getTime() === today.getTime();

      const oldRatesFormatted = rate.oldRates.map(
        (old) =>
          `${old.rate} (${new Date(old.date).toLocaleDateString("en-GB")})`
      );

      return {
        company: rate.company,
        location: rate.location,
        commodity: rate.commodity,
        oldRates: oldRatesFormatted,
        newRate: isToday ? rate.newRate : "",
        quantity: isToday ? rate.quantity ?? "" : "",
        payment: isToday ? rate.payment ?? "" : "",
        others: isToday ? rate.others ?? "" : "",
        hasNewRateToday: isToday,
        lastUpdated: isToday
          ? rate.newRateDate
          : rate.oldRates.at(-1)?.date || null,
        updateTime: rate.updateTime || "",
        mobile: rate.mobile || "",
      };
    });

    return NextResponse.json(
      { companies, rates: formattedRates },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /rate-analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate analysis data" },
      { status: 500 }
    );
  }
}

