import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompanyGroup from "@/models/CompanyGroup";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";
import { validateCompanyGroupInput } from "@/lib/companyGroupUtils";

export async function GET(req, { params }) {
  const limited = rateLimitGuard(req, "read");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    await connectDB();
    const group = await CompanyGroup.findById(id)
      .populate("companies", "name")
      .lean();

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    console.error("GET /groups/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const input = await req.json();
    await connectDB();

    const groupData = await validateCompanyGroupInput(input, id);
    if (groupData.error) {
      return NextResponse.json(
        { error: groupData.error },
        { status: 400 },
      );
    }

    const duplicate = await CompanyGroup.findOne({
      _id: { $ne: id },
      name: groupData.name,
    })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (duplicate) {
      return NextResponse.json(
        { error: "Another group with this name already exists" },
        { status: 409 },
      );
    }

    const group = await CompanyGroup.findByIdAndUpdate(id, groupData, {
      new: true,
      runValidators: true,
    }).populate("companies", "name");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Group updated successfully", group },
      { status: 200 },
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "Another group with this name already exists" },
        { status: 409 },
      );
    }
    console.error("PUT /groups/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    await connectDB();
    const group = await CompanyGroup.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Group deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /groups/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 },
    );
  }
}
