import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import RateUpdate from "@/models/RateUpdate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let {
      name,
      location,
      state = "N.A",
      category = "N.A",
      type,
      mobileNumbers = [],
      commodities = [],
      subCommodities = [],
    } = await req.json();

    if (
      !name ||
      !Array.isArray(location) ||
      location.length === 0 ||
      !Array.isArray(type) ||
      type.length === 0 ||
      !type.every((t) => ["buyer", "seller"].includes(t))
    ) {
      return NextResponse.json(
        {
          error: "Name, location, and valid type (Buyer/Seller) are required.",
        },
        { status: 400 }
      );
    }

    type = [...new Set(type)].sort();

    const existingCompany = await ManageCompany.findOne({ name, type });

    if (existingCompany) {
      const allLocationsExist = location.every((loc) =>
        existingCompany.location.includes(loc)
      );

      if (allLocationsExist) {
        return NextResponse.json(
          {
            error: "Company with this name, type, and location already exists.",
          },
          { status: 409 }
        );
      }

      existingCompany.location = Array.from(
        new Set([...existingCompany.location, ...location])
      );

      existingCompany.commodities = Array.from(
        new Set([...existingCompany.commodities, ...commodities])
      );

      existingCompany.subCommodities = Array.from(
        new Set([...existingCompany.subCommodities, ...subCommodities])
      );

      const existingMobile = existingCompany.mobileNumbers || [];
      const mergedMobile = [...existingMobile];

      mobileNumbers.forEach((newNum) => {
        const exists = existingMobile.some(
          (oldNum) =>
            oldNum.location === newNum.location &&
            oldNum.commodity === newNum.commodity
        );
        if (!exists) mergedMobile.push(newNum);
      });

      existingCompany.mobileNumbers = mergedMobile;

      existingCompany.state = state;
      existingCompany.category = category;

      await existingCompany.save();

      return NextResponse.json(
        { message: "Company updated successfully", company: existingCompany },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({
      name,
      location,
      state,
      category,
      type,
      mobileNumbers,
      commodities,
      subCommodities,
    });

    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /managecompany:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "A company with this name and type already exists. Use a different name or type.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create/update company." },
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
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categories = searchParams.getAll("category");
    const subCommodities = searchParams.getAll("subCommodities");
    const typeFilter = searchParams.get("type");
    const excludeTodayNoBuying = ["1", "true", "yes"].includes(
      (searchParams.get("excludeTodayNoBuying") || "").toLowerCase()
    );

    const filter = {};

    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    if (categories.length > 0) {
      filter.category = { $in: categories };
    }

    if (subCommodities.length > 0) {
      filter.subCommodities = { $in: subCommodities };
    }

    if (["buyer", "seller"].includes(typeFilter)) {
      filter.type = typeFilter;
    }

    if (excludeTodayNoBuying) {
      const today = new Date().toISOString().split("T")[0];
      const todayUpdate = await RateUpdate.findOne({ date: today }).lean();
      const excludedNames = todayUpdate?.companies || [];

      if (excludedNames.length > 0) {
        filter.name = filter.name
          ? { ...filter.name, $nin: excludedNames }
          : { $nin: excludedNames };
      }
    }

    const [companies, total] = await Promise.all([
      ManageCompany.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      ManageCompany.countDocuments(filter),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /managecompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies." },
      { status: 500 }
    );
  }
}
