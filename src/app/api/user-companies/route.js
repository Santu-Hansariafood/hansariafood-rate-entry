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
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: "Companies array is required" },
        { status: 400 }
      );
    }

    for (const company of companies) {
      if (
        !company.companyId ||
        !Array.isArray(company.locations) ||
        company.locations.length === 0
      ) {
        return NextResponse.json(
          { error: "Invalid company data structure" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    let existingUserCompany = await UserCompany.findOne({ mobile });

    if (existingUserCompany) {
      for (const newCompany of companies) {
        const existingCompany = existingUserCompany.companies.find(
          (c) => c.companyId.toString() === newCompany.companyId
        );

        if (existingCompany) {
          const duplicateLocations = newCompany.locations.filter((loc) =>
            existingCompany.locations.includes(loc)
          );

          if (duplicateLocations.length > 0) {
            return NextResponse.json(
              {
                error: `Company already has assigned locations: ${duplicateLocations.join(
                  ", "
                )}`,
              },
              { status: 400 }
            );
          }

          existingCompany.locations.push(...newCompany.locations);
        } else {
          existingUserCompany.companies.push(newCompany);
        }
      }

      await existingUserCompany.save();
    } else {
      await UserCompany.create({ mobile, companies });
    }

    return NextResponse.json(
      { message: "Companies and locations assigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/user-companies:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const userCompany = await UserCompany.findOne({ mobile })
      .populate("companies.companyId", "name location")
      .lean();

    if (!userCompany) {
      return NextResponse.json(
        { error: "No companies assigned to this mobile number" },
        { status: 404 }
      );
    }

    return NextResponse.json(userCompany);
  } catch (error) {
    console.error("Error in GET /api/user-companies:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
