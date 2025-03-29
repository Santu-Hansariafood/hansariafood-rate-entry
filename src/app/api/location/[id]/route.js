import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { state, name } = await req.json();
    if (!state || !name) {
      return NextResponse.json(
        { error: "State and location name are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedLocation = await Location.findByIdAndUpdate(
      params.id,
      { state, name },
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
