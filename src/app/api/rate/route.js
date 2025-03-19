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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastUpdated = new Date(rateEntry.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);

      // Move old rate to history if the date has changed
      if (lastUpdated < today) {
        rateEntry.oldRates.push({
          rate: rateEntry.newRate,
          date: rateEntry.newRateDate,
        });
      }

      // Update with new rate
      rateEntry.newRate = newRate;
      rateEntry.newRateDate = today;
      await rateEntry.save();
      return NextResponse.json(
        { message: "Rate updated successfully!", updatedRate: rateEntry },
        { status: 200 }
      );
    }

    // Create a new rate entry
    rateEntry = new Rate({
      company,
      location,
      newRate,
      newRateDate: new Date(),
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
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");

    let rates = company ? await Rate.find({ company }) : await Rate.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedRates = rates.map((rate) => {
      const lastUpdated = new Date(rate.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);

      return {
        company: rate.company,
        location: rate.location,
        oldRates: rate.oldRates.map(
          (old) =>
            `${old.rate} (${new Date(old.date).toLocaleDateString("en-GB")})`
        ),
        newRate:
          lastUpdated.getTime() === today.getTime()
            ? `${rate.newRate} (${new Date(rate.newRateDate).toLocaleDateString(
                "en-GB"
              )})`
            : "", // Empty if it's not today's rate
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

    rateToUpdate.newRate = newRate; // The pre-save hook in the model will handle oldRates update
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

export async function DELETE() {
  try {
    await Rate.deleteMany(); // Deletes all rates
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
