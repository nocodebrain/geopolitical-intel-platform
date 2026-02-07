#!/usr/bin/env tsx
/**
 * Australian Economic Data Collection
 * RBA (Reserve Bank of Australia) + ABS (Australian Bureau of Statistics)
 * + FRED (global indicators)
 * Run: tsx scripts/collect-australian-economic-data.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDb, upsertEconomicIndicator, saveRecessionRiskHistory, closeDb } from '../lib/db';
import { fetchAllAustralianCommodities, analyzeCommodityImpact } from '../lib/data-collection/australian-commodities';

const FRED_API_KEY = process.env.FRED_API_KEY || '';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface IndicatorConfig {
  name: string;
  source: 'RBA' | 'ABS' | 'FRED' | 'Manual';
  fredSeriesId?: string;
  rbaScrapeUrl?: string;
  weight: number;
  interpretation: (value: number) => { interpretation: string; score: number };
}

// Australian + Global economic indicators for recession prediction
const INDICATORS: IndicatorConfig[] = [
  // 🇦🇺 RBA (Reserve Bank of Australia)
  {
    name: 'rba_cash_rate',
    source: 'RBA',
    weight: 0.15, // 15% - RBA policy critical for Australian economy
    interpretation: (rate: number) => {
      if (rate >= 5) return { interpretation: 'Very Restrictive - Cooling Economy', score: 75 };
      if (rate >= 4) return { interpretation: 'Restrictive - Fighting Inflation', score: 60 };
      if (rate >= 3) return { interpretation: 'Neutral to Tight', score: 40 };
      if (rate >= 2) return { interpretation: 'Accommodative', score: 25 };
      return { interpretation: 'Very Accommodative - Stimulating', score: 20 };
    }
  },
  
  // 🇦🇺 ABS (Australian Bureau of Statistics)
  {
    name: 'aus_unemployment_rate',
    source: 'ABS',
    weight: 0.12,
    interpretation: (rate: number) => {
      if (rate > 6.5) return { interpretation: 'Very High - Recession Likely', score: 90 };
      if (rate > 5.5) return { interpretation: 'Elevated - Weak Labor Market', score: 70 };
      if (rate > 4.5) return { interpretation: 'Moderate', score: 45 };
      if (rate > 3.5) return { interpretation: 'Low - Tight Labor Market', score: 25 };
      return { interpretation: 'Very Low - Overheating Risk', score: 20 };
    }
  },
  
  {
    name: 'aus_gdp_growth',
    source: 'ABS',
    weight: 0.12,
    interpretation: (growth: number) => {
      if (growth < -0.5) return { interpretation: 'Recession - Contracting', score: 95 };
      if (growth < 1) return { interpretation: 'Very Weak Growth', score: 75 };
      if (growth < 2) return { interpretation: 'Below Trend', score: 55 };
      if (growth < 3) return { interpretation: 'Moderate Growth', score: 30 };
      return { interpretation: 'Strong Growth', score: 20 };
    }
  },
  
  {
    name: 'aus_building_approvals',
    source: 'ABS',
    weight: 0.08, // Important for construction sector
    interpretation: (change: number) => {
      if (change < -15) return { interpretation: 'Severe Decline - Construction Slump', score: 85 };
      if (change < -5) return { interpretation: 'Declining', score: 65 };
      if (change < 5) return { interpretation: 'Flat', score: 45 };
      if (change < 15) return { interpretation: 'Growing', score: 25 };
      return { interpretation: 'Strong Growth', score: 20 };
    }
  },
  
  // 🌏 US Indicators (via FRED) - Global economy affects Australia
  {
    name: 'us_yield_curve',
    fredSeriesId: 'T10Y2Y',
    source: 'FRED',
    weight: 0.15, // Still critical - US recession affects global trade
    interpretation: (spread: number) => {
      if (spread < -0.5) return { interpretation: 'Deep Inversion - US Recession Signal', score: 90 };
      if (spread < -0.2) return { interpretation: 'Inverted - Warning', score: 75 };
      if (spread < 0) return { interpretation: 'Slight Inversion', score: 60 };
      if (spread < 0.5) return { interpretation: 'Flattening', score: 35 };
      return { interpretation: 'Normal - Healthy', score: 20 };
    }
  },
  
  {
    name: 'us_unemployment_rate',
    fredSeriesId: 'UNRATE',
    source: 'FRED',
    weight: 0.08,
    interpretation: (rate: number) => {
      if (rate > 7) return { interpretation: 'Very High', score: 80 };
      if (rate > 5.5) return { interpretation: 'Elevated', score: 60 };
      if (rate > 4.5) return { interpretation: 'Moderate', score: 35 };
      return { interpretation: 'Low', score: 20 };
    }
  },
  
  {
    name: 'china_manufacturing_pmi',
    source: 'Manual', // Would scrape from trading economics or official sources
    weight: 0.12, // China is Australia's #1 trade partner
    interpretation: (pmi: number) => {
      if (pmi < 45) return { interpretation: 'Severe Contraction - AU Export Risk', score: 90 };
      if (pmi < 48) return { interpretation: 'Contraction', score: 70 };
      if (pmi < 50) return { interpretation: 'Weak', score: 55 };
      if (pmi < 52) return { interpretation: 'Mild Expansion', score: 35 };
      return { interpretation: 'Strong Growth', score: 20 };
    }
  },
  
  {
    name: 'vix',
    fredSeriesId: 'VIXCLS',
    source: 'FRED',
    weight: 0.06,
    interpretation: (vix: number) => {
      if (vix > 40) return { interpretation: 'Extreme Fear - Market Panic', score: 85 };
      if (vix > 30) return { interpretation: 'High Volatility', score: 65 };
      if (vix > 20) return { interpretation: 'Elevated', score: 40 };
      return { interpretation: 'Low - Complacent', score: 25 };
    }
  },
  
  {
    name: 'commodity_price_index',
    source: 'Manual', // From Australian commodity tracker
    weight: 0.12, // Critical for Australian economy
    interpretation: (change: number) => {
      if (change < -20) return { interpretation: 'Collapsing - AU Export Crisis', score: 90 };
      if (change < -10) return { interpretation: 'Sharp Decline', score: 70 };
      if (change < 0) return { interpretation: 'Declining', score: 50 };
      if (change < 10) return { interpretation: 'Stable to Rising', score: 25 };
      return { interpretation: 'Booming', score: 15 };
    }
  }
];

async function fetchFredData(seriesId: string): Promise<{ date: string; value: number } | null> {
  if (!FRED_API_KEY) {
    console.warn('FRED_API_KEY not set');
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
    console.error(`Error fetching FRED ${seriesId}:`, error.message);
  }

  return null;
}

// Mock data for Australian indicators (in production, would scrape RBA/ABS websites)
function fetchAustralianIndicators(): {
  rbaCashRate: number;
  ausUnemployment: number;
  ausGDPGrowth: number;
  ausBuildingApprovals: number;
  chinaManufacturingPMI: number;
} {
  // These would be real API calls or web scraping in production
  return {
    rbaCashRate: 4.35, // Current RBA cash rate ~4.35%
    ausUnemployment: 4.1, // ~4.1% unemployment
    ausGDPGrowth: 1.5, // ~1.5% GDP growth (slowing)
    ausBuildingApprovals: -5, // Declining ~5%
    chinaManufacturingPMI: 50.1 // China PMI hovering around 50
  };
}

function calculateAustralianRecessionRisk(
  indicators: Array<{ name: string; score: number; weight: number }>
): {
  riskScore: number;
  prediction: string;
  recommendation: string;
  australianContext: string;
} {
  // Calculate weighted risk score
  const riskScore = indicators.reduce((total, ind) => total + (ind.score * ind.weight), 0);

  let prediction = '';
  let recommendation = '';
  let australianContext = '';

  if (riskScore >= 75) {
    prediction = 'CRITICAL: Australian recession highly likely within 6-12 months';
    recommendation = '🔴 URGENT ACTION: Preserve cash, delay major projects, secure credit facilities NOW. Review all supplier contracts. Expect significant demand reduction in construction/logistics. Consider workforce planning.';
    australianContext = 'High risk environment for Australian businesses. Chinese demand slowdown + global headwinds + tight RBA policy creating perfect storm. Mining exports at risk.';
  } else if (riskScore >= 60) {
    prediction = 'HIGH RISK: Elevated recession risk in next 12-18 months';
    recommendation = '🟠 CAUTION: Build cash reserves, delay non-essential capex. Secure long-term supply contracts while still available. Review project pipelines. Monitor Chinese demand closely - iron ore/coal prices critical.';
    australianContext = 'Australian economy vulnerable. Strong dependence on China (30% of exports) creates risk. Construction sector showing weakness. RBA policy restrictive.';
  } else if (riskScore >= 45) {
    prediction = 'MODERATE RISK: Some warning signs present';
    recommendation = '🟡 WATCH: Maintain financial flexibility. Monitor Chinese economic indicators weekly. Commodity prices and AUD exchange rate key. Be ready to pivot quickly. Review hedging strategies.';
    australianContext = 'Mixed signals. Australian economy still resilient but global headwinds increasing. China property sector weakness affecting iron ore demand. Watch RBA policy direction.';
  } else if (riskScore >= 30) {
    prediction = 'LOW RISK: Economy showing resilience';
    recommendation = '🟢 FAVORABLE: Stable environment for planning. Consider expanding if fundamentals support it. Lock in favorable rates. Still monitor global risks - don\'t be complacent.';
    australianContext = 'Australian economy performing reasonably. Commodity demand stable, trade relationships healthy. Construction sector mixed but functioning. Good time for strategic planning.';
  } else {
    prediction = 'VERY LOW RISK: Strong economic expansion';
    recommendation = '💚 OPPORTUNITY: Growth environment. Invest in capacity, hire talent, secure long-term contracts. Expansion opportunities available. Lock in suppliers and rates now while favorable.';
    australianContext = 'Strong Australian economic conditions. Commodity prices robust, Chinese demand healthy. Construction activity strong. Capitalize on favorable environment.';
  }

  return { riskScore, prediction, recommendation, australianContext };
}

async function collectAustralianEconomicData() {
  console.log('🇦🇺 AUSTRALIAN ECONOMIC DATA COLLECTION\n');
  console.log('='.repeat(70));
  console.log('Collecting RBA, ABS, and global indicators...');
  console.log('='.repeat(70) + '\n');

  const db = getDb();
  const collectedIndicators: Array<{
    name: string;
    score: number;
    weight: number;
    value: number;
    interpretation: string;
    source: string;
  }> = [];

  // Fetch Australian indicators
  console.log('📊 Fetching Australian indicators (RBA, ABS)...');
  const ausIndicators = fetchAustralianIndicators();

  // Process each indicator
  for (const indicator of INDICATORS) {
    try {
      let data: { date: string; value: number } | null = null;
      const today = new Date().toISOString().split('T')[0];

      // Fetch based on source
      if (indicator.source === 'FRED' && indicator.fredSeriesId) {
        data = await fetchFredData(indicator.fredSeriesId);
      } else if (indicator.source === 'RBA') {
        if (indicator.name === 'rba_cash_rate') {
          data = { date: today, value: ausIndicators.rbaCashRate };
        }
      } else if (indicator.source === 'ABS') {
        if (indicator.name === 'aus_unemployment_rate') {
          data = { date: today, value: ausIndicators.ausUnemployment };
        } else if (indicator.name === 'aus_gdp_growth') {
          data = { date: today, value: ausIndicators.ausGDPGrowth };
        } else if (indicator.name === 'aus_building_approvals') {
          data = { date: today, value: ausIndicators.ausBuildingApprovals };
        }
      } else if (indicator.source === 'Manual') {
        if (indicator.name === 'china_manufacturing_pmi') {
          data = { date: today, value: ausIndicators.chinaManufacturingPMI };
        } else if (indicator.name === 'commodity_price_index') {
          // Calculate from commodity tracker
          data = { date: today, value: 5 }; // Mock: +5% commodity prices
        }
      }

      if (!data) {
        console.log(`  ⚠️  ${indicator.name}: No data available (source: ${indicator.source})`);
        continue;
      }

      const { interpretation, score } = indicator.interpretation(data.value);

      // Store in database
      upsertEconomicIndicator({
        indicator_name: indicator.name,
        value: data.value,
        date: data.date,
        source: indicator.source,
        interpretation,
        score
      });

      collectedIndicators.push({
        name: indicator.name,
        score,
        weight: indicator.weight,
        value: data.value,
        interpretation,
        source: indicator.source
      });

      const icon = indicator.source === 'RBA' || indicator.source === 'ABS' ? '🇦🇺' : '🌏';
      console.log(`  ${icon} ${indicator.name}: ${data.value.toFixed(2)} - ${interpretation} (Risk: ${score}/100)`);
    } catch (error: any) {
      console.error(`  ✗ Error collecting ${indicator.name}:`, error.message);
    }
  }

  // Fetch commodity data
  console.log('\n💰 Fetching Australian commodity prices...');
  const commodities = await fetchAllAustralianCommodities();
  const commodityAnalysis = analyzeCommodityImpact(commodities);

  console.log(`   ${commodityAnalysis.overallTrend.toUpperCase()}: ${commodityAnalysis.economicImpact}`);
  console.log(`   ${commodityAnalysis.miningRevenue}`);
  console.log(`   ${commodityAnalysis.constructionCosts}`);

  // Calculate overall recession risk
  console.log('\n📈 Calculating Australian recession risk...');
  const { riskScore, prediction, recommendation, australianContext } = 
    calculateAustralianRecessionRisk(collectedIndicators);

  // Save recession risk history
  const today = new Date().toISOString().split('T')[0];
  saveRecessionRiskHistory({
    risk_score: riskScore,
    prediction,
    indicators_snapshot: JSON.stringify({
      indicators: collectedIndicators,
      commodities: commodityAnalysis,
      australianContext
    }),
    recommendation,
    date: today
  });

  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('🇦🇺 AUSTRALIAN RECESSION RISK ANALYSIS');
  console.log('='.repeat(70));
  console.log(`\n🎯 Overall Risk Score: ${riskScore.toFixed(1)}/100`);
  console.log(`📊 Prediction: ${prediction}`);
  console.log(`\n💡 Australian Context:\n   ${australianContext}`);
  console.log(`\n📋 Recommendation:\n   ${recommendation}`);
  console.log(`\n📦 Commodity Outlook:\n   ${commodityAnalysis.recommendation}`);
  console.log('\n' + '='.repeat(70));

  console.log('\n✅ Australian economic data collection completed!\n');
}

async function main() {
  try {
    await collectAustralianEconomicData();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

if (require.main === module) {
  main();
}

export { collectAustralianEconomicData };
