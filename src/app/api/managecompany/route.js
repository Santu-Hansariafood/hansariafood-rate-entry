import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import RateUpdate from "@/models/RateUpdate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    let {
      name,
      location,
      state = "N.A",
      category = "N.A",
      type,
      mobileNumbers = [],
      commodities = [],
      isSelfCompany = false,
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
        { error: "Name, location & valid type (buyer/seller) are required." },
        { status: 400 },
      );
    }

    type = [...new Set(type)].sort();

    const existingCompany = await ManageCompany.findOne({ name, type });

    if (existingCompany) {
      existingCompany.location = Array.from(
        new Set([...existingCompany.location, ...location]),
      );

      existingCompany.commodities = Array.from(
        new Set([...existingCompany.commodities, ...commodities]),
      );

      const mergedMobile = [...existingCompany.mobileNumbers];

      mobileNumbers.forEach((m) => {
        const exists = mergedMobile.some(
          (old) => old.location === m.location && old.commodity === m.commodity,
        );
        if (!exists) mergedMobile.push(m);
      });

      existingCompany.mobileNumbers = mergedMobile;

      existingCompany.state = state;
      existingCompany.category = category;

      await existingCompany.save();

      return NextResponse.json(
        { message: "Company updated successfully", company: existingCompany },
        { status: 200 },
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
      isSelfCompany,
    });

    await newCompany.save();

    return NextResponse.json(
      { message: "Company created successfully", company: newCompany },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /managecompany Error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Company with same name & type already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create/update company." },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categories = searchParams.getAll("category");
    const subCommodities = searchParams.getAll("subCommodities");
    const typeFilter = searchParams.get("type");
    const selfFilter = ["1", "true", "yes"].includes(
      (searchParams.get("self") || "").toLowerCase(),
    );
    const excludeTodayNoBuying = ["1", "true", "yes"].includes(
      (searchParams.get("excludeTodayNoBuying") || "").toLowerCase(),
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
    if (selfFilter) {
      filter.isSelfCompany = true;
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
      ManageCompany.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name location state category type mobileNumbers commodities isSelfCompany",
        )
        .lean(),
      ManageCompany.countDocuments(filter),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    console.error("GET /managecompany Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies." },
      { status: 500 },
    );
  }
}

export async function GET_SELF(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const categories = searchParams.getAll("category");
    const subCommodities = searchParams.getAll("subCommodities");
    const typeFilter = searchParams.get("type");

    const filter = { isSelfCompany: true };

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

    const [companies, total] = await Promise.all([
      ManageCompany.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      ManageCompany.countDocuments(filter),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    console.error("GET_SELF /managecompany Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch self companies." },
      { status: 500 },
    );
  }
}
