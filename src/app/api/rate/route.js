import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import { verifyApiKey } from "@/middleware/apiKeyMiddleware/apiKeyMiddleware";
import { emitNotification } from "@/lib/socket";

export async function POST(req) {
  try {
    await connectDB();
    if (!verifyApiKey(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      company,
      location,
      newRate,
      mobile,
      commodity,
      quantity,
      payment,
      others,
    } = body;

    const cleanCompany = String(company || "").trim();
    const cleanLocation = String(location || "").trim();
    const cleanCommodity = String(commodity || "").trim();

    if (!cleanCompany || !cleanLocation || !cleanCommodity || newRate === undefined || newRate === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let rateEntry = await Rate.findOne({ 
      company: cleanCompany, 
      location: cleanLocation, 
      commodity: cleanCommodity 
    });

    if (rateEntry) {
      // Ensure oldRates is an array
      if (!Array.isArray(rateEntry.oldRates)) {
        rateEntry.oldRates = [];
      }

      // If the last update was not today, move the current rate to oldRates
      const lastUpdated = rateEntry.newRateDate ? new Date(rateEntry.newRateDate) : null;
      if (lastUpdated && !isNaN(lastUpdated.getTime())) {
        lastUpdated.setHours(0, 0, 0, 0);
        
        if (lastUpdated.getTime() !== today.getTime() && rateEntry.newRate !== undefined && rateEntry.newRate !== null) {
          rateEntry.oldRates.push({
            rate: rateEntry.newRate,
            date: rateEntry.newRateDate,
          });
        }
      }

      rateEntry.newRate = Number(newRate);
      rateEntry.newRateDate = today;
      rateEntry.mobile = mobile || rateEntry.mobile;
      rateEntry.quantity = quantity !== undefined ? Number(quantity) : rateEntry.quantity;
      rateEntry.payment = payment !== undefined ? String(payment) : rateEntry.payment;
      rateEntry.others = others !== undefined ? String(others) : rateEntry.others;

      await rateEntry.save();

      try {
        emitNotification({
          type: "rate",
          data: {
            company: rateEntry.company,
            location: rateEntry.location,
            commodity: rateEntry.commodity,
            rate: rateEntry.newRate,
            date: rateEntry.newRateDate,
            updateTime: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          },
        });
      } catch (err) {
        console.warn("Failed to emit notification:", err);
      }

      return NextResponse.json(
        { message: "Rate updated successfully!" },
        { status: 200 },
      );
    }

    // Create new rate entry
    rateEntry = new Rate({
      company: cleanCompany,
      location: cleanLocation,
      commodity: cleanCommodity,
      newRate: Number(newRate),
      newRateDate: today,
      oldRates: [],
      mobile,
      quantity: quantity !== undefined ? Number(quantity) : 0,
      payment: payment !== undefined ? String(payment) : "",
      others: others !== undefined ? String(others) : "",
    });

    await rateEntry.save();

    emitNotification({
      type: "rate",
      data: {
        company: rateEntry.company,
        location: rateEntry.location,
        commodity: rateEntry.commodity,
        rate: rateEntry.newRate,
        date: rateEntry.newRateDate,
        updateTime: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      },
    });

    return NextResponse.json(
      { message: "Rate saved successfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/rate:", error);
    return NextResponse.json({ 
      error: "Error saving rate", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const commodity = searchParams.get("commodity");
    const todayOnly = searchParams.get("todayOnly") === "true";
    const minimal = searchParams.get("minimal") === "true";

    const query = {};
    if (company && company !== "all") query.company = company;
    if (commodity && commodity !== "all") query.commodity = commodity;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dbQuery = {
      ...query,
      ...(todayOnly ? { newRateDate: { $gte: today } } : {}),
    };

    const selectFields = minimal
      ? "company location commodity newRate newRateDate updateTime"
      : "company location commodity oldRates newRate newRateDate quantity payment others updateTime mobile";

    const rates = await Rate.find(dbQuery).select(selectFields).lean();

    const formattedRates = rates.map((rate) => {
      const lastUpdated = new Date(rate.newRateDate);
      lastUpdated.setHours(0, 0, 0, 0);
      const isToday = lastUpdated.getTime() === today.getTime();

      if (minimal) {
        return {
          company: rate.company,
          location: rate.location,
          commodity: rate.commodity,
          newRate: isToday ? rate.newRate : "",
          lastUpdated: isToday ? rate.newRateDate : null,
          updateTime: rate.updateTime || "",
          hasNewRateToday: isToday,
        };
      }

      const oldRatesFormatted = (Array.isArray(rate.oldRates) ? rate.oldRates : []).map(
        (old) =>
          `${old.rate} (${old.date ? new Date(old.date).toLocaleDateString("en-GB") : "Unknown"})`,
      );

      return {
        company: rate.company,
        location: rate.location,
        commodity: rate.commodity,
        oldRates: oldRatesFormatted,
        newRate: isToday ? rate.newRate : "",
        quantity: isToday ? (rate.quantity ?? "") : "",
        payment: isToday ? (rate.payment ?? "") : "",
        others: isToday ? (rate.others ?? "") : "",
        hasNewRateToday: isToday,
        lastUpdated: isToday
          ? rate.newRateDate
          : rate.oldRates.at(-1)?.date || null,
        updateTime: rate.updateTime || "",
        mobile: rate.mobile || "",
      };
    });

    return NextResponse.json(formattedRates, { status: 200 });
  } catch (error) {
    console.error("Error in GET /rate:", error);
    return NextResponse.json(
      { error: "Error fetching rates" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    if (!verifyApiKey(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      company,
      location,
      newRate,
      mobile,
      commodity,
      quantity,
      payment,
      others,
    } = body;

    const cleanCompany = String(company || "").trim();
    const cleanLocation = String(location || "").trim();
    const cleanCommodity = String(commodity || "").trim();

    if (!cleanCompany || !cleanLocation || !cleanCommodity || newRate === undefined || newRate === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const rateToUpdate = await Rate.findOne({ 
      company: cleanCompany, 
      location: cleanLocation, 
      commodity: cleanCommodity 
    });

    if (!rateToUpdate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure oldRates is an array
    if (!Array.isArray(rateToUpdate.oldRates)) {
      rateToUpdate.oldRates = [];
    }

    // If the last update was not today, move the current rate to oldRates
    const lastUpdated = rateToUpdate.newRateDate ? new Date(rateToUpdate.newRateDate) : null;
    if (lastUpdated && !isNaN(lastUpdated.getTime())) {
      lastUpdated.setHours(0, 0, 0, 0);
      
      if (lastUpdated.getTime() !== today.getTime() && rateToUpdate.newRate !== undefined && rateToUpdate.newRate !== null) {
        rateToUpdate.oldRates.push({
          rate: rateToUpdate.newRate,
          date: rateToUpdate.newRateDate,
        });
      }
    }

    rateToUpdate.newRate = Number(newRate);
    rateToUpdate.newRateDate = today;
    rateToUpdate.mobile = mobile || rateToUpdate.mobile;
    rateToUpdate.quantity = quantity !== undefined ? Number(quantity) : rateToUpdate.quantity;
    rateToUpdate.payment = payment !== undefined ? String(payment) : rateToUpdate.payment;
    rateToUpdate.others = others !== undefined ? String(others) : rateToUpdate.others;

    await rateToUpdate.save();

    return NextResponse.json(
      { message: "Rate updated successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in PUT /api/rate:", error);
    return NextResponse.json({ 
      error: "Error updating rate", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await Rate.deleteMany();
    return NextResponse.json(
      { message: "All rates deleted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETE /rate:", error);
    return NextResponse.json(
      { error: "Error deleting rates" },
      { status: 500 },
    );
  }
}
