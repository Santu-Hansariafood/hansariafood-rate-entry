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

// --- AI Conversation Helper ---
function generateAIResponse(type, data, searchParams) {
  const greetings = [
    "Sure!",
    "Got it!",
    "Great question!",
    "Absolutely!",
    "Let me check that for you!",
    "Here's what I found!"
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  let baseResponse = randomGreeting;
  
  if (type === "rates") {
    if (searchParams.commodity && searchParams.company && searchParams.location) {
      baseResponse = `Sure! Here are the ${searchParams.commodity} rates for ${searchParams.company} in ${searchParams.location}:`;
    } else if (searchParams.commodity && searchParams.company) {
      baseResponse = `Got it! Here are the ${searchParams.commodity} rates for ${searchParams.company}:`;
    } else if (searchParams.commodity && searchParams.location) {
      baseResponse = `Great! Here are the ${searchParams.commodity} rates in ${searchParams.location}:`;
    } else if (searchParams.company) {
      baseResponse = `Absolutely! Here are the rates for ${searchParams.company}:`;
    } else if (searchParams.commodity) {
      baseResponse = `Sure! Here are the ${searchParams.commodity} rates:`;
    }
  } else if (type === "sauda") {
    if (searchParams.company) {
      baseResponse = `Got it! Here are the sauda entries for ${searchParams.company}:`;
    }
  } else if (type === "freight") {
    if (searchParams.fromLocation && searchParams.toLocation) {
      baseResponse = `Sure! Here are the freight rates from ${searchParams.fromLocation} to ${searchParams.toLocation}:`;
    } else if (searchParams.fromLocation) {
      baseResponse = `Got it! Here are the freight rates from ${searchParams.fromLocation}:`;
    } else if (searchParams.toLocation) {
      baseResponse = `Great! Here are the freight rates to ${searchParams.toLocation}:`;
    }
  }
  
  return baseResponse;
}

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
          response: "Sure! Here are the top current rates:",
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
        response: "Absolutely! Here are the top current rates:",
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
        response: "Great! Here are the top companies with their rates and locations:",
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

    // --- Fallback for general questions ---
    const generalResponses = [
      `Hello! I'm SariaAI, your helpful assistant. Here's what I can help with:\n- Check rates\n- Find sauda entries\n- Get freight rates\n- View sellers\nTry asking "maize rate for ABC Traders", "sauda for XYZ Company", or "view sellers in ABC Traders"!`,
      `${greeting()}! I'm SariaAI. I can help you find information about rates, saudus, freight, and sellers. Try "view sellers in [company name]"!`,
      `Hi there! I'm SariaAI. Ask me about rates, saudus, freight, or sellers! Like "view sellers in ABC Traders"!`,
      `${greeting()}! I'm SariaAI. How can I assist you today? You can ask about rates, saudus, freight, or sellers. Try "show sellers in XYZ Company"!`
    ];
    
    const fallbackResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];

    return NextResponse.json({
      response: fallbackResponse,
      data: null,
      hasMore: false
    }, { status: 200 });

  } catch (error) {
    console.error("SariaAI error:", error);
    return NextResponse.json({
      response: "Oops! I'm sorry, I ran into an error. Please try again later.",
      data: null,
      hasMore: false
    }, { status: 500 });
  }
}

