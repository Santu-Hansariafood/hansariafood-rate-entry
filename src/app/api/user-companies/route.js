import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserCompany from "@/models/UserCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mobile, companies } = body;

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: "Companies array is required" }, { status: 400 });
    }

    for (const company of companies) {
      if (!company.companyId || !Array.isArray(company.locations) || company.locations.length === 0) {
        return NextResponse.json({ error: "Invalid company data structure" }, { status: 400 });
      }
    }

    await connectDB();

    let existingUserCompany = await UserCompany.findOne({ mobile });

    if (existingUserCompany) {
      const results = [];
      for (const newCompany of companies) {
        const existingCompany = existingUserCompany.companies.find(
          (c) => c.companyId.toString() === newCompany.companyId
        );

        if (existingCompany) {
          const newLocations = newCompany.locations.filter(
            (loc) => !existingCompany.locations.includes(loc)
          );
          
          if (newLocations.length > 0) {
            existingCompany.locations.push(...newLocations);
            results.push({ companyId: newCompany.companyId, added: newLocations.length });
          } else {
            results.push({ companyId: newCompany.companyId, added: 0, message: "No new locations" });
          }
        } else {
          existingUserCompany.companies.push(newCompany);
          results.push({ companyId: newCompany.companyId, added: newCompany.locations.length });
        }
      }
      await existingUserCompany.save();
      return NextResponse.json({
        message: "Companies and locations updated successfully",
        results
      }, { status: 200 });
    } else {
      await UserCompany.create({ mobile, companies });
      return NextResponse.json({
        message: "Companies and locations assigned successfully",
        results: companies.map(c => ({ companyId: c.companyId, added: c.locations.length }))
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error in POST /api/user-companies:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    await connectDB();

    const userCompany = await UserCompany.findOne({ mobile })
      .populate("companies.companyId", "name location")
      .lean();

    if (!userCompany) {
      return NextResponse.json({ error: "No companies assigned to this mobile number" }, { status: 404 });
    }

    return NextResponse.json(userCompany);
  } catch (error) {
    console.error("Error in GET /api/user-companies:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
