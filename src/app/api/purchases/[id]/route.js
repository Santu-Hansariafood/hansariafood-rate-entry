export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import Purchase from "@/models/Purchase";

// ⛔ Ensure DB connects only ONCE (fixes Mongo timeout on build)
async function initDB() {
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
initDB();

// ======================================
// ✅ GET SINGLE PURCHASE BY ID
// ======================================
export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const purchase = await Purchase.findById(params.id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchase }, { status: 200 });
  } catch (err) {
    console.error("❌ GET /purchases/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch purchase", detail: err.message },
      { status: 500 }
    );
  }
}

// ======================================
// ✅ UPDATE PURCHASE BY ID
// ======================================
export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updated = await Purchase.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Purchase updated successfully", purchase: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ PUT /purchases/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update purchase", detail: err.message },
      { status: 500 }
    );
  }
}

// ======================================
// ✅ DELETE PURCHASE BY ID
// ======================================
export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await Purchase.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Purchase deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ DELETE /purchases/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete purchase", detail: err.message },
      { status: 500 }
    );
  }
}
