import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export async function PUT(req, { params }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { isDDGSVisible } = await req.json();

    if (typeof isDDGSVisible !== "boolean") {
      return NextResponse.json(
        { error: "Invalid visibility value" },
        { status: 400 }
      );
    }

    const company = await ManageCompany.findByIdAndUpdate(
      id,
      { isDDGSVisible },
      { new: true }
    ).select("_id name isDDGSVisible");

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "DDGS visibility updated",
      company,
    });
  } catch (error) {
    console.error("Visibility update error:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}
