#!/usr/bin/env tsx
/**
 * Economic Data Collection Script
 * Fetches 10 key economic indicators for recession prediction
 * Run: tsx scripts/collect-economic-data.ts
 * Cron: Every 6 hours
 */

import axios from 'axios';
import { getDb, upsertEconomicIndicator, saveRecessionRiskHistory, closeDb } from '../lib/db';

const FRED_API_KEY = process.env.FRED_API_KEY || '';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface IndicatorConfig {
  name: string;
  fredSeriesId?: string;
  weight: number;
  interpretation: (value: number, metadata?: any) => { interpretation: string; score: number };
}

// Indicator configurations with FRED series IDs
const INDICATORS: IndicatorConfig[] = [
  {
    name: 'yield_curve',
    fredSeriesId: 'T10Y2Y', // 10-Year Treasury - 2-Year Treasury spread
    weight: 0.40, // 40% weight - MOST IMPORTANT
    interpretation: (spread: number) => {
      if (spread < -0.5) return { interpretation: 'Critical - Deep Inversion', score: 95 };
      if (spread < -0.2) return { interpretation: 'Warning - Inverted', score: 85 };
      if (spread < 0) return { interpretation: 'Concerning - Slight Inversion', score: 70 };
      if (spread < 0.5) return { interpretation: 'Flattening', score: 40 };
      if (spread < 1.5) return { interpretation: 'Normal', score: 20 };
      return { interpretation: 'Steep - Healthy', score: 10 };
    }
  },
  {
    name: 'manufacturing_pmi',
    fredSeriesId: 'MANEMP', // Manufacturing employment (proxy for PMI)
    weight: 0.10,
    interpretation: (value: number) => {
      if (value < 45) return { interpretation: 'Severe Contraction', score: 90 };
      if (value < 48) return { interpretation: 'Contraction', score: 70 };
      if (value < 50) return { interpretation: 'Weak', score: 55 };
      if (value < 55) return { interpretation: 'Expansion', score: 30 };
      return { interpretation: 'Strong Growth', score: 15 };
    }
  },
  {
    name: 'unemployment_rate',
    fredSeriesId: 'UNRATE',
    weight: 0.10,
    interpretation: (rate: number) => {
      if (rate > 7) return { interpretation: 'Very High', score: 85 };
      if (rate > 5.5) return { interpretation: 'Elevated', score: 65 };
      if (rate > 4.5) return { interpretation: 'Moderate', score: 40 };
      if (rate > 3.5) return { interpretation: 'Low', score: 20 };
      return { interpretation: 'Very Low', score: 15 };
    }
  },
  {
    name: 'consumer_confidence',
    fredSeriesId: 'UMCSENT', // University of Michigan Consumer Sentiment
    weight: 0.05,
    interpretation: (value: number) => {
      if (value < 60) return { interpretation: 'Very Pessimistic', score: 80 };
      if (value < 70) return { interpretation: 'Pessimistic', score: 60 };
      if (value < 80) return { interpretation: 'Cautious', score: 40 };
      if (value < 90) return { interpretation: 'Moderate', score: 25 };
      return { interpretation: 'Optimistic', score: 15 };
    }
  },
  {
    name: 'gdp_growth',
    fredSeriesId: 'A191RL1Q225SBEA', // Real GDP growth rate
    weight: 0.10,
    interpretation: (growth: number) => {
      if (growth < -1) return { interpretation: 'Recession', score: 95 };
      if (growth < 0) return { interpretation: 'Contraction', score: 85 };
      if (growth < 1) return { interpretation: 'Weak Growth', score: 60 };
      if (growth < 2.5) return { interpretation: 'Moderate Growth', score: 30 };
      return { interpretation: 'Strong Growth', score: 15 };
    }
  },
  {
    name: 'vix',
    fredSeriesId: 'VIXCLS', // CBOE Volatility Index
    weight: 0.05,
    interpretation: (vix: number) => {
      if (vix > 40) return { interpretation: 'Extreme Fear', score: 85 };
      if (vix > 30) return { interpretation: 'High Volatility', score: 65 };
      if (vix > 20) return { interpretation: 'Elevated', score: 45 };
      if (vix > 15) return { interpretation: 'Moderate', score: 25 };
      return { interpretation: 'Low - Complacent', score: 20 };
    }
  },
  {
    name: 'housing_starts',
    fredSeriesId: 'HOUST', // Housing Starts (thousands)
    weight: 0.05,
    interpretation: (starts: number) => {
      if (starts < 900) return { interpretation: 'Severely Depressed', score: 80 };
      if (starts < 1100) return { interpretation: 'Weak', score: 60 };
      if (starts < 1300) return { interpretation: 'Moderate', score: 35 };
      if (starts < 1500) return { interpretation: 'Healthy', score: 20 };
      return { interpretation: 'Strong', score: 15 };
    }
  },
  {
    name: 'corporate_bond_spread',
    fredSeriesId: 'BAMLC0A4CBBB', // BBB Corporate Bond Spread
    weight: 0.05,
    interpretation: (spread: number) => {
      if (spread > 4) return { interpretation: 'Credit Stress', score: 85 };
      if (spread > 3) return { interpretation: 'Elevated Risk', score: 65 };
      if (spread > 2) return { interpretation: 'Moderate', score: 40 };
      if (spread > 1.5) return { interpretation: 'Normal', score: 25 };
      return { interpretation: 'Tight - Low Risk', score: 15 };
    }
  },
  {
    name: 'commodity_prices',
    fredSeriesId: 'DCOILWTICO', // WTI Oil Price (proxy for commodities)
    weight: 0.05,
    interpretation: (price: number) => {
      if (price < 40) return { interpretation: 'Demand Collapse', score: 75 };
      if (price < 60) return { interpretation: 'Weak Demand', score: 50 };
      if (price < 80) return { interpretation: 'Moderate', score: 30 };
      if (price < 100) return { interpretation: 'Healthy', score: 25 };
      return { interpretation: 'Overheating', score: 55 };
    }
  },
  {
    name: 'banking_stress',
    fredSeriesId: 'DRTSCILM', // Delinquency Rate on Commercial/Industrial Loans
    weight: 0.05,
    interpretation: (rate: number) => {
      if (rate > 3) return { interpretation: 'Severe Stress', score: 90 };
      if (rate > 2) return { interpretation: 'Elevated Stress', score: 70 };
      if (rate > 1.5) return { interpretation: 'Moderate Stress', score: 45 };
      if (rate > 1) return { interpretation: 'Low Stress', score: 25 };
      return { interpretation: 'Minimal Stress', score: 15 };
    }
  }
];

