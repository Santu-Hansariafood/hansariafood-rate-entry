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
    let {
      name,
      location,
      state,
      category,
      buyerOrSeller,
      mobileNumbers,
      commodities,
      subCommodities,
    } = await req.json();

    if (
      !name ||
      !location ||
      !buyerOrSeller ||
      !["Buyer", "Seller"].includes(buyerOrSeller)
    ) {
      return NextResponse.json(
        { error: "Name, location, and valid buyerOrSeller are required" },
        { status: 400 }
      );
    }

    location = Array.isArray(location) ? location : [location];
    mobileNumbers = Array.isArray(mobileNumbers) ? mobileNumbers : [];
    commodities = Array.isArray(commodities) ? commodities : [];
    subCommodities = Array.isArray(subCommodities) ? subCommodities : [];
    state = state || "N.A";
    category = category || "N.A";

    let existingCompany = await ManageCompany.findOne({ name, buyerOrSeller });

    if (existingCompany) {
      const allLocationsExist = location.every((loc) =>
        existingCompany.location.includes(loc)
      );

      if (allLocationsExist) {
        return NextResponse.json(
          { error: "Company with this name, type, and location already exists" },
          { status: 409 }
        );
      }

      // Merge new locations
      existingCompany.location = Array.from(new Set([...existingCompany.location, ...location]));

      // Merge mobile numbers without duplicates
      const existingMobileNumbers = existingCompany.mobileNumbers || [];
      const newMobileNumbers = mobileNumbers.filter(
        (newNum) =>
          !existingMobileNumbers.some(
            (oldNum) =>
              oldNum.location === newNum.location &&
              oldNum.commodity === newNum.commodity
          )
      );
      existingCompany.mobileNumbers = [...existingMobileNumbers, ...newMobileNumbers];

      // Merge commodities
      existingCompany.commodities = Array.from(
        new Set([...existingCompany.commodities, ...commodities])
      );

      // Merge subCommodities
      existingCompany.subCommodities = Array.from(
        new Set([...existingCompany.subCommodities, ...subCommodities])
      );

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
      buyerOrSeller,
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

    // Duplicate key error (e.g. same name + buyerOrSeller already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "A company with this name and type (Buyer/Seller) already exists. Please use a different type or name."
        },
        { status: 409 }
      );
    }

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
    const buyerOrSellerFilter = searchParams.get("buyerOrSeller");

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

    if (
      buyerOrSellerFilter &&
      ["Buyer", "Seller"].includes(buyerOrSellerFilter)
    ) {
      filter.buyerOrSeller = buyerOrSellerFilter;
    }

    const [companies, total] = await Promise.all([
      ManageCompany.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
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
