import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Seller from "@/models/Seller";
import Rate from "@/models/Rate";

export async function POST(req) {
  try {
    await connectDB();
    const { query } = await req.json();
    
    const lowerQuery = query.toLowerCase().trim();
    
    // Handle "top rate" query
    if (lowerQuery.includes("top rate")) {
      const topRates = await Rate.find()
        .sort({ newRate: -1 })
        .limit(10)
        .select("company location commodity newRate updateTime")
        .lean();

      return NextResponse.json({
        response: "Here are the top 10 rates:",
        data: topRates.map(r => ({
          company: r.company,
          location: r.location,
          commodity: r.commodity,
          rate: r.newRate,
          time: r.updateTime
        }))
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
        response: "Here are the top 10 companies with their rates and locations:",
        data: companyRates.map(c => ({
          company: c._id.company,
          location: c._id.location,
          maxRate: c.maxRate,
          avgRate: Math.round(c.avgRate),
          commodities: c.commodities.join(", ")
        }))
      }, { status: 200 });
    }
    
    // Handle "top 10 seller name" query
    if (lowerQuery.includes("seller")) {
      // Check if query includes a company name to filter sellers
      const companyMatch = lowerQuery.match(/top 10 seller name(?: for| of| with)? (.+)/i);
      let sellers;
      
      if (companyMatch) {
        const companyName = companyMatch[1].trim();
        sellers = await Seller.find({
          $or: [
            { companies: { $regex: companyName, $options: "i" } },
            { "companies.name": { $regex: companyName, $options: "i" } }
          ]
        })
        .select("sellerName companies")
        .sort({ sellerName: 1 })
        .limit(10)
        .lean();
      } else {
        sellers = await Seller.find()
          .select("sellerName companies")
          .sort({ sellerName: 1 })
          .limit(10)
          .lean();
      }

      return NextResponse.json({
        response: companyMatch 
          ? `Here are the top sellers for "${companyMatch[1].trim()}":` 
          : "Here are the top 10 sellers:",
        data: sellers.map(s => ({
          sellerName: s.sellerName,
          companies: Array.isArray(s.companies) 
            ? s.companies.map(c => typeof c === 'object' ? c.name : c).join(", ") 
            : s.companies
        }))
      }, { status: 200 });
    }

    // Default response
    return NextResponse.json({
      response: "Hello! I'm SariaAI. You can ask me about:\n- Top rates\n- Top companies with rates and locations\n- Top sellers (optionally for a specific company)",
      data: null
    }, { status: 200 });

  } catch (error) {
    console.error("SariaAI error:", error);
    return NextResponse.json({ 
      response: "Sorry, I encountered an error. Please try again later.", 
      data: null 
    }, { status: 500 });
  }
}