async function fetchFredData(seriesId: string): Promise<{ date: string; value: number } | null> {
  if (!FRED_API_KEY) {
    console.warn('FRED_API_KEY not set - using mock data');
    return null;
  }

  try {
    const response = await axios.get(FRED_BASE_URL, {
      params: {
        series_id: seriesId,
        api_key: FRED_API_KEY,
        file_type: 'json',
        sort_order: 'desc',
        limit: 1
      }
    });

    const observations = response.data.observations;
    if (observations && observations.length > 0) {
      const latest = observations[0];
      return {
        date: latest.date,
        value: parseFloat(latest.value)
      };
    }
  } catch (error: any) {
    console.error(`Error fetching FRED series ${seriesId}:`, error.message);
  }

  return null;
}

function generateMockData(indicatorName: string): { date: string; value: number } {
  const date = new Date().toISOString().split('T')[0];
  
  // Generate realistic mock values for testing
  const mockValues: { [key: string]: number } = {
    yield_curve: 0.5 + (Math.random() - 0.5) * 1.5, // -0.5 to 1.5
    manufacturing_pmi: 48 + Math.random() * 8, // 48-56
    unemployment_rate: 3.5 + Math.random() * 2, // 3.5-5.5
    consumer_confidence: 70 + Math.random() * 25, // 70-95
    gdp_growth: 1.5 + Math.random() * 2, // 1.5-3.5
    vix: 15 + Math.random() * 15, // 15-30
    housing_starts: 1200 + Math.random() * 400, // 1200-1600
    corporate_bond_spread: 1.5 + Math.random() * 1.5, // 1.5-3
    commodity_prices: 65 + Math.random() * 30, // 65-95
    banking_stress: 0.8 + Math.random() * 1.2 // 0.8-2
  };

  return {
    date,
    value: mockValues[indicatorName] || 0
  };
}

