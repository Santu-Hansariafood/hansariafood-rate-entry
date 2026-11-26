import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompanyGroup from "@/models/CompanyGroup";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";
import {
  escapeRegex,
  validateCompanyGroupInput,
} from "@/lib/companyGroupUtils";

export async function GET(req) {
  const limited = rateLimitGuard(req, "read");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const requestedPage = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search")?.trim() || "";

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return NextResponse.json(
        { error: "Page and limit must be valid positive integers" },
        { status: 400 },
      );
    }

    const filter = search
      ? { name: { $regex: escapeRegex(search), $options: "i" } }
      : {};
    const total = await CompanyGroup.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const page =
      totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
    const groups = await CompanyGroup.find(filter)
      .populate("companies", "name")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      { groups, total, page, totalPages },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /groups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const limited = rateLimitGuard(req, "write");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = await req.json();
    await connectDB();

    const groupData = await validateCompanyGroupInput(input);
    if (groupData.error) {
      return NextResponse.json(
        { error: groupData.error },
        { status: 400 },
      );
    }

    const duplicate = await CompanyGroup.findOne({ name: groupData.name })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (duplicate) {
      return NextResponse.json(
        { error: "A group with this name already exists" },
        { status: 409 },
      );
    }

    const group = await CompanyGroup.create(groupData);
    await group.populate("companies", "name");

    return NextResponse.json(
      { message: "Group created successfully", group },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "A group with this name already exists" },
        { status: 409 },
      );
    }
    console.error("POST /groups error:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 },
    );
  }
}
