#!/usr/bin/env tsx
/**
 * Backfill Historical Economic Data
 * Generates 180 days of historical data for testing and visualization
 * Run: tsx scripts/backfill-economic-data.ts
 */

import { getDb, upsertEconomicIndicator, saveRecessionRiskHistory, closeDb } from '../lib/db';

interface IndicatorConfig {
  name: string;
  baseValue: number;
  volatility: number;
  trend: number; // positive = increasing, negative = decreasing
  weight: number;
  interpretation: (value: number) => { interpretation: string; score: number };
}

const INDICATORS: IndicatorConfig[] = [
  {
    name: 'yield_curve',
    baseValue: 0.8, // Start with positive spread
    volatility: 0.3,
    trend: -0.005, // Gradually flattening
    weight: 0.40,
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
    baseValue: 52,
    volatility: 3,
    trend: -0.02,
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
    baseValue: 3.7,
    volatility: 0.2,
    trend: 0.005,
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
    baseValue: 85,
    volatility: 5,
    trend: -0.05,
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
    baseValue: 2.8,
    volatility: 0.5,
    trend: -0.01,
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
    baseValue: 18,
    volatility: 5,
    trend: 0.03,
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
    baseValue: 1450,
    volatility: 80,
    trend: -2,
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
    baseValue: 1.8,
    volatility: 0.3,
    trend: 0.005,
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
    baseValue: 75,
    volatility: 8,
    trend: 0.05,
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
    baseValue: 0.9,
    volatility: 0.2,
    trend: 0.002,
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

function generateHistoricalValue(
  indicator: IndicatorConfig,
  daysAgo: number
): number {
  // Add trend over time
  const trendValue = indicator.baseValue + (indicator.trend * daysAgo);
  
  // Add some random volatility (sine wave + noise for realistic patterns)
  const cyclical = Math.sin(daysAgo / 30) * indicator.volatility * 0.5;
  const noise = (Math.random() - 0.5) * indicator.volatility;
  
  return trendValue + cyclical + noise;
}

function calculateRecessionRisk(indicators: Array<{ score: number; weight: number }>): {
  riskScore: number;
  prediction: string;
  recommendation: string;
} {
  const riskScore = indicators.reduce((total, ind) => {
    return total + (ind.score * ind.weight);
  }, 0);

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

  let recommendation = '';
  if (riskScore >= 60) {
    recommendation = '🔴 HIGH RISK: Delay major capex, secure credit lines, review supplier contracts, build cash reserves, hedge commodity exposure.';
  } else if (riskScore >= 40) {
    recommendation = '🟡 MODERATE RISK: Monitor economic indicators closely, maintain financial flexibility, diversify supplier base.';
  } else {
    recommendation = '🟢 LOW RISK: Expansion opportunities available, lock in favorable rates, invest in efficiency, secure long-term contracts.';
  }

  return { riskScore, prediction, recommendation };
}

async function backfillEconomicData() {
  console.log('📊 Starting historical economic data backfill...\n');

  const db = getDb();
  const daysToBackfill = 180; // 6 months of history

  for (let daysAgo = daysToBackfill; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateString = date.toISOString().split('T')[0];

    const collectedIndicators: Array<{ name: string; score: number; weight: number; value: number; interpretation: string }> = [];

    for (const indicator of INDICATORS) {
      const value = generateHistoricalValue(indicator, daysAgo);
      const { interpretation, score } = indicator.interpretation(value);

      upsertEconomicIndicator({
        indicator_name: indicator.name,
        value,
        date: dateString,
        source: 'Historical Backfill',
        interpretation,
        score
      });

      collectedIndicators.push({
        name: indicator.name,
        score,
        weight: indicator.weight,
        value,
        interpretation
      });
    }

    // Calculate and save recession risk for this date
    const { riskScore, prediction, recommendation } = calculateRecessionRisk(collectedIndicators);
    
    saveRecessionRiskHistory({
      risk_score: riskScore,
      prediction,
      indicators_snapshot: JSON.stringify(collectedIndicators),
      recommendation,
      date: dateString
    });

    if (daysAgo % 30 === 0 || daysAgo === 0) {
      console.log(`  ✓ Generated data for ${dateString} (Risk: ${riskScore.toFixed(1)}/100)`);
    }
  }

  console.log(`\n✅ Backfilled ${daysToBackfill + 1} days of economic data!\n`);
}

async function main() {
  try {
    await backfillEconomicData();
  } catch (error) {
    console.error('❌ Error in backfill:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

if (require.main === module) {
  main();
}

export { backfillEconomicData };
