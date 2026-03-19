import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SaudaEntry from '@/models/SaudaEntry';
import Rate from '@/models/Rate';
import { verifyApiKey } from '@/middleware/apiKeyMiddleware/apiKeyMiddleware';

export async function GET(request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

      // Rate count for this specific day
      const rateEntries = await Rate.countDocuments({
        newRateDate: { $gte: date, $lt: nextDay },
      });

      // Sauda entries for this specific day
      const saudaEntries = await SaudaEntry.find({
        date: dayStr, // Matching the date format in SaudaEntry model
      });

      let saudasDone = 0;
      saudaEntries.forEach(entry => {
        if (entry.saudaEntries) {
          // saudaEntries is a Map
          for (const saudaList of entry.saudaEntries.values()) {
            saudasDone += saudaList.length;
          }
        }
      });

      dailyData.push({
        date: dayStr,
        displayDate: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        rateEntries,
        saudasDone,
      });
    }

    const totalRateEntries = dailyData.reduce((acc, curr) => acc + curr.rateEntries, 0);
    const totalSaudasDone = dailyData.reduce((acc, curr) => acc + curr.saudasDone, 0);

    // Recent Works Done (Latest 10 Sauda entries)
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
