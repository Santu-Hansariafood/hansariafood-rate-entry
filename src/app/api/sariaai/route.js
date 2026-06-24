import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Seller from "@/models/Seller";
import Rate from "@/models/Rate";

export async function POST(req) {
  try {
    await connectDB();
    const { query, page = 1 } = await req.json();
    const limit = 10;
    const skip = (page - 1) * limit;
    const lowerQuery = query.toLowerCase().trim();

    // Try to extract company name from query
    // Common patterns: "[Company Name]", "for [Company Name]", "of [Company Name]", "with [Company Name]", "top sellers for [Company Name]"
    let companyNameMatch = lowerQuery.match(/(?:for|of|with|top sellers for|top 10 sellers for|sellers for)?\s*["']?([^"'\n]+)["']?\s*(?:sellers|seller)?$/i);
    let companyName = companyNameMatch ? companyNameMatch[1].trim() : null;

    // Check if we found a company and verify it's a buyer
    let isBuyer = false;
    if (companyName) {
      const company = await Company.findOne({ 
        name: { $regex: new RegExp(`^${companyName}$`, 'i') } 
      }).lean();
      if (company) {
        isBuyer = company.type?.includes('buyer');
      }
    }

    // If it's a buyer, show sellers
    if (isBuyer || lowerQuery.includes("seller")) {
      let sellerQuery = {};
      if (companyName) {
        sellerQuery = {
          $or: [
            { companies: { $regex: companyName, $options: "i" } },
            { "companies.name": { $regex: companyName, $options: "i" } }
          ]
        };
      }

      const [sellers, total] = await Promise.all([
        Seller.find(sellerQuery)
          .select("sellerName companies")
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

    // Handle "top rate" query
    if (lowerQuery.includes("top rate") || lowerQuery.includes("highest rate")) {
      const topRates = await Rate.find()
        .sort({ newRate: -1 })
        .limit(10)
        .select("company location commodity newRate updateTime")
        .lean();

      return NextResponse.json({
        response: "Here are the top rates:",
        data: topRates.map(r => ({
          company: r.company,
          location: r.location,
          commodity: r.commodity,
          rate: r.newRate,
          time: r.updateTime
        })),
        hasMore: false
      }, { status: 200 });
    }

    // Handle "top 10 company rate with location" query
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

    // Default response with more capabilities
    return NextResponse.json({
      response: `${greeting()}, I'm SariaAI! I can help you with:\n- Top rates\n- Top companies with rates and locations\n- Top sellers (just ask for sellers, or specify a company name)\n- You can also try voice search!`,
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
