import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const revalidate = 0;

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const today = dateParam || new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    
    const entries = await SaudaEntry.find({ date: today })
      .select("company date mobile saudaEntries")
      .lean();
    
    const saudaList = [];
    
    entries.forEach(doc => {
        if(doc.saudaEntries) {
             const entriesObj = doc.saudaEntries;
             
             Object.entries(entriesObj).forEach(([key, list]) => {
                 if(Array.isArray(list)) {
                     list.forEach(item => {
                         if(item.tons > 0 && item.finalRate > 0) {
                             saudaList.push({
                                 id: item._id || `${doc._id}-${key}-${item.saudaNo}`,
                                 company: doc.company,
                                 date: doc.date,
                                 mobile: doc.mobile,
                                 tons: item.tons,
                                 finalRate: item.finalRate,
                                 commodity: item.commodity,
                                 sellerName: item.sellerName,
                                 sellerCompany: item.sellerCompany,
                                 unit: item.unit,
                                 saudaNo: item.saudaNo,
                                 deliveryDate: item.deliveryDate,
                                 others: item.others
                             });
                         }
                     });
                 }
             });
        }
    });

    return NextResponse.json(saudaList, { status: 200 });
  } catch (error) {
    console.error("Error fetching today's sauda:", error);
    return NextResponse.json({ error: "Failed to fetch sauda" }, { status: 500 });
  }
}
