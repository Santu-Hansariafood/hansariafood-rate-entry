import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TagSauda from "@/models/TagSauda";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const entry = await TagSauda.findOne({ saudaNo: id });
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const updated = await TagSauda.findOneAndUpdate(
      { saudaNo: id },
      { ...body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Tag sauda updated successfully", entry: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /tag-sauda/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await TagSauda.findOneAndDelete({ saudaNo: id });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
