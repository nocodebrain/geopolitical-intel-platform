import { NextResponse } from 'next/server';
import { getLatestRecessionRisk, getLatestEconomicIndicators, closeDb } from '@/lib/db';

export async function GET() {
  try {
    const riskData = getLatestRecessionRisk();
    const indicators = getLatestEconomicIndicators();

    if (!riskData) {
      return NextResponse.json({
        riskScore: 0,
        prediction: 'No data available',
        recommendation: 'Run data collection script to populate indicators',
        indicators: [],
        lastUpdated: null
      });
    }

    // Parse indicators snapshot
    let indicatorsSnapshot = [];
    try {
      indicatorsSnapshot = JSON.parse(riskData.indicators_snapshot);
    } catch (e) {
      console.error('Error parsing indicators snapshot:', e);
    }

    return NextResponse.json({
      riskScore: riskData.risk_score,
      prediction: riskData.prediction,
      recommendation: riskData.recommendation,
      indicators: indicatorsSnapshot,
      lastUpdated: riskData.date,
      rawIndicators: indicators
    });
  } catch (error) {
    console.error('Error fetching recession risk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recession risk data' },
      { status: 500 }
    );
  } finally {
    closeDb();
  }
}
