import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TagSauda from "@/models/TagSauda";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allTags = await TagSauda.find().sort({ createdAt: -1 });
    return NextResponse.json(allTags, { status: 200 });
  } catch (error) {
    console.error("Error in GET /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.saudaNo || !body.date || !body.unit || !body.commodity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const created = await TagSauda.create(body);

    return NextResponse.json(
      { message: "Tag sauda created successfully", entry: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /tag-sauda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
