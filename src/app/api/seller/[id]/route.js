import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Seller from "@/models/Seller";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

// GET /api/seller/:id
export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const seller = await Seller.findById(id);

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(seller, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch seller", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/seller/:id
export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { sellerName, companies } = await req.json();

    const sellerNameTrimmed = sellerName?.trim();
    if (!sellerNameTrimmed) {
      return NextResponse.json({ error: "Seller name is required" }, { status: 400 });
    }

    if (!companies || !Array.isArray(companies) || companies.some((c) => !c.trim())) {
      return NextResponse.json({ error: "All company names are required" }, { status: 400 });
    }

    const existingSeller = await Seller.findOne({
      sellerName: sellerNameTrimmed,
      _id: { $ne: id },
    });

    if (existingSeller) {
      return NextResponse.json({ error: "Seller name already exists" }, { status: 400 });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      id,
      { sellerName: sellerNameTrimmed, companies: companies.map((c) => c.trim()) },
      { new: true, runValidators: true }
    );

    if (!updatedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Seller updated", updatedSeller }, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Seller name must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update seller", details: error.message }, { status: 500 });
  }
}

// DELETE /api/seller/:id
export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const deletedSeller = await Seller.findByIdAndDelete(id);

    if (!deletedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Seller deleted", deletedSeller }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete seller", details: error.message }, { status: 500 });
  }
}
