import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rate from "@/models/Rate";
import RateHistory from "@/models/RateHistory";
import ManageCompany from "@/models/ManageCompany";
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
    const todayStr = today.toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // --- Update Rate Model ---
    let rateEntry = await Rate.findOne({ 
      company: cleanCompany, 
      location: cleanLocation, 
      commodity: cleanCommodity 
    });

    const numericNewRate = Number(newRate);
    if (isNaN(numericNewRate)) {
      return NextResponse.json(
        { error: "Invalid newRate value. Must be a number." },
        { status: 400 },
      );
    }

    if (rateEntry) {
      if (!Array.isArray(rateEntry.oldRates)) {
        rateEntry.oldRates = [];
      }

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

      rateEntry.newRate = numericNewRate;
      rateEntry.newRateDate = today;
      rateEntry.mobile = mobile || rateEntry.mobile;
      
      const numericQuantity = Number(quantity);
      rateEntry.quantity = isNaN(numericQuantity) ? (rateEntry.quantity || 0) : numericQuantity;
      
      rateEntry.payment = payment !== undefined ? String(payment) : rateEntry.payment;
      rateEntry.others = others !== undefined ? String(others) : rateEntry.others;

      await rateEntry.save();
    } else {
      const numericQuantity = Number(quantity);
      rateEntry = new Rate({
        company: cleanCompany,
        location: cleanLocation,
        commodity: cleanCommodity,
        newRate: numericNewRate,
        newRateDate: today,
        oldRates: [],
        mobile,
        quantity: isNaN(numericQuantity) ? 0 : numericQuantity,
        payment: payment !== undefined ? String(payment) : "",
        others: others !== undefined ? String(others) : "",
      });
      await rateEntry.save();
    }

    // --- Update RateHistory Model (for notifications and history) ---
    try {
      // Escape special regex characters in cleanCompany
      const escapedCompany = cleanCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const companyDoc = await ManageCompany.findOne({ 
        name: { $regex: new RegExp(`^${escapedCompany}$`, 'i') } 
      });

      if (companyDoc) {
        // Prepare numeric values safely
        const numericRate = Number(newRate);
        if (isNaN(numericRate)) {
          throw new Error(`Invalid rate value: ${newRate}`);
        }

        const historyDoc = await RateHistory.findOne({
          companyId: companyDoc._id,
          location: cleanLocation,
          commodity: cleanCommodity,
        });

        let previousRate = 0;
        if (historyDoc && historyDoc.history && historyDoc.history.length > 0) {
          const prev = [...historyDoc.history]
            .filter((h) => h.date < todayStr)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          previousRate = prev?.finalRate || 0;
        }

        const todayExists = await RateHistory.findOne({
          companyId: companyDoc._id,
          location: cleanLocation,
          commodity: cleanCommodity,
          "history.date": todayStr,
        });

        if (todayExists) {
          await RateHistory.updateOne(
            {
              companyId: companyDoc._id,
              location: cleanLocation,
              commodity: cleanCommodity,
              "history.date": todayStr,
            },
            {
              $push: {
                "history.$.tempRates": {
                  rate: numericRate,
                  time: currentTime,
                  note: others || "",
                },
              },
              $set: {
                "history.$.finalRate": numericRate,
                "history.$.others": others || "",
              },
            }
          );
        } else {
          await RateHistory.findOneAndUpdate(
            {
              companyId: companyDoc._id,
              location: cleanLocation,
              commodity: cleanCommodity,
            },
            {
              $push: {
                history: {
                  date: todayStr,
                  oldRate: previousRate,
                  tempRates: [
                    {
                      rate: numericRate,
                      time: currentTime,
                      note: others || "",
                    },
                  ],
                  finalRate: numericRate,
                  others: others || "",
                },
              },
            },
            { upsert: true, new: true }
          );
        }
      }
    } catch (err) {
      console.warn("Failed to update RateHistory:", err);
    }

    // --- Emit Socket Notification ---
    try {
      emitNotification({
        type: "rate",
        data: {
          company: cleanCompany,
          location: cleanLocation,
          commodity: cleanCommodity,
          rate: Number(newRate),
          date: todayStr,
          updateTime: currentTime,
        },
      });
    } catch (err) {
      console.warn("Failed to emit notification:", err);
    }

    return NextResponse.json(
      { message: "Rate saved and history updated!" },
      { status: 200 },
    );
  } catch (error) {
      console.error("Error in POST /api/rate:", {
        message: error.message,
        stack: error.stack,
        body: { cleanCompany, cleanLocation, cleanCommodity, newRate }
      });
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

      const oldRatesArray = Array.isArray(rate.oldRates) ? [...rate.oldRates] : [];
      
      // If the stored newRate is from a previous day, treat it as an old rate for the UI
      if (!isToday && rate.newRate !== undefined && rate.newRate !== null) {
        oldRatesArray.push({
          rate: rate.newRate,
          date: rate.newRateDate
        });
      }

      const oldRatesFormatted = oldRatesArray.map(
        (old) =>
          `${old.rate} (${old.date ? new Date(old.date).toLocaleDateString("en-GB") : "Unknown"})`,
      );

      // If it's not today, the rate should be empty (treated as new rate after midnight)
      const currentRate = isToday ? rate.newRate : "";
      const currentLastUpdated = isToday ? rate.newRateDate : null;

      if (minimal) {
        return {
          company: rate.company,
          location: rate.location,
          commodity: rate.commodity,
          newRate: currentRate,
          lastUpdated: currentLastUpdated,
          updateTime: isToday ? rate.updateTime : "",
          hasNewRateToday: isToday,
        };
      }

      return {
        company: rate.company,
        location: rate.location,
        commodity: rate.commodity,
        oldRates: oldRatesFormatted,
        newRate: currentRate,
        newRateDate: currentLastUpdated,
        quantity: isToday ? rate.quantity : "",
        payment: isToday ? rate.payment : "",
        others: isToday ? rate.others : "",
        updateTime: isToday ? rate.updateTime : "",
        mobile: rate.mobile,
      };
    });

    return NextResponse.json(formattedRates, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/rate:", error);
    return NextResponse.json({ error: "Error fetching rates" }, { status: 500 });
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

    // If the last update was not today, move the current rate to oldRates
    const lastUpdated = rateToUpdate.newRateDate ? new Date(rateToUpdate.newRateDate) : null;
    if (lastUpdated) {
      lastUpdated.setHours(0, 0, 0, 0);
      
      if (lastUpdated.getTime() !== today.getTime() && rateToUpdate.newRate) {
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
