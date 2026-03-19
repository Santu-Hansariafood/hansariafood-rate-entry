import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/middleware/apiKeyMiddleware/apiKeyMiddleware';

export async function POST(request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { weeklyData } = await request.json();

    const analysis = `Based on the weekly data, we can see that there were ${weeklyData.rateEntries} rate entries and ${weeklyData.saudasDone} saudas done. This is just a placeholder analysis.`;

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
}
