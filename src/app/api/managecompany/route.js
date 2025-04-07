import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";

await connectDB();

export async function POST(req) {
  try {
    let { name, category, location, state } = await req.json();

    if (!name || !category || !location || !state) {
      return NextResponse.json(
        { error: "Name, category, location, and state are required" },
        { status: 400 }
      );
    }

    const locationObj = { name: location, state };

    let existingCompany = await ManageCompany.findOne({ name });

    if (existingCompany) {
      const exists = existingCompany.location.some(
        (loc) => loc.name === location
      );

      if (exists) {
        return NextResponse.json(
          { error: "Company with this location already exists" },
          { status: 409 }
        );
      }

      existingCompany.location.push(locationObj);
      await existingCompany.save();

      return NextResponse.json(
        {
          message: "Company location added successfully",
          company: existingCompany,
        },
        { status: 200 }
      );
    }

    const newCompany = new ManageCompany({
      name,
      category,
      location: [locationObj],
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

// ✅ Get All Companies
export async function GET() {
  try {
    const companies = await ManageCompany.find();
    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /managecompany:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
