import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";

await connectDB();

export async function POST(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { company, location, newRate } = await req.json();
    if (!company || !location || newRate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let rateEntry = await Rate.findOne({ company, location });

    if (rateEntry) {
      const lastUpdated = new Date(rateEntry.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);

      if (lastUpdated.getTime() !== today.getTime()) {
        if (rateEntry.newRate) {
          rateEntry.oldRates.push({
            rate: rateEntry.newRate,
            date: rateEntry.newRateDate,
          });
        }
      }

      rateEntry.newRate = newRate;
      rateEntry.newRateDate = today;
      await rateEntry.save();

      return NextResponse.json(
        { message: "Rate updated successfully!", updatedRate: rateEntry },
        { status: 200 }
      );
    }

    rateEntry = new Rate({
      company,
      location,
      newRate,
      newRateDate: today,
      oldRates: [],
    });
    await rateEntry.save();

    return NextResponse.json(
      { message: "Rate saved successfully!", newRate: rateEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /rates:", error);
    return NextResponse.json({ error: "Error saving rate" }, { status: 500 });
  }
}

export async function GET(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");

    let rates = company ? await Rate.find({ company }) : await Rate.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedRates = rates.map((rate) => {
      const lastUpdated = new Date(rate.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);
      const isToday = lastUpdated.getTime() === today.getTime();

      const oldRatesFormatted = rate.oldRates.map(
        (old) =>
          `${old.rate} (${new Date(old.date).toLocaleDateString("en-GB")})`
      );

      return {
        company: rate.company,
        location: rate.location,
        oldRates: oldRatesFormatted,
        newRate: isToday ? rate.newRate : "",
        hasNewRateToday: isToday,
        lastUpdated: isToday
          ? rate.newRateDate
          : rate.oldRates.at(-1)?.date || null,
        updateTime: rate.updateTime || "",
      };
    });

    return NextResponse.json(formattedRates, { status: 200 });
  } catch (error) {
    console.error("Error in GET /rates:", error);
    return NextResponse.json(
      { error: "Error fetching rates" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { company, location, newRate } = await req.json();
    if (!company || !location || newRate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rateToUpdate = await Rate.findOne({ company, location });
    if (!rateToUpdate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    rateToUpdate.newRate = newRate;
    rateToUpdate.newRateDate = new Date();
    await rateToUpdate.save();

    return NextResponse.json(
      { message: "Rate updated successfully!", updatedRate: rateToUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /rates:", error);
    return NextResponse.json({ error: "Error updating rate" }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await Rate.deleteMany();
    return NextResponse.json(
      { message: "All rates deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /rates:", error);
    return NextResponse.json(
      { error: "Error deleting rates" },
      { status: 500 }
    );
  }
}
