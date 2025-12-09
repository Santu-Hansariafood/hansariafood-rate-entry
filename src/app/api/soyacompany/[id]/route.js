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

    const company = await ManageCompany.findById(awaitedParams.id)
      .select("name location commodities mobileNumbers")
      .lean();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    company.commodities = company.commodities.filter((c) =>
      [
        "SBM 46%",
        "SBM 47%",
        "SBM 48%",
        "SBM 49%",
        "SBM 50%",
        "SBM 51%",
        "H Soya",
      ].includes(c)
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
