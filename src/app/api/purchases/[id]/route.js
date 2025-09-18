import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import Purchase from "@/models/Purchase";

await connectDB();

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const purchase = await Purchase.findById(params.id);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    return NextResponse.json({ purchase }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch purchase" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await Purchase.findByIdAndUpdate(params.id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Purchase updated successfully", purchase: updated },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const deleted = await Purchase.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Purchase deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 });
  }
}
