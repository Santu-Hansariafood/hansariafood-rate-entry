import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SaudaEntry from '@/models/SaudaEntry';
import Rate from '@/models/Rate';
import { verifyApiKey } from '@/middleware/apiKeyMiddleware/apiKeyMiddleware';

export async function GET(request) {
  await connectDB();
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days"; // 7days, 14days, monthly

    const dailyData = [];
    let loopCount = period === "14days" ? 14 : 7;
    
    if (period === "monthly") {
      // Monthly logic for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);

        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

        const rateEntries = await Rate.countDocuments({
          newRateDate: { $gte: date, $lt: nextMonth },
        });

        // Use regex to match the month and year in the date string (format: DD-MM-YYYY)
        const monthYearRegex = new RegExp(`^\\d{2}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}$`);
        
        const saudaEntries = await SaudaEntry.find({
          date: { $regex: monthYearRegex },
        });

        let saudasDone = 0;
        let totalTons = 0;
        saudaEntries.forEach(entry => {
          if (entry.saudaEntries) {
            for (const saudaList of entry.saudaEntries.values()) {
              saudasDone += saudaList.length;
              saudaList.forEach(s => {
                totalTons += Number(s.tons) || 0;
              });
            }
          }
        });

        dailyData.push({
          date: monthName,
          displayDate: monthName,
          rateEntries,
          saudasDone,
          totalTons: Math.round(totalTons)
        });
      }
    } else {
      // Daily logic (7 or 14 days)
      for (let i = loopCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayStr = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

        const rateEntries = await Rate.countDocuments({
          newRateDate: { $gte: date, $lt: nextDay },
        });

        const saudaEntries = await SaudaEntry.find({
          date: dayStr,
        });

        let saudasDone = 0;
        let totalTons = 0;
        saudaEntries.forEach(entry => {
          if (entry.saudaEntries) {
            for (const saudaList of entry.saudaEntries.values()) {
              saudasDone += saudaList.length;
              saudaList.forEach(s => {
                totalTons += Number(s.tons) || 0;
              });
            }
          }
        });

        dailyData.push({
          date: dayStr,
          displayDate: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
          rateEntries,
          saudasDone,
          totalTons: Math.round(totalTons)
        });
      }
    }

    const totalRateEntries = dailyData.reduce((acc, curr) => acc + curr.rateEntries, 0);
    const totalSaudasDone = dailyData.reduce((acc, curr) => acc + curr.saudasDone, 0);
    const totalTonsDone = dailyData.reduce((acc, curr) => acc + curr.totalTons, 0);

    const recentSaudas = await SaudaEntry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const worksDone = [];
    recentSaudas.forEach(doc => {
      if (doc.saudaEntries) {
        Object.entries(doc.saudaEntries).forEach(([unit, list]) => {
          list.forEach(item => {
            worksDone.push({
              company: doc.company,
              unit: item.unit || unit,
              commodity: item.commodity,
              tons: item.tons,
              date: doc.date,
              type: 'Sauda',
              timestamp: doc.createdAt
            });
          });
        });
      }
    });

    // Sort by timestamp and take top 10
    const sortedWorks = worksDone
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return NextResponse.json({ 
      success: true, 
      data: { 
        dailyData,
        summary: {
          totalRateEntries,
          totalSaudasDone,
          totalTonsDone,
          conversionRate: totalRateEntries > 0 ? ((totalSaudasDone / totalRateEntries) * 100).toFixed(2) : 0
        },
        worksDone: sortedWorks
      } 
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly summary' },
      { status: 500 }
    );
  }
}