function calculateRecessionRisk(indicators: Array<{ name: string; score: number; weight: number }>): {
  riskScore: number;
  prediction: string;
  recommendation: string;
} {
  // Calculate weighted risk score
  const riskScore = indicators.reduce((total, ind) => {
    return total + (ind.score * ind.weight);
  }, 0);

  // Generate prediction based on risk score
  let prediction = '';
  if (riskScore >= 80) {
    prediction = 'Recession highly likely within 6-12 months';
  } else if (riskScore >= 60) {
    prediction = 'Elevated recession risk in next 12-18 months';
  } else if (riskScore >= 40) {
    prediction = 'Moderate risk - monitor closely';
  } else if (riskScore >= 30) {
    prediction = 'Low risk - economy showing strength';
  } else {
    prediction = 'Very low risk - strong economic expansion';
  }

  // Generate recommendations
  let recommendation = '';
  if (riskScore >= 60) {
    recommendation = '🔴 HIGH RISK: Delay major capex, secure credit lines, review supplier contracts, build cash reserves, hedge commodity exposure. Focus on liquidity and flexibility.';
  } else if (riskScore >= 40) {
    recommendation = '🟡 MODERATE RISK: Monitor economic indicators closely, maintain financial flexibility, diversify supplier base, review project timelines.';
  } else {
    recommendation = '🟢 LOW RISK: Expansion opportunities available, lock in favorable rates, invest in efficiency improvements, secure long-term supplier contracts, hire talent.';
  }

  return { riskScore, prediction, recommendation };
}

async function collectEconomicData() {
  console.log('🏦 Starting economic data collection...');
  console.log(`Using FRED API: ${FRED_API_KEY ? 'Yes' : 'No (mock data)'}\n`);

  const db = getDb();
  const collectedIndicators: Array<{ name: string; score: number; weight: number; value: number; interpretation: string }> = [];

  for (const indicator of INDICATORS) {
    try {
      console.log(`📊 Fetching ${indicator.name}...`);
      
      // Try to fetch from FRED API, fall back to mock data
      let data = indicator.fredSeriesId 
        ? await fetchFredData(indicator.fredSeriesId)
        : null;
      
      if (!data) {
        data = generateMockData(indicator.name);
        console.log(`  → Using mock data`);
      }

      // Calculate interpretation and score
      const { interpretation, score } = indicator.interpretation(data.value);
      
      // Store in database
      upsertEconomicIndicator({
        indicator_name: indicator.name,
        value: data.value,
        date: data.date,
        source: FRED_API_KEY ? 'FRED' : 'Mock',
        interpretation,
        score,
        metadata: indicator.fredSeriesId ? JSON.stringify({ series_id: indicator.fredSeriesId }) : null
      });

      collectedIndicators.push({
        name: indicator.name,
        score,
        weight: indicator.weight,
        value: data.value,
        interpretation
      });

      console.log(`  ✓ ${indicator.name}: ${data.value.toFixed(2)} - ${interpretation} (Risk: ${score}/100)`);
    } catch (error: any) {
      console.error(`  ✗ Error collecting ${indicator.name}:`, error.message);
    }
  }

  // Calculate overall recession risk
  console.log('\n📈 Calculating recession risk...');
  const { riskScore, prediction, recommendation } = calculateRecessionRisk(collectedIndicators);

  // Save recession risk history
  const today = new Date().toISOString().split('T')[0];
  saveRecessionRiskHistory({
    risk_score: riskScore,
    prediction,
    indicators_snapshot: JSON.stringify(collectedIndicators),
    recommendation,
    date: today
  });

  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 RECESSION RISK ANALYSIS');
  console.log('='.repeat(60));
  console.log(`\n🎯 Overall Risk Score: ${riskScore.toFixed(1)}/100`);
  console.log(`📅 Prediction: ${prediction}`);
  console.log(`💡 Recommendation:\n   ${recommendation}\n`);
  console.log('='.repeat(60));

  console.log('\n✅ Economic data collection completed!\n');
}

async function main() {
  try {
    await collectEconomicData();
  } catch (error) {
    console.error('❌ Error in economic data collection:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { collectEconomicData };
