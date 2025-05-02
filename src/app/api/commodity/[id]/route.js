import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";
import { NextResponse } from "next/server";

// PUT - Update Commodity (e.g., /api/commodities/[id])
export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { name, subCategories } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Commodity name is required" }, { status: 400 });
    }

    await connectDB();

    const existingCommodity = await Commodity.findById(id);
    if (!existingCommodity) {
      return NextResponse.json({ error: "Commodity not found" }, { status: 404 });
    }

    const trimmedName = name.trim();
    const trimmedSubCategories = Array.isArray(subCategories)
      ? subCategories.map((s) => s.trim()).filter(Boolean)
      : [];

    // Merge sub-categories (no duplicates)
    const mergedSubCategories = Array.from(
      new Set([...existingCommodity.subCategories, ...trimmedSubCategories])
    );

    existingCommodity.name = trimmedName;
    existingCommodity.subCategories = mergedSubCategories;

    await existingCommodity.save();

    return NextResponse.json(
      { message: "Commodity updated", commodity: existingCommodity },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /commodity error:", err);
    return NextResponse.json({ error: "Failed to update commodity" }, { status: 500 });
  }
}

// DELETE - Delete Commodity (e.g., /api/commodities/[id])
export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    await connectDB();

    const deletedCommodity = await Commodity.findByIdAndDelete(id);

    if (!deletedCommodity) {
      return NextResponse.json({ error: "Commodity not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Commodity deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /commodity error:", err);
    return NextResponse.json({ error: "Failed to delete commodity" }, { status: 500 });
  }
}
