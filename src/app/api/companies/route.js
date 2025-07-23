import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, "i");
    const query = search ? { name: { $regex: searchRegex } } : {};

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, category, type } = await req.json();

    const nameTrimmed = name?.trim();
    const categoryTrimmed = category?.trim();
    const typeArray = Array.isArray(type)
      ? type.map((t) => t.toLowerCase().trim())
      : [type?.toLowerCase().trim()];

    const validTypes = ["buyer", "seller"];
    const selectedTypes = typeArray.filter((t) => validTypes.includes(t));

    if (!nameTrimmed || !categoryTrimmed || selectedTypes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Name, category, and at least one valid type (buyer/seller) are required",
        },
        { status: 400 }
      );
    }

    const existingCompany = await Company.findOne({
      name: nameTrimmed,
    });

    if (existingCompany) {
      const newTypes = selectedTypes.filter(
        (t) => !existingCompany.type.includes(t)
      );

      if (newTypes.length === 0) {
        return NextResponse.json(
          { error: "All provided types already exist for this company" },
          { status: 400 }
        );
      }

      existingCompany.type.push(...newTypes);
      await existingCompany.save();

      return NextResponse.json(
        { message: "Company type(s) updated", updatedCompany: existingCompany },
        { status: 200 }
      );
    }

    const newCompany = await Company.create({
      name: nameTrimmed,
      category: categoryTrimmed,
      type: selectedTypes,
    });

    return NextResponse.json(
      { message: "Company created", createdCompany: newCompany },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create or update company" },
      { status: 500 }
    );
  }
}