// --- Helper function: Get Top Sellers for Company (with sauda stats) ---
async function getTopSellersForCompany(companyName) {
  // First, get all sellers associated with the company
  const sellers = await Seller.find({
    companies: { $regex: companyName, $options: "i" }
  })
    .select('sellerName companies')
    .lean();
  
  // Now, get sauda stats for these sellers for this company
  const sellerStats = await SaudaEntry.aggregate([
    { $match: { company: { $regex: companyName, $options: "i" } } },
    { $project: { saudaEntriesArray: { $objectToArray: "$saudaEntries" } } },
    { $unwind: "$saudaEntriesArray" },
    { $unwind: "$saudaEntriesArray.v" },
    {
      $match: {
        "saudaEntriesArray.v.sellerName": { $in: sellers.map(s => s.sellerName) },
        $expr: {
          $and: [
            { $gt: [{ $toDouble: { $ifNull: ["$saudaEntriesArray.v.finalRate", 0] } }, 0] },
            { $gt: [{ $toDouble: { $ifNull: ["$saudaEntriesArray.v.tons", 0] } }, 0] }
          ]
        }
      }
    },
    {
      $group: {
        _id: "$saudaEntriesArray.v.sellerName",
        totalTons: { $sum: { $toDouble: { $ifNull: ["$saudaEntriesArray.v.tons", 0] } } },
        saudaCount: { $sum: 1 }
      }
    },
    { $sort: { totalTons: -1, saudaCount: -1 } }
  ]);

  // Map the stats back to the seller list
  const sellerMap = new Map();
  for (const stat of sellerStats) {
    sellerMap.set(stat._id, stat);
  }

  // Sort the sellers based on their stats
  const sortedSellers = sellers.sort((a, b) => {
    const aStats = sellerMap.get(a.sellerName) || { totalTons: 0, saudaCount: 0 };
    const bStats = sellerMap.get(b.sellerName) || { totalTons: 0, saudaCount: 0 };
    if (bStats.totalTons !== aStats.totalTons) {
      return bStats.totalTons - aStats.totalTons;
    }
    return bStats.saudaCount - aStats.saudaCount;
  }).slice(0, 5); // Return top 5

  return sortedSellers.map(s => {
    const stats = sellerMap.get(s.sellerName) || { totalTons: 0, saudaCount: 0 };
    return {
      sellerName: s.sellerName,
      companies: Array.isArray(s.companies)
        ? s.companies.map(c => typeof c === 'object' ? c.name : c).join(", ")
        : s.companies,
      totalTons: stats.totalTons,
      saudaCount: stats.saudaCount
    };
  });
}

