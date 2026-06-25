import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Seller from "@/models/Seller";
import Rate from "@/models/Rate";
import SaudaEntry from "@/models/SaudaEntry";
import Freight from "@/models/Freight";
import ManageCompany from "@/models/ManageCompany";

// Caching for quick responses
let quickRatesCache = null;
let quickRatesCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function POST(req) {
  try {
    await connectDB();
    const { query, page = 1 } = await req.json();
    const limit = 10;
    const skip = (page - 1) * limit;
    const lowerQuery = query.toLowerCase().trim();

    // --- Freight Search ---
    if (lowerQuery.includes("freight")) {
      return await handleFreightSearch(lowerQuery, query, page, limit, skip);
    }

    // --- Sauda Search ---
    if (
      lowerQuery.includes("sauda") ||
      lowerQuery.match(/^\d+$/) || // If it's just numbers, could be sauda number
      (lowerQuery.includes("find") && lowerQuery.includes("sauda"))
    ) {
      return await handleSaudaSearch(lowerQuery, query, page, limit, skip);
    }

    // --- Rate Search ---
    if (
      lowerQuery.includes("rate") ||
      lowerQuery.includes("price")
    ) {
      return await handleRateSearch(lowerQuery, query, page, limit, skip);
    }

    // --- Quick sellers response ---
    if (lowerQuery.includes("seller")) {
      return await handleSellerSearch(lowerQuery, query, page, limit, skip);
    }

    // --- Quick rates with caching ---
    if (lowerQuery.includes("top rate") || lowerQuery.includes("highest rate")) {
      const now = Date.now();
      if (quickRatesCache && now - quickRatesCacheTime < CACHE_DURATION) {
        return NextResponse.json({
          response: "Here are the top rates:",
          data: quickRatesCache,
          hasMore: false
        }, { status: 200 });
      }

      const topRates = await Rate.find()
        .sort({ newRate: -1 })
        .limit(10)
        .select('company location commodity newRate updateTime')
        .lean();

      const formattedRates = topRates.map(r => ({
        company: r.company,
        location: r.location,
        commodity: r.commodity,
        rate: r.newRate,
        time: r.updateTime
      }));

      quickRatesCache = formattedRates;
      quickRatesCacheTime = now;

      return NextResponse.json({
        response: "Here are the top rates:",
        data: formattedRates,
        hasMore: false
      }, { status: 200 });
    }

    // --- Company rates with location ---
    if (lowerQuery.includes("company rate") && lowerQuery.includes("location")) {
      const companyRates = await Rate.aggregate([
        {
          $group: {
            _id: { company: "$company", location: "$location" },
            avgRate: { $avg: "$newRate" },
            maxRate: { $max: "$newRate" },
            commodities: { $addToSet: "$commodity" }
          }
        },
        { $sort: { maxRate: -1 } },
        { $limit: 10 }
      ]);

      return NextResponse.json({
        response: "Here are the top companies with their rates and locations:",
        data: companyRates.map(c => ({
          company: c._id.company,
          location: c._id.location,
          maxRate: c.maxRate,
          avgRate: Math.round(c.avgRate),
          commodities: c.commodities.join(", ")
        })),
        hasMore: false
      }, { status: 200 });
    }

    // --- Quick details fallback ---
    return NextResponse.json({
      response: `${greeting()}, I'm SariaAI! Here are some things you can ask:\n- "top rate" for highest rates\n- "sellers" for seller list\n- "[Company Name] sellers" for company-specific sellers\n- "company rate with location" for company rates\n- "sauda [sauda number]" to find a sauda\n- "rate for [company]" to get rates for a company\n- "freight from [location] to [location]" for freight rates\n- Try voice search too!`,
      data: null,
      hasMore: false
    }, { status: 200 });

  } catch (error) {
    console.error("SariaAI error:", error);
    return NextResponse.json({
      response: "Sorry, I encountered an error. Please try again later.",
      data: null,
      hasMore: false
    }, { status: 500 });
  }
}

// --- Helper function: Get Top Sellers for Company ---
async function getTopSellersForCompany(companyName) {
  const sellers = await Seller.find({
    companies: { $regex: companyName, $options: "i" }
  })
    .select('sellerName companies')
    .sort({ sellerName: 1 })
    .limit(5)
    .lean();

  return sellers.map(s => ({
    sellerName: s.sellerName,
    companies: Array.isArray(s.companies)
      ? s.companies.map(c => typeof c === 'object' ? c.name : c).join(", ")
      : s.companies
  }));
}

