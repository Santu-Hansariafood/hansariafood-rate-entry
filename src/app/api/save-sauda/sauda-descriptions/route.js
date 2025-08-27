import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import Seller from "@/models/Seller";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  try {
    if (!verifyApiKey(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sellerName = searchParams.get("sellerName");
    const companyName = searchParams.get("companyName");
    const selectedDate = searchParams.get("date");
    const selectedMonth = searchParams.get("month");
    const rawPage = Number(searchParams.get("page") || 1);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // If no seller/company → return just seller list
    if (!sellerName && !companyName) {
      const allSellers = await Seller.find({
        sellerName: { $nin: [null, ""] },
      })
        .select("sellerName -_id")
        .collation({ locale: "en", strength: 2 })
        .sort({ sellerName: 1 })
        .lean();

      return NextResponse.json(
        {
          sellers: allSellers.map((s) => s.sellerName),
          totalSellers: allSellers.length,
        },
        { status: 200 }
      );
    }

    let dateFilter = {};
    if (selectedDate) {
      dateFilter.date = selectedDate;
    } else if (selectedMonth) {
      dateFilter.date = { $regex: `^${selectedMonth}`, $options: "i" };
    }

    const pipeline = [
      {
        $match: {
          // Only match fields available at the document level here
          ...(companyName ? { company: companyName } : {}),
          ...dateFilter,
        },
      },
      {
        $project: {
          company: 1,
          date: 1,
          saudaEntries: {
            $objectToArray: { $ifNull: ["$saudaEntries", {}] },
          },
        },
      },
      { $unwind: "$saudaEntries" },
      { $unwind: "$saudaEntries.v" },
      {
        $match: {
          // Apply entry-level filters here
          ...(sellerName ? { "saudaEntries.v.sellerName": sellerName } : {}),
          "saudaEntries.v.finalRate": { $gt: 0 },
          "saudaEntries.v.tons": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            company: "$company",
            date: "$date",
            unit: "$saudaEntries.v.unit",
            commodity: "$saudaEntries.v.commodity",
          },
          totalTons: { $sum: "$saudaEntries.v.tons" },
          saudas: {
            $push: {
              saudaNo: { $ifNull: ["$saudaEntries.v.saudaNo", ""] },
              tons: "$saudaEntries.v.tons",
              unit: "$saudaEntries.v.unit",
              finalRate: "$saudaEntries.v.finalRate",
              sellerName: "$saudaEntries.v.sellerName",
              sellerCompany: "$saudaEntries.v.sellerCompany",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            company: "$_id.company",
            date: "$_id.date",
            unit: "$_id.unit",
          },
          commodities: {
            $push: {
              commodity: "$_id.commodity",
              totalTons: "$totalTons",
              saudas: "$saudas",
            },
          },
          unitTotalTons: { $sum: "$totalTons" },
        },
      },
      {
        $group: {
          _id: { company: "$_id.company", date: "$_id.date" },
          units: {
            $push: {
              unit: "$_id.unit",
              commodities: "$commodities",
              unitTotalTons: "$unitTotalTons",
            },
          },
          dayTotalTons: { $sum: "$unitTotalTons" },
        },
      },
      {
        $group: {
          _id: "$_id.company",
          company: { $first: "$_id.company" },
          days: {
            $push: {
              date: "$_id.date",
              units: "$units",
              dayTotalTons: "$dayTotalTons",
            },
          },
          companyTotalTons: { $sum: "$dayTotalTons" },
          latestDate: { $max: "$_id.date" },
        },
      },
      // Sort companies by their latest available date for stable pagination
      { $sort: { latestDate: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ];

    const data = await SaudaEntry.aggregate(pipeline);

    return NextResponse.json({ page, pageSize, data }, { status: 200 });
  } catch (err) {
    console.error("Error fetching sauda entries:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
