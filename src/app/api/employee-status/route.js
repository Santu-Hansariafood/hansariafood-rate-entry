import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmployeeStatus from "@/models/EmployeeStatus";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

const ALLOWED_STATUS = ["active", "busy", "not_available"];

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");
    const excludeMobile = searchParams.get("excludeMobile");
    const nonActiveOnly = searchParams.get("nonActiveOnly") === "true";

    const filter = {};
    if (mobile) {
      filter.mobile = mobile;
    } else if (excludeMobile) {
      filter.mobile = { $ne: excludeMobile };
    }

    const rawStatuses = await EmployeeStatus.find(filter)
      .select("mobile name status updatedAt loginAt")
      .sort({ name: 1, mobile: 1 })
      .limit(200)
      .lean();

    const now = Date.now();
    const INACTIVE_MS = 10 * 60 * 1000;

    let statuses = rawStatuses.map((s) => {
      const updated = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
      const isStale = !updated || now - updated > INACTIVE_MS;

      let effectiveStatus = "not_logged_in";

      if (s.status === "not_available") {
        effectiveStatus = "not_logged_in";
      } else if (isStale) {
        effectiveStatus = "away";
      } else if (s.status === "active") {
        effectiveStatus = "available";
      } else if (s.status === "busy") {
        effectiveStatus = "busy";
      }

      let onlineMinutes = null;
      let onlineLabel = "";

      if (s.loginAt && effectiveStatus !== "not_logged_in") {
        const loginTime = new Date(s.loginAt).getTime();
        if (!Number.isNaN(loginTime)) {
          const diffMinutes = Math.floor((now - loginTime) / (60 * 1000));
          if (diffMinutes <= 0) {
            onlineMinutes = 0;
            onlineLabel = "Just now";
          } else if (diffMinutes < 60) {
            onlineMinutes = diffMinutes;
            onlineLabel = `${diffMinutes} min`;
          } else {
            const hours = Math.floor(diffMinutes / 60);
            const mins = diffMinutes % 60;
            onlineMinutes = diffMinutes;
            onlineLabel = mins ? `${hours}h ${mins}m` : `${hours}h`;
          }
        }
      }

      return {
        ...s,
        effectiveStatus,
        onlineMinutes,
        onlineLabel,
      };
    });

    if (nonActiveOnly) {
      statuses = statuses.filter((s) => s.effectiveStatus !== "available");
    }

    return NextResponse.json(statuses, { status: 200 });
  } catch (error) {
    console.error("GET /employee-status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee status" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { mobile, name, status, loginEvent } = await req.json();

    if (!mobile || !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: "Mobile and valid status are required" },
        { status: 400 }
      );
    }

    const update = {
      status,
      updatedAt: new Date(),
      ...(name ? { name } : {}),
    };

    if (status === "active" && loginEvent) {
      update.loginAt = new Date();
    }

    if (status === "not_available") {
      update.loginAt = null;
    }

    const updated = await EmployeeStatus.findOneAndUpdate(
      { mobile },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .select("mobile name status updatedAt loginAt")
      .lean();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("POST /employee-status error:", error);
    return NextResponse.json(
      { error: "Failed to update employee status" },
      { status: 500 }
    );
  }
}