// --- Helper function: Handle Seller Search ---
async function handleSellerSearch(lowerQuery, originalQuery, page, limit, skip) {
  let sellerQuery = {};
  let companyNameMatch = lowerQuery.match(/(?:for|of|with|top sellers for|top 10 sellers for|sellers for)?\s*["']?([^"'\n]+)["']?\s*(?:sellers|seller)?$/i);
  let companyName = companyNameMatch ? companyNameMatch[1].trim() : null;

  if (companyName) {
    sellerQuery = {
      companies: { $regex: companyName, $options: "i" }
    };
  }

  const [sellers, total] = await Promise.all([
    Seller.find(sellerQuery)
      .select('sellerName companies')
      .sort({ sellerName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Seller.countDocuments(sellerQuery)
  ]);

  const hasMore = skip + sellers.length < total;

  return NextResponse.json({
    response: companyName
      ? `Here are the sellers for "${companyName}":`
      : "Here are the sellers:",
    data: sellers.map(s => ({
      sellerName: s.sellerName,
      companies: Array.isArray(s.companies)
        ? s.companies.map(c => typeof c === 'object' ? c.name : c).join(", ")
        : s.companies
    })),
    hasMore
  }, { status: 200 });
}

// --- Helper function: Handle Freight Search ---
async function handleFreightSearch(lowerQuery, originalQuery, page, limit, skip) {
  let freightQuery = {};
  let searchFromLocation = null;
  let searchToLocation = null;
  let searchCompany = null;
  let commodity = "Maize"; // Default to Maize

  // Extract "from location"
  const fromMatch = lowerQuery.match(/from\s+["']?([^"'\n]+)["']?/i);
  if (fromMatch) {
    searchFromLocation = fromMatch[1].trim();
    freightQuery.location = { $regex: searchFromLocation, $options: "i" };
  }

  // Extract "to location"
  const toMatch = lowerQuery.match(/to\s+["']?([^"'\n]+)["']?/i);
  if (toMatch) {
    searchToLocation = toMatch[1].trim();
    freightQuery.deliveryLocation = { $regex: searchToLocation, $options: "i" };
  }

  // Extract company
  const companyMatch = lowerQuery.match(/(?:for|of|with|company)\s+["']?([^"'\n]+)["']?(?:,|\s|$)/i);
  if (companyMatch) {
    searchCompany = companyMatch[1].trim();
    // Find company ID first
    const company = await ManageCompany.findOne({ name: { $regex: searchCompany, $options: "i" } }).select('_id').lean();
    if (company) {
      freightQuery.company = company._id;
    }
  }

  // Extract commodity if specified, otherwise keep Maize
  const commodityMatch = lowerQuery.match(/(?:commodity)\s+["']?([^"'\n]+)["']?(?:,|\s|$)/i);
  if (commodityMatch) {
    commodity = commodityMatch[1].trim();
    freightQuery.commodity = { $regex: commodity, $options: "i" };
  } else {
    freightQuery.commodity = "Maize";
  }

  const [freights, total] = await Promise.all([
    Freight.find(freightQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('company', 'name')
      .populate('deliveryCompany', 'name')
      .lean(),
    Freight.countDocuments(freightQuery)
  ]);

  const hasMore = skip + freights.length < total;

  // If a company was specified, also get top sellers
  let topSellers = [];
  if (searchCompany) {
    topSellers = await getTopSellersForCompany(searchCompany);
  }

  let responseText = "Freight rates (default commodity: Maize):";
  if (searchFromLocation && searchToLocation) responseText = `Freight from "${searchFromLocation}" to "${searchToLocation}" (default commodity: Maize):`;
  else if (searchFromLocation) responseText = `Freight from "${searchFromLocation}" (default commodity: Maize):`;
  else if (searchToLocation) responseText = `Freight to "${searchToLocation}" (default commodity: Maize):`;

  return NextResponse.json({
    response: responseText,
    data: freights.map(f => ({
      commodity: f.commodity,
      company: f.company?.name || "Unknown Company",
      location: f.location,
      deliveryCompany: f.deliveryCompany?.name || "Unknown Delivery Company",
      deliveryLocation: f.deliveryLocation,
      freightRate: f.freightRate,
      previousRate: f.previousRate
    })),
    topSellers: topSellers.length > 0 ? topSellers : null,
    hasMore
  }, { status: 200 });
}

// --- Helper function: Handle Sauda Search ---
async function handleSaudaSearch(lowerQuery, originalQuery, page, limit, skip) {
  // Extract sauda number
  let saudaNumber = lowerQuery.match(/\d+/)?.[0];

  const basePipeline = [
    {
      $project: {
        saudaEntriesArray: { $objectToArray: "$saudaEntries" },
        date: 1,
        time: 1,
        company: 1,
        buyer: 1,
        seller: 1,
      },
    },
    { $unwind: "$saudaEntriesArray" },
    { $unwind: "$saudaEntriesArray.v" },
  ];

  const projectionStage = {
    $project: {
      _id: 0,
      type: {
        $cond: [
          {
            $regexMatch: {
              input: "$saudaEntriesArray.k",
              regex: /purchase/i,
            },
          },
          "Purchase",
          "Sale",
        ],
      },
      tons: "$saudaEntriesArray.v.tons",
      others: "$saudaEntriesArray.v.others",
      saudaNo: "$saudaEntriesArray.v.saudaNo",
      finalRate: "$saudaEntriesArray.v.finalRate",
      unit: "$saudaEntriesArray.v.unit",
      commodity: "$saudaEntriesArray.v.commodity",
      sellerName: "$saudaEntriesArray.v.sellerName",
      sellerCompany: "$saudaEntriesArray.v.sellerCompany",
      deliveryDate: "$saudaEntriesArray.v.deliveryDate",
      date: 1,
      time: 1,
      company: 1,
      buyer: 1,
      seller: 1,
    },
  };

  let result;
  let hasMore = false;
  let count = 0;
  let searchCompany = null;

  if (saudaNumber) {
    const exactMatchPipeline = [
      ...basePipeline,
      { $match: { "saudaEntriesArray.v.saudaNo": saudaNumber } },
      projectionStage,
    ];

    result = await SaudaEntry.aggregate(exactMatchPipeline);

    if (!result.length && /^\d{1,6}$/.test(saudaNumber)) {
      const suffix = saudaNumber.replace(/\D/g, "");
      const regex = new RegExp(`${suffix}$`);

      const suffixPipeline = [
        ...basePipeline,
        { $match: { "saudaEntriesArray.v.saudaNo": { $regex: regex } } },
        projectionStage,
      ];

      result = await SaudaEntry.aggregate(suffixPipeline);
    }
  } else {
    // If no sauda number, try company name or return recent saudus
    let companyMatch = lowerQuery.match(/(?:sauda|find|get|search)\s+(?:for|of|with|at)?\s*["']?([^"'\n]+)["']?$/i);
    searchCompany = companyMatch ? companyMatch[1].trim() : null;

    let matchStage = {};
    if (searchCompany) {
      matchStage = { company: { $regex: searchCompany, $options: "i" } };
    }

    const countPipeline = [
      { $match: matchStage },
      ...basePipeline,
      { $count: "total" }
    ];
    const countResult = await SaudaEntry.aggregate(countPipeline);
    count = countResult[0]?.total || 0;
    hasMore = skip + limit < count;

    const pipeline = [
      { $match: matchStage },
      ...basePipeline,
      projectionStage,
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    result = await SaudaEntry.aggregate(pipeline);
  }

  // If a company was specified, also get top sellers
  let topSellers = [];
  if (searchCompany) {
    topSellers = await getTopSellersForCompany(searchCompany);
  }

  if (result && result.length > 0) {
    return NextResponse.json({
      response: `Found ${result.length} sauda${result.length > 1 ? 's' : ''}:`,
      data: result,
      topSellers: topSellers.length > 0 ? topSellers : null,
      hasMore
    }, { status: 200 });
  }

  return NextResponse.json({
    response: "No sauda found. Try providing a sauda number or company name.",
    data: null,
    topSellers: null,
    hasMore: false
  }, { status: 200 });
}

// --- Helper function: Handle Rate Search ---
async function handleRateSearch(lowerQuery, originalQuery, page, limit, skip) {
  let rateQuery = {};
  let searchCompany = null;
  let searchLocation = null;
  let searchCommodity = null;

  // Extract company name
  let companyMatch = lowerQuery.match(/(?:rate|price|rates)\s+(?:for|of|with|at)?\s*["']?([^"'\n,]+)["']?(?:,|\s|$)/i);
  if (companyMatch) {
    searchCompany = companyMatch[1].trim();
    rateQuery.company = { $regex: searchCompany, $options: "i" };
  }

  // Extract location
  let locationMatch = lowerQuery.match(/(?:location|at)\s+(?:for|of|with|in)?\s*["']?([^"'\n,]+)["']?(?:,|\s|$)/i);
  if (locationMatch) {
    searchLocation = locationMatch[1].trim();
    rateQuery.location = { $regex: searchLocation, $options: "i" };
  }

  // Extract commodity
  let commodityMatch = lowerQuery.match(/(?:commodity)\s+(?:of|with)?\s*["']?([^"'\n,]+)["']?(?:,|\s|$)/i);
  if (commodityMatch) {
    searchCommodity = commodityMatch[1].trim();
    rateQuery.commodity = { $regex: searchCommodity, $options: "i" };
  }

  const [rates, total] = await Promise.all([
    Rate.find(rateQuery)
      .sort({ newRate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Rate.countDocuments(rateQuery)
  ]);

  const hasMore = skip + rates.length < total;

  // If a company was specified, also get top sellers
  let topSellers = [];
  if (searchCompany) {
    topSellers = await getTopSellersForCompany(searchCompany);
  }

  let responseText = "Here are the rates:";
  if (searchCompany) responseText = `Rates for "${searchCompany}":`;
  if (searchCompany && searchLocation) responseText = `Rates for "${searchCompany}" at "${searchLocation}":`;

  return NextResponse.json({
    response: responseText,
    data: rates.map(r => ({
      company: r.company,
      location: r.location,
      commodity: r.commodity,
      rate: r.newRate,
      payment: r.payment,
      others: r.others,
      time: r.updateTime,
      date: r.newRateDate
    })),
    topSellers: topSellers.length > 0 ? topSellers : null,
    hasMore
  }, { status: 200 });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
