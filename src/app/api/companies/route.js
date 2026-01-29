import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type")?.toLowerCase() || "all";
    const skip = (page - 1) * limit;

    const query = {
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
      ...(type !== "all" ? { type: type.toLowerCase() } : {}),
    };

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Company.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /company error:", error);
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
    await connectDB();

    const { name, category, type, isSelfCompany = false } = await req.json();

    const nameTrim = name?.trim();
    const categoryTrim = category?.trim();

    const typeArray = Array.isArray(type)
      ? type.map((t) => t.toLowerCase().trim())
      : [type?.toLowerCase().trim()];

    const validTypes = ["buyer", "seller"];
    const selectedTypes = typeArray.filter((t) => validTypes.includes(t));

    if (!nameTrim || !categoryTrim || selectedTypes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Name, category, and at least one valid type (buyer/seller) are required",
        },
        { status: 400 }
      );
    }

    const existingCompany = await Company.findOne({ name: nameTrim });

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
        {
          message: "Company type(s) updated",
          updatedCompany: existingCompany,
        },
        { status: 200 }
      );
    }

    const newCompany = await Company.create({
      name: nameTrim,
      category: categoryTrim,
      type: selectedTypes,
      isSelfCompany,
    });

    return NextResponse.json(
      {
        message: "Company created successfully",
        createdCompany: newCompany,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /company error:", error);
    return NextResponse.json(
      { error: "Failed to create or update company" },
      { status: 500 }
    );
  }
}
