import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import ManageCompany from "@/models/ManageCompany";
import RateTaken from "@/models/RateTaken";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";

export const dynamic = "force-dynamic";
const TRACKER_ID = "daily-rate-taken";

const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

const getTodayDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getDailyRecord = async (date) => {
  let record = await RateTaken.findById(TRACKER_ID);

  if (!record) {
    try {
      record = await RateTaken.create({
        _id: TRACKER_ID,
        date,
        companyIds: [],
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      record = await RateTaken.findById(TRACKER_ID);
    }
  }

  if (record.date !== date) {
    await RateTaken.updateOne(
      { _id: TRACKER_ID, date: record.date },
      { $set: { date, companyIds: [] } }
    );
    record = await RateTaken.findById(TRACKER_ID);
  }

  return record;
};

export async function GET(req) {
  const limited = rateLimitGuard(req, "read");
  if (limited) return limited;

  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new URL(req.url).searchParams.get("date");
  if (!isValidDate(date) || date !== getTodayDate()) {
    return NextResponse.json(
      { error: "The current date in YYYY-MM-DD format is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const record = await getDailyRecord(date);
    return NextResponse.json(
      {
        date,
        companyIds: (record?.companyIds || []).map((companyId) =>
          companyId.toString()
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/rate-taken error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate-taken status" },
      { status: 500 }
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
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { date, companyId, taken } = body;
    if (
      !isValidDate(date) ||
      date !== getTodayDate() ||
      !mongoose.isValidObjectId(companyId) ||
      typeof taken !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "The current date, a valid companyId, and taken status are required",
        },
        { status: 400 }
      );
    }

    await connectDB();
    const companyExists = await ManageCompany.exists({
      _id: companyId,
      type: "buyer",
    });
    if (!companyExists) {
      return NextResponse.json(
        { error: "Buyer company not found" },
        { status: 404 }
      );
    }

    await getDailyRecord(date);

    const filter = { _id: TRACKER_ID, date };
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    if (taken) {
      await RateTaken.updateOne(filter, {
        $addToSet: { companyIds: companyObjectId },
      });
    } else {
      await RateTaken.updateOne(filter, {
        $pull: { companyIds: companyObjectId },
      });
    }

    const record = await RateTaken.findById(TRACKER_ID)
      .select("date companyIds")
      .lean();
    return NextResponse.json(
      {
        date: record.date,
        companyIds: (record.companyIds || []).map((id) => id.toString()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/rate-taken error:", error);
    return NextResponse.json(
      { error: "Failed to update rate-taken status" },
      { status: 500 }
    );
  }
}
