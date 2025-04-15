import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { state, name } = await req.json();
    if (!state || !name) {
      return NextResponse.json(
        { error: "State and location name are required" },
        { status: 400 }
      );
    }

    const existingLocation = await Location.findOne({ state, name });
    if (existingLocation) {
      return NextResponse.json(
        { error: "Location already exists in this state" },
        { status: 409 }
      );
    }

    const newLocation = new Location({ state, name });
    await newLocation.save();

    return NextResponse.json(
      { message: "Location created successfully", location: newLocation },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create location" },
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      Location.find().sort({ name: 1 }).skip(skip).limit(limit),
      Location.countDocuments(),
    ]);

    return NextResponse.json(
      {
        locations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
