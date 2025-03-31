import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserCompany from "@/models/UserCompany";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, companies } = body;

    // Validate input data
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Companies array is required" },
        { status: 400 }
      );
    }

    // Validate each company object
    for (const company of companies) {
      if (!company.companyId || !Array.isArray(company.locations)) {
        return NextResponse.json(
          { error: "Invalid company data structure" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    try {
      // Check if user already has companies assigned
      const existingUserCompany = await UserCompany.findOne({ userId });

      if (existingUserCompany) {
        // Update existing record
        existingUserCompany.companies = companies;
        await existingUserCompany.save();
      } else {
        // Create new record
        await UserCompany.create({
          userId,
          companies,
        });
      }

      return NextResponse.json(
        { message: "Companies assigned successfully" },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error: " + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/user-companies:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const userCompany = await UserCompany.findOne({ userId })
      .populate("companies.companyId", "name location")
      .lean();

    return NextResponse.json(userCompany || { companies: [] });
  } catch (error) {
    console.error("Error in GET /api/user-companies:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
} 