// --- Helper function: Handle Seller Search ---
async function handleSellerSearch(lowerQuery, originalQuery, page, limit, skip) {
  let sellerQuery = {};
  let searchCompany = null;

  // More flexible company extraction for seller search
  const companyPatterns = [
    /(?:view|show|find|get|sellers for|for|of|with)\s+(?:company\s+)?(["']?[\w\s]+?["']?)(?:\s|,|$)/i,
    /(["']?[\w\s]+?["']?)\s+(?:sellers|seller|company)/i,
    /(?:view|show|find|get|sellers for|for|of|with)?\s*["']?([^"'\n]+)["']?\s*(?:sellers|seller)?$/i
  ];
  
  for (let pattern of companyPatterns) {
    let match = lowerQuery.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim().replace(/["']/g, "");
      if (!["for", "of", "with", "at", "in", "location", "commodity", "a", "sauda", "find", "get", "search", "view", "show", "sellers", "seller", "company"].includes(candidate.toLowerCase())) {
        searchCompany = candidate;
        break;
      }
    }
  }

  if (searchCompany) {
    sellerQuery = {
      companies: { $regex: searchCompany, $options: "i" }
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

  // Generate AI-like response for sellers
  const sellerResponses = [
    searchCompany ? `Got it! Here are the sellers for ${searchCompany}:` : "Sure! Here are the sellers:",
    searchCompany ? `Absolutely! Here are the sellers associated with ${searchCompany}:` : "Great! Here are the sellers:",
    searchCompany ? `Got it! Let me show you the sellers for ${searchCompany}:` : "Here's the list of sellers:"
  ];
  
  const responseText = sellerResponses[Math.floor(Math.random() * sellerResponses.length)];

  return NextResponse.json({
    response: responseText,
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

  // Generate AI-like response
  const responseText = generateAIResponse("freight", freights, {
    fromLocation: searchFromLocation,
    toLocation: searchToLocation,
    commodity: commodity
  });

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
    // More flexible company extraction for sauda search
    const companyPatterns = [
      /(?:sauda|find|get|search)\s+(?:for|of|with|at)?\s*["']?([^"'\n]+)["']?$/i,
      /(?:for|of|with)\s+(?:company\s+)?(["']?[\w\s]+?["']?)(?:\s|,|$)/i,
      /(["']?[\w\s]+?["']?)\s+(?:sauda|company)/i
    ];
    
    for (let pattern of companyPatterns) {
      let match = lowerQuery.match(pattern);
      if (match && match[1]) {
        let candidate = match[1].trim().replace(/["']/g, "");
        if (!["for", "of", "with", "at", "in", "location", "commodity", "a", "sauda", "find", "get", "search"].includes(candidate.toLowerCase())) {
          searchCompany = candidate;
          break;
        }
      }
    }

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

  // Generate AI-like response
  if (result && result.length > 0) {
    const responseText = generateAIResponse("sauda", result, {
      company: searchCompany
    });
    
    return NextResponse.json({
      response: responseText,
      data: result,
      topSellers: topSellers.length > 0 ? topSellers : null,
      hasMore
    }, { status: 200 });
  }

  const noResultResponses = [
    "I couldn't find any sauda matching your request. Try providing a sauda number or company name!",
    "Sorry, no sauda found. Could you try a different company name or sauda number?",
    "Hmm, I didn't find any sauda entries. Let's try another search!"
  ];
  
  const noResultText = noResultResponses[Math.floor(Math.random() * noResultResponses.length)];

  return NextResponse.json({
    response: noResultText,
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

  // More flexible commodity extraction (works even if commodity is mentioned first)
  // Patterns: "maize rate", "rate of maize", "maize price", etc.
  const commodityPatterns = [
    /(?:^|\s)([\w\s]+?)\s+(?:rate|price|rates)/i, // Commodity first: "maize rate"
    /(?:rate|price|rates)\s+(?:for|of)\s+([\w\s]+?)(?:\s|,|$)/i, // Commodity after: "rate of maize"
    /(?:commodity)\s+(?:of|with)?\s*["']?([^"'\n,]+)["']?(?:,|\s|$)/i
  ];
  
  for (let pattern of commodityPatterns) {
    let match = lowerQuery.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim();
      // Avoid matching words like "for", "of", "at", "in", "company", "location"
      if (!["for", "of", "with", "at", "in", "company", "location", "a"].includes(candidate.toLowerCase())) {
        searchCommodity = candidate;
        rateQuery.commodity = { $regex: searchCommodity, $options: "i" };
        break;
      }
    }
  }

  // More flexible company extraction
  const companyPatterns = [
    /(?:for|of|with)\s+(?:company\s+)?(["']?[\w\s]+?["']?)(?:\s|,|$)/i,
    /(["']?[\w\s]+?["']?)\s+(?:company|rates?|prices?)/i
  ];
  
  for (let pattern of companyPatterns) {
    let match = lowerQuery.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim().replace(/["']/g, "");
      if (!["for", "of", "with", "at", "in", "location", "commodity", "a"].includes(candidate.toLowerCase())) {
        searchCompany = candidate;
        rateQuery.company = { $regex: searchCompany, $options: "i" };
        break;
      }
    }
  }

  // More flexible location extraction
  const locationPatterns = [
    /(?:at|in)\s+(?:location\s+)?(["']?[\w\s]+?["']?)(?:\s|,|$)/i,
    /(["']?[\w\s]+?["']?)\s+(?:location|rates?|prices?)/i
  ];
  
  for (let pattern of locationPatterns) {
    let match = lowerQuery.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].trim().replace(/["']/g, "");
      if (!["for", "of", "with", "at", "in", "company", "commodity", "a"].includes(candidate.toLowerCase())) {
        searchLocation = candidate;
        rateQuery.location = { $regex: searchLocation, $options: "i" };
        break;
      }
    }
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

  // Generate AI-like response
  const responseText = generateAIResponse("rates", rates, {
    commodity: searchCommodity,
    company: searchCompany,
    location: searchLocation
  });

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
