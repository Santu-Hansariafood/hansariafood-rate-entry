import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const saudaNumber = searchParams.get("saudaNumber");

    if (!saudaNumber) {
      return NextResponse.json(
        { error: "Sauda number is required" },
        { status: 400 }
      );
    }

    const pipeline = [
      { $project: {
          saudaEntriesArray: { $objectToArray: "$saudaEntries" },
          date: 1, time: 1, company: 1, buyer: 1, seller: 1
      }},
      { $unwind: "$saudaEntriesArray" },
      { $unwind: "$saudaEntriesArray.v" },
      { $match: { "saudaEntriesArray.v.saudaNo": saudaNumber } },
      { $project: {
          _id: 0,
          type: { 
            $cond: [
              { $regexMatch: { input: "$saudaEntriesArray.k", regex: /purchase/i } }, 
              "Purchase", 
              "Sale"
            ] 
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
          seller: 1
      }}
    ];

    const result = await SaudaEntry.aggregate(pipeline);

    if (!result.length) {
      return NextResponse.json({ error: "Sauda not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Error fetching sauda details:", error);
    return NextResponse.json(
      { error: "Failed to fetch sauda details" },
      { status: 500 }
    );
  }
}
