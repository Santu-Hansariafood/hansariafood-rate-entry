import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

await connectDB();

export async function POST(req) {
  try {
    let { name, location, state, category } = await req.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(location)) {
      location = [location];
    }

    state = state || "N.A";
    category = category || "N.A";

    let existingCompany = await ManageCompany.findOne({ name });
    if (existingCompany) {
      const locationExists = location.every((loc) =>
        existingCompany.location.includes(loc)
      );

      if (locationExists) {
        return NextResponse.json(
          { error: "Company with this location already exists" },
          { status: 409 }
        );
      }

      existingCompany.location = [
        ...new Set([...existingCompany.location, ...location]),
      ];
      existingCompany.state = state;
      existingCompany.category = category;
      await existingCompany.save();

      return NextResponse.json(
        {
          message: "Company location updated successfully",
          company: existingCompany,
        },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({ name, location, state, category });
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
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("q")?.toLowerCase() || "";
    const skip = (page - 1) * limit;

    let filter = {};
    if (query) {
      filter = { name: { $regex: query, $options: "i" } };
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
