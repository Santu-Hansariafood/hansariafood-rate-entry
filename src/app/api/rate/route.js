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

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    const today = new Date(todayStr + 'T00:00:00Z');

    const istTimeStr = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const currentTime = istTimeStr;

    const numericNewRate = Number(newRate);
    if (isNaN(numericNewRate)) {
      return NextResponse.json(
        { error: "Invalid newRate value. Must be a number." },
        { status: 400 },
      );
    }

    let companyIdForSocket = null;
    try {
      console.log("Saving rate for company:", cleanCompany, "Date:", todayStr);
      
      const existingRate = await Rate.findOne({ 
        company: cleanCompany, 
        location: cleanLocation, 
        commodity: cleanCommodity 
      });

      const numericQuantity = isNaN(Number(quantity)) ? 0 : Number(quantity);

      const updateDoc = {
        newRate: numericNewRate,
        newRateDate: today,
        mobile: mobile || (existingRate?.mobile || ""),
        quantity: numericQuantity,
        payment: payment !== undefined ? String(payment) : (existingRate?.payment || ""),
        others: others !== undefined ? String(others) : (existingRate?.others || ""),
        updatedAt: now,
        updateTime: currentTime
      };

      if (existingRate) {
        const lastUpdated = existingRate.newRateDate ? new Date(existingRate.newRateDate) : null;
        let shouldShift = false;
        
        if (lastUpdated && !isNaN(lastUpdated.getTime())) {
          const lastUpdatedStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(lastUpdated);

          if (lastUpdatedStr !== todayStr && existingRate.newRate !== undefined) {
            shouldShift = true;
          }
        }

        if (shouldShift) {
          await Rate.updateOne(
            { _id: existingRate._id },
            { 
              $push: { 
                oldRates: { 
                  rate: existingRate.newRate, 
                  date: existingRate.newRateDate 
                } 
              },
              $set: updateDoc
            }
          );
        } else {
          await Rate.updateOne({ _id: existingRate._id }, { $set: updateDoc });
        }
      } else {
        await Rate.create({
          company: cleanCompany,
          location: cleanLocation,
          commodity: cleanCommodity,
          newRate: numericNewRate,
          newRateDate: today,
          oldRates: [],
          mobile,
          quantity: numericQuantity,
          payment: payment !== undefined ? String(payment) : "",
          others: others !== undefined ? String(others) : "",
          updateTime: currentTime
        });
      }
    } catch (rateErr) {
      console.error("Error saving Rate model:", rateErr);
      throw new Error(`Rate model save failed: ${rateErr.message}`);
    }

    try {
      const escapedCompany = cleanCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const companyDoc = await ManageCompany.findOne({ 
        name: { $regex: new RegExp(`^${escapedCompany}$`, 'i') } 
      });

      if (companyDoc) {
        companyIdForSocket = companyDoc._id;
        
        const numericRate = numericNewRate;

        const historyRecord = await RateHistory.findOne({
          companyId: companyDoc._id,
          location: cleanLocation,
          commodity: cleanCommodity,
        });

        if (historyRecord) {
          const todayEntryIndex = historyRecord.history.findIndex(h => h.date === todayStr);

          if (todayEntryIndex !== -1) {
            await RateHistory.updateOne(
              {
                _id: historyRecord._id,
                "history.date": todayStr
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
            let previousRate = 0;
            if (historyRecord.history.length > 0) {
              const historySorted = [...historyRecord.history].sort((a, b) => b.date.localeCompare(a.date));
              const lastEntry = historySorted[0];
              previousRate = lastEntry?.finalRate || 0;
            }

            await RateHistory.updateOne(
              { _id: historyRecord._id },
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
              }
            );
          }
        } else {
          await RateHistory.create({
            companyId: companyDoc._id,
            location: cleanLocation,
            commodity: cleanCommodity,
            history: [{
              date: todayStr,
              oldRate: 0,
              tempRates: [
                {
                  rate: numericRate,
                  time: currentTime,
                  note: others || "",
                },
              ],
              finalRate: numericRate,
              others: others || "",
            }]
          });
        }
      }
    } catch (historyErr) {
      console.warn("Failed to update RateHistory:", historyErr.message);
    }

    try {
      emitNotification({
        type: "rate",
        data: {
          company: cleanCompany,
          companyId: companyIdForSocket || null,
          location: cleanLocation,
          commodity: cleanCommodity,
          rate: numericNewRate,
          date: todayStr,
          updateTime: currentTime,
        },
      });
    } catch (socketErr) {
      console.warn("Failed to emit notification:", socketErr.message);
    }

    return NextResponse.json(
      { message: "Rate saved successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Critical Error in POST /api/rate:", error);
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

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const todayMidnight = new Date(todayStr + 'T00:00:00Z');

    const dbQuery = {
      ...query,
      ...(todayOnly ? { newRateDate: { $gte: todayMidnight } } : {}),
    };

    const selectFields = minimal
      ? "company location commodity newRate newRateDate updateTime"
      : "company location commodity oldRates newRate newRateDate quantity payment others updateTime mobile";

    const rates = await Rate.find(dbQuery).select(selectFields).lean();

    const formattedRates = rates.map((rate) => {
      const lastUpdated = rate.newRateDate ? new Date(rate.newRateDate) : null;
      let isToday = false;
      
      if (lastUpdated && !isNaN(lastUpdated.getTime())) {
        const lastUpdatedStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(lastUpdated);
        isToday = (lastUpdatedStr === todayStr);
      }

      const oldRatesArray = Array.isArray(rate.oldRates) ? [...rate.oldRates] : [];
      
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
