import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/middleware/apiKeyMiddleware/apiKeyMiddleware';

export async function POST(request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { weeklyData } = await request.json();
    const { dailyData, summary } = weeklyData;

    // Logic-based "AI" Analysis
    const busiestDayRate = dailyData.reduce((prev, current) => (prev.rateEntries > current.rateEntries) ? prev : current);
    const busiestDaySauda = dailyData.reduce((prev, current) => (prev.saudasDone > current.saudasDone) ? prev : current);
    
    let trend = "stable";
    if (dailyData[6].rateEntries > dailyData[0].rateEntries) trend = "increasing";
    else if (dailyData[6].rateEntries < dailyData[0].rateEntries) trend = "decreasing";

    const analysis = `
### Weekly Performance Overview
Over the last 7 days, we recorded a total of **${summary.totalRateEntries} rate entries** and **${summary.totalSaudasDone} completed saudas**. 
The overall conversion rate stands at **${summary.conversionRate}%**.

#### Key Insights:
- **Peak Activity (Rates):** The highest volume of rate updates occurred on **${busiestDayRate.displayDate}** with ${busiestDayRate.rateEntries} entries.
- **Peak Performance (Saudas):** The most saudas were closed on **${busiestDaySauda.displayDate}** (${busiestDaySauda.saudasDone} saudas).
- **Trend Analysis:** Market engagement is currently **${trend}** compared to the beginning of the week.
- **Efficiency:** ${summary.conversionRate > 20 ? 'The team is showing strong conversion efficiency.' : 'There is potential to improve the rate-to-sauda conversion ratio.'}

*This analysis was generated automatically based on real-time transaction data.*
    `.trim();

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
}
