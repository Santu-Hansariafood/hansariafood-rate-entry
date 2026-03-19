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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rateEntries = await Rate.countDocuments({
      newRateDate: { $gte: sevenDaysAgo },
    });

    const saudaEntries = await SaudaEntry.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    let saudasDone = 0;
    saudaEntries.forEach(entry => {
      if (entry.saudaEntries) {
        for (const saudaList of entry.saudaEntries.values()) {
          saudasDone += saudaList.length;
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { rateEntries, saudasDone } 
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly summary' },
      { status: 500 }
    );
  }
}
