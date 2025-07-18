import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SaudaEntry from "@/models/SaudaEntry";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    const entries = await SaudaEntry.find({}, "saudaEntries").lean();

    const descriptionsSet = new Set();

    entries.forEach((entry) => {
      const saudaEntriesMap = entry.saudaEntries || {};
      Object.values(saudaEntriesMap).forEach((list) => {
        list.forEach((item) => {
          if (item.description?.trim()) {
            descriptionsSet.add(item.description.trim());
          }
        });
      });
    });

    const suggestions = [...descriptionsSet]
      .filter((desc) => desc.toLowerCase().includes(query))
      .slice(0, 10);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Suggestion fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
