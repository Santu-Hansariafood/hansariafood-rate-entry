import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { connectDB } from "@/lib/mongodb";
import Commodity from "@/models/Commodity";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Commodity name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedCommodity = await Commodity.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedCommodity) {
      return NextResponse.json(
        { error: "Commodity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Commodity updated", commodity: updatedCommodity },
      { status: 200 }
    );
  } catch {
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
    const { id } = params;

    await connectDB();

    const deletedCommodity = await Commodity.findByIdAndDelete(id);

    if (!deletedCommodity) {
      return NextResponse.json(
        { error: "Commodity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Commodity deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete commodity" },
      { status: 500 }
    );
  }
}
