export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/mongodb";
import Location from "@/models/Location";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { state, name } = await req.json();
    const { id } = await params;

    if (!state || !name) {
      return NextResponse.json(
        { error: "State and location name are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { state, name },
      { new: true },
    );

    if (!updatedLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Location updated successfully", location: updatedLocation },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /location/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Location deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /location/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 },
    );
  }
}

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const location = await Location.findById(id);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ location }, { status: 200 });
  } catch (error) {
    console.error("GET /location/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}
