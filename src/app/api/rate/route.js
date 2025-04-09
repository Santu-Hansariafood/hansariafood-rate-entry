import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";

await connectDB();

export async function POST(req) {
  try {
    const { company, location, newRate } = await req.json();
    if (!company || !location || newRate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let rateEntry = await Rate.findOne({ company, location });

    if (rateEntry) {
      rateEntry.newRate = newRate;
      await rateEntry.save();
      return NextResponse.json(
        { message: "Rate updated successfully!", updatedRate: rateEntry },
        { status: 200 }
      );
    }

    const newEntry = new Rate({
      company,
      location,
      newRate,
      newRateDate: new Date(),
      oldRates: [],
    });

    await newEntry.save();

    return NextResponse.json(
      { message: "Rate created successfully!", newRate: newEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /rate:", error);
    return NextResponse.json({ error: "Error saving rate" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");

    let rates = company
      ? await Rate.find({ company })
      : await Rate.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedRates = rates.map((rate) => {
      const lastUpdated = new Date(rate.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);

      const isToday = lastUpdated.getTime() === today.getTime();

      return {
        company: rate.company,
        location: rate.location,
        newRate: rate.newRate,
        newRateDate: rate.newRateDate,
        oldRates: rate.oldRates.map(
          (entry) =>
            `${entry.rate} (${new Date(entry.date).toLocaleDateString("en-GB")})`
        ),
        hasNewRateToday: isToday,
      };
    });

    return NextResponse.json(formattedRates, { status: 200 });
  } catch (error) {
    console.error("Error in GET /rate:", error);
    return NextResponse.json({ error: "Error fetching rates" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await Rate.deleteMany();
    return NextResponse.json(
      { message: "All rates deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /rate:", error);
    return NextResponse.json(
      { error: "Error deleting rates" },
      { status: 500 }
    );
  }
}
