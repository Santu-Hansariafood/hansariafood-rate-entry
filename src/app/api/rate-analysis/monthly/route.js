import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get("commodity");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!commodity) {
      return NextResponse.json(
        { error: "Commodity is required" },
        { status: 400 },
      );
    }

    const transitionDate = new Date(2026, 3, 1);
    const startDate = startDateStr
      ? new Date(startDateStr)
      : transitionDate;
    const finalStartDate = startDate > transitionDate ? startDate : transitionDate;
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    const rates = await Rate.find({
      commodity: { $regex: new RegExp(`^${commodity}$`, "i") },
    }).lean();

    const allDataPoints = [];

    rates.forEach((r) => {
      // Process old rates
      if (Array.isArray(r.oldRates)) {
        r.oldRates.forEach((old) => {
          const d = new Date(old.date);
          if (d >= finalStartDate && d <= endDate) {
            allDataPoints.push({
              rate: old.rate,
              date: d,
              company: r.company,
              location: r.location,
            });
          }
        });
      }

      // Process current newRate
      const currentD = new Date(r.newRateDate);
      if (currentD >= finalStartDate && currentD <= endDate) {
        allDataPoints.push({
          rate: r.newRate,
          date: currentD,
          company: r.company,
          location: r.location,
        });
      }
    });

    if (allDataPoints.length === 0) {
      return NextResponse.json({
        summary: { avgRate: 0, maxRate: 0, minRate: 0, totalUpdates: 0 },
        monthlyData: [],
        companyWise: [],
      });
    }

    // Sort by date
    allDataPoints.sort((a, b) => a.date - b.date);

    // Monthly aggregation
    const monthlyMap = {};
    const companyMap = {};

    let totalSum = 0;
    let maxRate = -Infinity;
    let minRate = Infinity;

    allDataPoints.forEach((p) => {
      const monthKey = p.date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const companyKey = p.company;

      totalSum += p.rate;
      if (p.rate > maxRate) maxRate = p.rate;
      if (p.rate < minRate) minRate = p.rate;

      // Monthly
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          sum: 0,
          count: 0,
          max: -Infinity,
          min: Infinity,
        };
      }
      monthlyMap[monthKey].sum += p.rate;
      monthlyMap[monthKey].count += 1;
      if (p.rate > monthlyMap[monthKey].max) monthlyMap[monthKey].max = p.rate;
      if (p.rate < monthlyMap[monthKey].min) monthlyMap[monthKey].min = p.rate;

      // Company
      if (!companyMap[companyKey]) {
        companyMap[companyKey] = {
          sum: 0,
          count: 0,
          max: -Infinity,
          min: Infinity,
        };
      }
      companyMap[companyKey].sum += p.rate;
      companyMap[companyKey].count += 1;
      if (p.rate > companyMap[companyKey].max)
        companyMap[companyKey].max = p.rate;
      if (p.rate < companyMap[companyKey].min)
        companyMap[companyKey].min = p.rate;
    });

    const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      avg: Math.round(data.sum / data.count),
      max: data.max,
      min: data.min,
      count: data.count,
    }));

    const companyWise = Object.entries(companyMap)
      .map(([company, data]) => ({
        company,
        avg: Math.round(data.sum / data.count),
        max: data.max,
        min: data.min,
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    return NextResponse.json({
      summary: {
        avgRate: Math.round(totalSum / allDataPoints.length),
        maxRate,
        minRate,
        totalUpdates: allDataPoints.length,
      },
      monthlyData,
      companyWise,
      allDataPoints: allDataPoints.slice(-50), // Return last 50 for detail view
    });
  } catch (error) {
    console.error("Error in GET /rate-analysis/monthly:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
