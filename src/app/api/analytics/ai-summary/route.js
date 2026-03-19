import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/middleware/apiKeyMiddleware/apiKeyMiddleware';

export async function POST(request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { weeklyData, period } = await request.json();
    const { dailyData, summary } = weeklyData;

    if (!dailyData || dailyData.length === 0) {
      return NextResponse.json({ success: true, analysis: "Not enough data for analysis yet." });
    }

    const busiestDayRate = dailyData.reduce((prev, current) => (prev.rateEntries > current.rateEntries) ? prev : current);
    const busiestDayTons = dailyData.reduce((prev, current) => (prev.totalTons > current.totalTons) ? prev : current);
    
    let trend = "stable";
    const startVal = dailyData[0].totalTons;
    const endVal = dailyData[dailyData.length - 1].totalTons;
    if (endVal > startVal * 1.2) trend = "increasing significantly";
    else if (endVal > startVal) trend = "showing slight growth";
    else if (endVal < startVal * 0.8) trend = "decreasing";

    const periodLabel = period === 'monthly' ? 'Last 6 Months' : `Last ${period.replace('days', '')} Days`;

    const analysis = `
### ${periodLabel} Performance Analysis
In this period, we processed **${summary.totalTonsDone} tons** across **${summary.totalSaudasDone} saudas**, supported by **${summary.totalRateEntries} rate updates**.

#### Core Findings:
- **Tonnage Leader:** The highest volume was recorded on **${busiestDayTons.displayDate}** with **${busiestDayTons.totalTons} tons**.
- **Market Engagement:** The most active period for rate updates was **${busiestDayRate.displayDate}** (${busiestDayRate.rateEntries} entries).
- **Trend Forecast:** Volume is currently **${trend}** compared to the start of this cycle.
- **Efficiency Note:** ${summary.totalTonsDone / (summary.totalSaudasDone || 1) > 50 ? 'Large-scale trades are dominating the volume.' : 'High-frequency smaller trades are the primary driver.'}

*Insight generated based on transactional throughput and market participation.*
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
