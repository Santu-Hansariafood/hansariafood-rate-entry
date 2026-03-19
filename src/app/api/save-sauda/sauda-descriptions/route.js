import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import Seller from "@/models/Seller";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

const getCutoffDate = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
};

export async function GET(req) {
  await connectDB();
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
    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    if (!sellerName && !companyName) {
      const allSellers = await Seller.find({
        sellerName: { $nin: [null, ""] },
      })
        .select("sellerName -_id")
        .collation({ locale: "en", strength: 2 })
        .sort({ sellerName: 1 })
        .lean();

      const sellerNames = allSellers.map((s) => s.sellerName);

      const latestPerSeller = await SaudaEntry.aggregate([
        {
          $match: {
            createdAt: { $gte: getCutoffDate(12) }
          }
        },
        {
          $project: {
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
            "saudaEntries.v.sellerName": { $in: sellerNames },
             $expr: {
               $and: [
                 { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.finalRate", 0] } }, 0] },
                 { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.tons", 0] } }, 0] }
               ]
             }
          },
        },
        {
          $group: {
            _id: "$saudaEntries.v.sellerName",
            latestDate: { $max: "$date" },
            totalTons: { 
              $sum: { $toDouble: { $ifNull: ["$saudaEntries.v.tons", 0] } } 
            },
            saudaCount: { $sum: 1 },
            commodities: { $addToSet: "$saudaEntries.v.commodity" }
          },
        },
      ]);

      const statsMap = new Map(
        latestPerSeller.map((d) => [
          d._id, 
          { 
            latestDate: d.latestDate, 
            totalTons: d.totalTons, 
            saudaCount: d.saudaCount,
            commodities: d.commodities 
          }
        ])
      );

      return NextResponse.json(
        {
          sellers: allSellers.map((s) => {
            const stats = statsMap.get(s.sellerName) || {};
            return {
              name: s.sellerName,
              latestDate: stats.latestDate || null,
              totalTons: stats.totalTons || 0,
              saudaCount: stats.saudaCount || 0,
              commodities: stats.commodities || []
            };
          }),
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

    const basePipeline = [
      {
        $match: {
          ...(companyName ? { company: companyName } : {}),
          ...dateFilter,
          ...(!selectedDate && !selectedMonth ? { createdAt: { $gte: getCutoffDate(12) } } : {})
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
          totalTons: { 
            $sum: { 
              $cond: [
                { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.tons", 0] } }, 0] },
                { $toDouble: "$saudaEntries.v.tons" },
                0
              ]
            }
          },
          saudas: {
            $push: {
              saudaNo: { $ifNull: ["$saudaEntries.v.saudaNo", ""] },
              tons: { $ifNull: ["$saudaEntries.v.tons", 0] },
              unit: { $ifNull: ["$saudaEntries.v.unit", ""] },
              finalRate: { 
                $cond: [
                  { $and: [
                    { $ne: ["$saudaEntries.v.finalRate", null] },
                    { $ne: ["$saudaEntries.v.finalRate", ""] },
                    { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.finalRate", 0] } }, 0] }
                  ]},
                  { $toDouble: "$saudaEntries.v.finalRate" },
                  0
                ]
              },
              sellerName: { $ifNull: ["$saudaEntries.v.sellerName", ""] },
              sellerCompany: { $ifNull: ["$saudaEntries.v.sellerCompany", ""] },
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
      { $sort: { latestDate: -1 } },
    ];

    const facetPipeline = [
      ...basePipeline,
      {
        $facet: {
          results: [{ $skip: skip }, { $limit: pageSize }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const facetPromise = SaudaEntry.aggregate(facetPipeline);
    let sellerAggregationPromise = Promise.resolve([]);

    if (companyName) {
      sellerAggregationPromise = SaudaEntry.aggregate([
        {
          $match: {
            company: companyName,
            ...dateFilter,
            ...(!selectedDate && !selectedMonth ? { createdAt: { $gte: getCutoffDate(12) } } : {})
          },
        },
        {
          $project: {
            saudaEntries: {
              $objectToArray: { $ifNull: ["$saudaEntries", {}] },
            },
          },
        },
        { $unwind: "$saudaEntries" },
        { $unwind: "$saudaEntries.v" },
        {
          $match: {
            "saudaEntries.v.finalRate": { $gt: 0 },
            "saudaEntries.v.tons": { $gt: 0 },
            "saudaEntries.v.sellerName": { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          $group: {
            _id: {
              sellerName: "$saudaEntries.v.sellerName",
              sellerCompany: "$saudaEntries.v.sellerCompany",
            },
            count: { $sum: 1 },
            totalTons: { $sum: "$saudaEntries.v.tons" },
            totalValue: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.finalRate", 0] } }, 0] },
                      { $gt: [{ $toDouble: { $ifNull: ["$saudaEntries.v.tons", 0] } }, 0] }
                    ]
                  },
                  { 
                    $multiply: [
                      { $toDouble: "$saudaEntries.v.finalRate" },
                      { $toDouble: "$saudaEntries.v.tons" }
                    ] 
                  },
                  0
                ]
              }
            },
          },
        },
        { $sort: { count: -1, totalTons: -1 } },
      ]);
    }

    const [facetResult, sellerAggregation] = await Promise.all([
      facetPromise,
      sellerAggregationPromise
    ]);

    const results = facetResult?.[0]?.results || [];
    const totalCount = facetResult?.[0]?.total?.[0]?.count || 0;

    let sellerInfo = null;
    if (sellerAggregation.length > 0) {
      sellerInfo = {
        sellers: sellerAggregation.map(seller => ({
          sellerName: seller._id.sellerName,
          sellerCompany: seller._id.sellerCompany,
          transactionCount: seller.count,
          totalTons: seller.totalTons,
          totalValue: seller.totalValue,
        })),
        primarySeller: {
          sellerName: sellerAggregation[0]._id.sellerName,
          sellerCompany: sellerAggregation[0]._id.sellerCompany,
        }
      };
    }

    return NextResponse.json(
      { page, pageSize, total: totalCount, data: results, sellerInfo },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching sauda entries:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
