import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, subcommodities } = await req.json();

    await connectDB();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Commodity name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const duplicate = await Commodity.findOne({
      _id: { $ne: id },
      name: trimmedName,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another commodity with this name already exists" },
        { status: 409 }
      );
    }

    const commodity = await Commodity.findById(id);
    if (!commodity) {
      return NextResponse.json(
        { error: "Commodity not found" },
        { status: 404 }
      );
    }

    commodity.name = trimmedName;

    if (Array.isArray(subcommodities)) {
      commodity.subcommodities = subcommodities
        .map((s) => s?.trim())
        .filter((s) => s && s.length > 0);
    }

    await commodity.save();

    return NextResponse.json(
      {
        message: "Commodity updated successfully",
        commodity,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /commodity/:id error:", err);
    return NextResponse.json(
      { error: "Failed to update commodity" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await connectDB();

    const deletedCommodity = await Commodity.findByIdAndDelete(id);

    if (!deletedCommodity) {
      return NextResponse.json(
        { error: "Commodity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Commodity deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /commodity/:id error:", err);
    return NextResponse.json(
      { error: "Failed to delete commodity" },
      { status: 500 }
    );
  }
}
