import { NextResponse } from 'next/server';
import { getEconomicIndicatorHistory, closeDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const yieldCurveHistory = getEconomicIndicatorHistory('yield_curve', limit);

    return NextResponse.json({
      history: yieldCurveHistory,
      count: yieldCurveHistory.length
    });
  } catch (error) {
    console.error('Error fetching yield curve data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yield curve data' },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
