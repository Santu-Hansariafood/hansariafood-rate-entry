import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Seller from "@/models/Seller";
import Rate from "@/models/Rate";

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

    // Extract company name
    let companyNameMatch = lowerQuery.match(/(?:for|of|with|top sellers for|top 10 sellers for|sellers for)?\s*["']?([^"'\n]+)["']?\s*(?:sellers|seller)?$/i);
    let companyName = companyNameMatch ? companyNameMatch[1].trim() : null;

    // Check if it's a buyer
    let isBuyer = false;
    if (companyName) {
      // Use lean() and select() for efficiency
      const company = await Company.findOne({ 
        name: { $regex: new RegExp(`^${companyName}$`, 'i') } 
      }).select('type name').lean();
      if (company) {
        isBuyer = company.type?.includes('buyer');
      }
    }

    // Quick sellers response if it's a buyer or seller query
    if (isBuyer || lowerQuery.includes("seller")) {
      let sellerQuery = {};
      if (companyName) {
        sellerQuery = {
          companies: { $regex: companyName, $options: "i" }
        };
      }

      // Use lean and select only needed fields
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

    // Quick rates with caching
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

    // Company rates with location
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

    // Quick details fallback
    return NextResponse.json({
      response: `${greeting()}, I'm SariaAI! Quick commands:\n- "top rate" for highest rates\n- "sellers" for seller list\n- "[Company Name] sellers" for company-specific sellers\n- "company rate with location" for company rates\n- Try voice search too!`,
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

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
