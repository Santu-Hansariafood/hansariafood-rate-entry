import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { state, name } = await req.json();
    if (!state || !name) {
      return NextResponse.json(
        { error: "State and location name are required" },
        { status: 400 }
      );
    }

    await connectDB();

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
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

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
