import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const awaitedParams = await params;

    if (!awaitedParams?.id) {
      return NextResponse.json(
        { error: "Company ID is missing" },
        { status: 400 }
      );
    }

    const targetCommodities = ["M DOC"];

    const company = await ManageCompany.findOne({
      _id: awaitedParams.id,
      type: { $in: ["seller"] },
    })
      .select("name location commodities mobileNumbers type")
      .lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or not a seller" },
        { status: 404 }
      );
    }

    company.commodities = company.commodities.filter((c) =>
      targetCommodities.includes(c)
    );

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

