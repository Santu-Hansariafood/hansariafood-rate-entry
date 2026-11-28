import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { rateLimitGuard } from "@/lib/apiUtils";
import {
  getGroupNamesByCompanyNames,
  normalizeGroupCompanyName,
} from "@/lib/companyGroupNotifications";

export async function GET(req) {
  const limited = rateLimitGuard(req, "read");
  if (limited) return limited;

  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const entries = await SaudaEntry.find({ date });
    const groupNamesByCompany = await getGroupNamesByCompanyNames(
      entries.map((entry) => entry.company),
    );
    const entriesWithGroups = entries.map((entry) => ({
      ...entry.toJSON(),
      groupNames:
        groupNamesByCompany.get(
          normalizeGroupCompanyName(entry.company),
        ) || [],
    }));

    return NextResponse.json({ entries: entriesWithGroups }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /sauda/get-by-date:", error);
    return NextResponse.json(
      { error: "Error fetching sauda entries" },
      { status: 500 },
    );
  }
}
