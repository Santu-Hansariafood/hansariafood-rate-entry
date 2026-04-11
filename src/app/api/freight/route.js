import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Freight from "@/models/Freight";
import ManageCompany from "@/models/ManageCompany";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get("commodity");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const createdBy = searchParams.get("createdBy");
    const getCreators = searchParams.get("getCreators");

    if (getCreators) {
      const creators = await Freight.distinct("createdBy");
      return NextResponse.json({
        success: true,
        creators: creators.filter(Boolean),
      });
    }

    const query = {};
    if (commodity) {
      query.commodity = commodity;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (search) {
      const companyIds = await ManageCompany.find({
        name: { $regex: search, $options: "i" },
      }).distinct("_id");

      query.$or = [
        { location: { $regex: search, $options: "i" } },
        { deliveryLocation: { $regex: search, $options: "i" } },
        { company: { $in: companyIds } },
        { deliveryCompany: { $in: companyIds } },
      ];
    }

    const skip = (page - 1) * limit;

    const [freights, total] = await Promise.all([
      Freight.find(query)
        .populate("company", "name")
        .populate("deliveryCompany", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Freight.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      freights,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const {
      commodity,
      company,
      location,
      deliveryCompany,
      deliveryLocation,
      freightRate,
      createdBy,
    } = body;

    if (
      !commodity ||
      !company ||
      !location ||
      !deliveryCompany ||
      !deliveryLocation ||
      !freightRate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newFreight = await Freight.create({
      commodity,
      company,
      location,
      deliveryCompany,
      deliveryLocation,
      freightRate,
      previousRate: freightRate,
      createdBy,
    });

    const populatedFreight = await Freight.findById(newFreight._id)
      .populate("company", "name")
      .populate("deliveryCompany", "name");

    return NextResponse.json({
      success: true,
      message: "Freight added successfully",
      freight: populatedFreight,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
