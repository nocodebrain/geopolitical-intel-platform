import { NextResponse } from 'next/server';
import { getRecessionRiskHistory, closeDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '365');

    const history = getRecessionRiskHistory(limit);

    // Also include historical recession periods (hardcoded for now)
    const historicalRecessions = [
      { start: '2007-12-01', end: '2009-06-01', name: 'Great Recession' },
      { start: '2001-03-01', end: '2001-11-01', name: 'Dot-com Recession' },
      { start: '1990-07-01', end: '1991-03-01', name: 'Gulf War Recession' },
      { start: '2020-02-01', end: '2020-04-01', name: 'COVID-19 Recession' }
    ];

    return NextResponse.json({
      riskHistory: history,
      historicalRecessions,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching recession history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recession history' },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
