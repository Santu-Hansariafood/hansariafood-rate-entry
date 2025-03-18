import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";

// ✅ READ LOCATION BY ID (GET)
export async function GET(req, { params }) {
  try {
    await connectDB();
    const location = await Location.findById(params.id);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ location }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE LOCATION (PUT)
export async function PUT(req, { params }) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedLocation = await Location.findByIdAndUpdate(
      params.id,
      { name },
      { new: true }
    );

    if (!updatedLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Location updated successfully", location: updatedLocation },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// ✅ DELETE LOCATION (DELETE)
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deletedLocation = await Location.findByIdAndDelete(params.id);

    if (!deletedLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Location deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
