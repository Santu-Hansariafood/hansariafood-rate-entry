import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompanyGroup from "@/models/CompanyGroup";
import ManageCompany from "@/models/ManageCompany";
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
    const includeLocations = searchParams.get("includeLocations") === "true";

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
    let groups = await CompanyGroup.find(filter)
      .populate("companies", "name")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (includeLocations && groups.length > 0) {
      const companyNames = [
        ...new Set(
          groups.flatMap((group) =>
            (group.companies || [])
              .map((company) => company?.name?.trim())
              .filter(Boolean),
          ),
        ),
      ];
      const managedCompanies = await ManageCompany.find({
        name: {
          $in: companyNames.map(
            (name) => new RegExp(`^${escapeRegex(name)}$`, "i"),
          ),
        },
      })
        .select("name location")
        .lean();
      const locationsByCompany = new Map();

      managedCompanies.forEach((company) => {
        const key = company.name.trim().toLocaleLowerCase();
        const locations = locationsByCompany.get(key) || new Set();
        (company.location || []).forEach((location) => {
          if (location?.trim()) locations.add(location.trim());
        });
        locationsByCompany.set(key, locations);
      });

      groups = groups.map((group) => ({
        ...group,
        companies: (group.companies || []).map((company) => {
          const key = company?.name?.trim().toLocaleLowerCase();
          return {
            ...company,
            locations: [...(locationsByCompany.get(key) || [])],
          };
        }),
      }));
    }

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
