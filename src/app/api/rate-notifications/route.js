import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RateHistory from "@/models/RateHistory";
import Company from "@/models/Company"; // Ensure Company model is registered

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g., "Soya", "MDOC", "DDGS"
    
    // Date format in DB is DD/MM/YYYY (en-GB)
    const today = new Date().toLocaleDateString("en-GB");
    
    // Find rate histories that have an entry for today
    const histories = await RateHistory.find({
      "history.date": today
    }).populate("companyId", "name type");

    let notifications = [];

    histories.forEach(doc => {
      // Filter by company type if provided
      if (type && doc.companyId?.type !== type) {
        return;
      }

      const todayEntry = doc.history.find(h => h.date === today);
      if (todayEntry && todayEntry.tempRates && todayEntry.tempRates.length > 0) {
        todayEntry.tempRates.forEach(rateUpdate => {
          notifications.push({
            companyName: doc.companyId?.name || "Unknown Company",
            location: doc.location,
            commodity: doc.commodity,
            rate: rateUpdate.rate,
            time: rateUpdate.time,
            date: todayEntry.date,
            // Create a timestamp for sorting
            timestamp: parseDateTime(todayEntry.date, rateUpdate.time)
          });
        });
      }
    });

    // Sort by timestamp descending (newest first)
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ 
      success: true, 
      notifications 
    });

  } catch (error) {
    console.error("Error fetching rate notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to parse DD/MM/YYYY and HH:MM AM/PM or HH:MM
function parseDateTime(dateStr, timeStr) {
  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier) {
        modifier = modifier.toLowerCase();
        if (hours === 12) {
            hours = modifier === 'pm' ? 12 : 0;
        } else if (modifier === 'pm') {
            hours += 12;
        }
    }

    return new Date(year, month - 1, day, hours, minutes).getTime();
  } catch (e) {
    return 0;
  }
}
