import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      category,
      commodities,
      locations,
    } = await req.json();

    if (!name || !locations || !locations.length) {
      return NextResponse.json(
        { error: "Name and at least one location are required" },
        { status: 400 }
      );
    }

    let existingCompany = await ManageCompany.findOne({ name });

    if (existingCompany) {
      // Update existing company
      existingCompany.category = category || existingCompany.category;
      existingCompany.commodities = commodities;
      
      // Merge locations
      const existingLocations = new Set(existingCompany.locations.map(loc => loc.location));
      const newLocations = locations.filter(loc => !existingLocations.has(loc.location));
      existingCompany.locations = [...existingCompany.locations, ...newLocations];

      await existingCompany.save();

      return NextResponse.json(
        {
          message: "Company updated successfully",
          company: existingCompany,
        },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({
      name,
      category: category || "N.A",
      commodities,
      locations,
    });

    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /managecompany:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update company" },
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("q")?.toLowerCase() || "";
    const categories = searchParams.getAll("category");
    const subCommodities = searchParams.getAll("subCommodities");
    const skip = (page - 1) * limit;

    const filter = {};

    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    if (categories.length > 0) {
      filter.category = { $in: categories };
    }

    if (subCommodities.length > 0) {
      filter.subCommodities = { $in: subCommodities };
    }

    const [companies, total] = await Promise.all([
      ManageCompany.find(filter).skip(skip).limit(limit),
      ManageCompany.countDocuments(filter),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /managecompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
