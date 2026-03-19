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
    
    let trend = "Stable";
    const startVal = dailyData[0].totalTons;
    const endVal = dailyData[dailyData.length - 1].totalTons;
    if (endVal > startVal * 1.2) trend = "Significant Growth";
    else if (endVal > startVal) trend = "Moderate Growth";
    else if (endVal < startVal * 0.8) trend = "Downward Trend";

    const periodLabel = period === 'monthly' ? 'Last 6 Months' : `Last ${period.replace('days', '')} Days`;

    // Generate Date-wise report for the AI section
    const dateWiseReport = dailyData.map(d => 
      `| ${d.displayDate} | ${d.rateEntries} | ${d.saudasDone} | ${d.totalTons} T |`
    ).join('\n');

    const analysis = `
# PERFORMANCE ANALYTICS REPORT
**Period:** ${periodLabel}
**Generated on:** ${new Date().toLocaleDateString('en-IN')}

## EXECUTIVE SUMMARY
Over this cycle, the business processed a total volume of **${summary.totalTonsDone} tons** across **${summary.totalSaudasDone} completed saudas**. Market engagement remained active with **${summary.totalRateEntries} rate submissions** recorded.

### KEY PERFORMANCE INDICATORS (KPIs)
- **Total Tonnage:** ${summary.totalTonsDone} Tons
- **Total Transactions:** ${summary.totalSaudasDone} Saudas
- **Market Price Updates:** ${summary.totalRateEntries} Entries
- **Growth Status:** ${trend}

### PERIODIC ACTIVITY BREAKDOWN
| Date/Month | Rate Entries | Saudas Done | Total Volume |
| :--- | :--- | :--- | :--- |
${dateWiseReport}

## CRITICAL INSIGHTS
1. **Volume Peak:** The highest transaction volume occurred on **${busiestDayTons.displayDate}**, reaching **${busiestDayTons.totalTons} tons**.
2. **Engagement Peak:** Price discovery was most intense on **${busiestDayRate.displayDate}** with ${busiestDayRate.rateEntries} updates.
3. **Operational Efficiency:** ${summary.totalTonsDone / (summary.totalSaudasDone || 1) > 50 ? 'The focus has been on high-volume bulk transactions.' : 'Performance is driven by a high frequency of mid-sized trades.'}
4. **Market Momentum:** The overall volume trend is currently **${trend.toLowerCase()}**, suggesting ${trend.includes('Growth') ? 'strong market demand' : 'a cautious trading environment'}.

---
*End of Analysis Report*
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
