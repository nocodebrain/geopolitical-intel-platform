import { NextResponse } from 'next/server';
import { getLatestEconomicIndicators, closeDb } from '@/lib/db';

export async function GET() {
  try {
    const indicators = getLatestEconomicIndicators();

    return NextResponse.json({
      indicators,
      count: indicators.length
    });
  } catch (error) {
    console.error('Error fetching economic indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch economic indicators' },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
