
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Freight from "@/models/Freight";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { freightRate, ...otherUpdates } = body;

    const existingFreight = await Freight.findById(id);
    if (!existingFreight) {
      return NextResponse.json(
        { success: false, error: "Freight not found" },
        { status: 404 }
      );
    }

    let updates = { ...otherUpdates };
    
    // If rate is changing, update previousRate
    if (freightRate !== undefined && freightRate !== existingFreight.freightRate) {
      updates.freightRate = freightRate;
      updates.previousRate = existingFreight.freightRate;
    } else if (freightRate !== undefined) {
        updates.freightRate = freightRate;
    }

    const updatedFreight = await Freight.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate("company", "name")
      .populate("deliveryCompany", "name");

    return NextResponse.json({
      success: true,
      message: "Freight updated successfully",
      freight: updatedFreight,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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

    const deletedFreight = await Freight.findByIdAndDelete(id);

    if (!deletedFreight) {
      return NextResponse.json(
        { success: false, error: "Freight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Freight deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
