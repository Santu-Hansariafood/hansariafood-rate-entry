import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";

// ✅ CREATE LOCATION (POST)
export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return NextResponse.json(
        { error: "Location already exists" },
        { status: 409 }
      );
    }

    const newLocation = new Location({ name });
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

// ✅ READ ALL LOCATIONS (GET)
export async function GET() {
  try {
    await connectDB();
    const locations = await Location.find({});
    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
