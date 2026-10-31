import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";

export async function PUT(req, { params }) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { isMDOCVisible } = await req.json();

    if (typeof isMDOCVisible !== "boolean") {
      return NextResponse.json(
        { error: "Invalid visibility value" },
        { status: 400 },
      );
    }

    const company = await ManageCompany.findByIdAndUpdate(
      id,
      { isMDOCVisible },
      { new: true },
    ).select("_id name isMDOCVisible");

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "MDOC visibility updated",
      company,
    });
  } catch (error) {
    console.error("Visibility update error:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 },
    );
  }
}
