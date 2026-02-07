/**
 * Australian Commodity Price Tracker
 * Real-time prices for Australia's major exports: iron ore, coal, LNG, wheat, gold
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CommodityPrice {
  commodity: string;
  price: number;
  currency: string;
  unit: string;
  date: string;
  source: string;
  change24h?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  australianExportValue?: number; // Annual export value in AUD billions
}

/**
 * Fetch iron ore prices (Australia's #1 export)
 * Source: Trading Economics or IndexMundi
 */
export async function fetchIronOrePrice(): Promise<CommodityPrice | null> {
  try {
    // Using Trading Economics API (free tier available)
    // Fallback to web scraping if API not available
    const tradingEconomicsKey = process.env.TRADING_ECONOMICS_KEY;
    
    if (tradingEconomicsKey) {
      const response = await axios.get('https://api.tradingeconomics.com/markets/commodity/iron%20ore', {
        params: { c: tradingEconomicsKey }
      });
      
      const data = response.data[0];
      return {
        commodity: 'Iron Ore',
        price: data.Last,
        currency: 'USD',
        unit: 'per tonne',
        date: new Date().toISOString(),
        source: 'Trading Economics',
        change24h: data.DailyChange,
        changePercent: data.DailyPercentualChange,
        trend: data.DailyChange > 0 ? 'up' : data.DailyChange < 0 ? 'down' : 'stable',
        australianExportValue: 120 // ~A$120B annually
      };
    }
    
    // Fallback: Use mock data with realistic values
    return {
      commodity: 'Iron Ore',
      price: 110 + (Math.random() - 0.5) * 10, // ~$105-115/tonne
      currency: 'USD',
      unit: 'per tonne',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 4,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      australianExportValue: 120
    };
  } catch (error) {
    console.error('Error fetching iron ore price:', error);
    return null;
  }
}

/**
 * Fetch coal prices (Australia's #2 export by value)
 */
export async function fetchCoalPrices(): Promise<{
  thermal: CommodityPrice | null;
  coking: CommodityPrice | null;
}> {
  try {
    const tradingEconomicsKey = process.env.TRADING_ECONOMICS_KEY;
    
    // Thermal coal (Newcastle spot price)
    let thermal: CommodityPrice | null = null;
    if (tradingEconomicsKey) {
      try {
        const response = await axios.get('https://api.tradingeconomics.com/markets/commodity/coal', {
          params: { c: tradingEconomicsKey }
        });
        const data = response.data[0];
        thermal = {
          commodity: 'Thermal Coal',
          price: data.Last,
          currency: 'USD',
          unit: 'per tonne',
          date: new Date().toISOString(),
          source: 'Trading Economics',
          change24h: data.DailyChange,
          changePercent: data.DailyPercentualChange,
          trend: data.DailyChange > 0 ? 'up' : data.DailyChange < 0 ? 'down' : 'stable',
          australianExportValue: 55 // ~A$55B annually
        };
      } catch (e) {
        console.error('Error fetching thermal coal:', e);
      }
    }
    
    // Fallback thermal coal
    if (!thermal) {
      thermal = {
        commodity: 'Thermal Coal',
        price: 150 + (Math.random() - 0.5) * 20,
        currency: 'USD',
        unit: 'per tonne',
        date: new Date().toISOString(),
        source: 'Mock Data',
        change24h: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 3,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        australianExportValue: 55
      };
    }
    
    // Coking coal (hard coking coal spot)
    const coking: CommodityPrice = {
      commodity: 'Coking Coal',
      price: 300 + (Math.random() - 0.5) * 40,
      currency: 'USD',
      unit: 'per tonne',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 8,
      changePercent: (Math.random() - 0.5) * 3,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      australianExportValue: 35 // ~A$35B annually
    };
    
    return { thermal, coking };
  } catch (error) {
    console.error('Error fetching coal prices:', error);
    return { thermal: null, coking: null };
  }
}

/**
 * Fetch LNG prices (Australia's #3 export)
 */
export async function fetchLNGPrice(): Promise<CommodityPrice | null> {
  try {
    // LNG pricing is complex (JKM, Henry Hub, etc.)
    // Using Japan/Korea Marker (JKM) as most relevant for Australian exports
    
    // Mock data - realistic LNG prices
    return {
      commodity: 'LNG',
      price: 12 + (Math.random() - 0.5) * 4, // ~$10-14/MMBtu
      currency: 'USD',
      unit: 'per MMBtu',
      date: new Date().toISOString(),
      source: 'Mock Data (JKM)',
      change24h: (Math.random() - 0.5) * 1,
      changePercent: (Math.random() - 0.5) * 5,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      australianExportValue: 65 // ~A$65B annually
    };
  } catch (error) {
    console.error('Error fetching LNG price:', error);
    return null;
  }
}

/**
 * Fetch wheat prices (major agricultural export)
 */
export async function fetchWheatPrice(): Promise<CommodityPrice | null> {
  try {
    const tradingEconomicsKey = process.env.TRADING_ECONOMICS_KEY;
    
    if (tradingEconomicsKey) {
      try {
        const response = await axios.get('https://api.tradingeconomics.com/markets/commodity/wheat', {
          params: { c: tradingEconomicsKey }
        });
        const data = response.data[0];
        return {
          commodity: 'Wheat',
          price: data.Last,
          currency: 'USD',
          unit: 'per bushel',
          date: new Date().toISOString(),
          source: 'Trading Economics',
          change24h: data.DailyChange,
          changePercent: data.DailyPercentualChange,
          trend: data.DailyChange > 0 ? 'up' : data.DailyChange < 0 ? 'down' : 'stable',
          australianExportValue: 9 // ~A$9B annually
        };
      } catch (e) {
        console.error('Error fetching wheat price:', e);
      }
    }
    
    // Fallback
    return {
      commodity: 'Wheat',
      price: 550 + (Math.random() - 0.5) * 100, // ~$500-600/bushel (cents)
      currency: 'USD',
      unit: 'per bushel',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 3,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      australianExportValue: 9
    };
  } catch (error) {
    console.error('Error fetching wheat price:', error);
    return null;
  }
}

/**
 * Fetch gold prices (significant Australian export)
 */
export async function fetchGoldPrice(): Promise<CommodityPrice | null> {
  try {
    const tradingEconomicsKey = process.env.TRADING_ECONOMICS_KEY;
    
    if (tradingEconomicsKey) {
      try {
        const response = await axios.get('https://api.tradingeconomics.com/markets/commodity/gold', {
          params: { c: tradingEconomicsKey }
        });
        const data = response.data[0];
        return {
          commodity: 'Gold',
          price: data.Last,
          currency: 'USD',
          unit: 'per ounce',
          date: new Date().toISOString(),
          source: 'Trading Economics',
          change24h: data.DailyChange,
          changePercent: data.DailyPercentualChange,
          trend: data.DailyChange > 0 ? 'up' : data.DailyChange < 0 ? 'down' : 'stable',
          australianExportValue: 28 // ~A$28B annually
        };
      } catch (e) {
        console.error('Error fetching gold price:', e);
      }
    }
    
    // Fallback
    return {
      commodity: 'Gold',
      price: 2650 + (Math.random() - 0.5) * 100, // ~$2600-2700/oz
      currency: 'USD',
      unit: 'per ounce',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 30,
      changePercent: (Math.random() - 0.5) * 1,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      australianExportValue: 28
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return null;
  }
}

/**
 * Fetch construction material prices (relevant for Australian construction industry)
 */
export async function fetchConstructionMaterialPrices(): Promise<{
  steel: CommodityPrice | null;
  copper: CommodityPrice | null;
  aluminum: CommodityPrice | null;
}> {
  try {
    // Mock data for now - would integrate with LME (London Metal Exchange) API
    const steel: CommodityPrice = {
      commodity: 'Steel Rebar',
      price: 650 + (Math.random() - 0.5) * 50,
      currency: 'USD',
      unit: 'per tonne',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    const copper: CommodityPrice = {
      commodity: 'Copper',
      price: 9200 + (Math.random() - 0.5) * 500,
      currency: 'USD',
      unit: 'per tonne',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    const aluminum: CommodityPrice = {
      commodity: 'Aluminum',
      price: 2600 + (Math.random() - 0.5) * 200,
      currency: 'USD',
      unit: 'per tonne',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 50,
      changePercent: (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    return { steel, copper, aluminum };
  } catch (error) {
    console.error('Error fetching construction material prices:', error);
    return { steel: null, copper: null, aluminum: null };
  }
}

/**
 * Fetch AUD exchange rates (critical for import/export costs)
 */
export async function fetchAUDRates(): Promise<{
  audUsd: CommodityPrice | null;
  audCny: CommodityPrice | null;
  audEur: CommodityPrice | null;
}> {
  try {
    // Would use Alpha Vantage, XE.com, or OANDA API
    // Mock data for now
    const audUsd: CommodityPrice = {
      commodity: 'AUD/USD',
      price: 0.65 + (Math.random() - 0.5) * 0.05,
      currency: 'USD',
      unit: 'exchange rate',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 0.01,
      changePercent: (Math.random() - 0.5) * 1,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    const audCny: CommodityPrice = {
      commodity: 'AUD/CNY',
      price: 4.7 + (Math.random() - 0.5) * 0.2,
      currency: 'CNY',
      unit: 'exchange rate',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 0.05,
      changePercent: (Math.random() - 0.5) * 1,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    const audEur: CommodityPrice = {
      commodity: 'AUD/EUR',
      price: 0.61 + (Math.random() - 0.5) * 0.03,
      currency: 'EUR',
      unit: 'exchange rate',
      date: new Date().toISOString(),
      source: 'Mock Data',
      change24h: (Math.random() - 0.5) * 0.01,
      changePercent: (Math.random() - 0.5) * 1,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    return { audUsd, audCny, audEur };
  } catch (error) {
    console.error('Error fetching AUD rates:', error);
    return { audUsd: null, audCny: null, audEur: null };
  }
}

/**
 * Fetch all Australian commodity data
 */
export async function fetchAllAustralianCommodities(): Promise<{
  exports: {
    ironOre: CommodityPrice | null;
    thermalCoal: CommodityPrice | null;
    cokingCoal: CommodityPrice | null;
    lng: CommodityPrice | null;
    wheat: CommodityPrice | null;
    gold: CommodityPrice | null;
  };
  constructionMaterials: {
    steel: CommodityPrice | null;
    copper: CommodityPrice | null;
    aluminum: CommodityPrice | null;
  };
  currencies: {
    audUsd: CommodityPrice | null;
    audCny: CommodityPrice | null;
    audEur: CommodityPrice | null;
  };
  totalExportValue: number; // Total annual export value in AUD billions
  lastUpdated: string;
}> {
  console.log('💰 Fetching Australian commodity prices...\n');
  
  const [
    ironOre,
    coalPrices,
    lng,
    wheat,
    gold,
    constructionMaterials,
    currencies
  ] = await Promise.all([
    fetchIronOrePrice(),
    fetchCoalPrices(),
    fetchLNGPrice(),
    fetchWheatPrice(),
    fetchGoldPrice(),
    fetchConstructionMaterialPrices(),
    fetchAUDRates()
  ]);
  
  const totalExportValue = (
    (ironOre?.australianExportValue || 0) +
    (coalPrices.thermal?.australianExportValue || 0) +
    (coalPrices.coking?.australianExportValue || 0) +
    (lng?.australianExportValue || 0) +
    (wheat?.australianExportValue || 0) +
    (gold?.australianExportValue || 0)
  );
  
  console.log('✅ Commodity prices fetched');
  console.log(`   Total Australian export value: A$${totalExportValue.toFixed(0)}B annually\n`);
  
  return {
    exports: {
      ironOre,
      thermalCoal: coalPrices.thermal,
      cokingCoal: coalPrices.coking,
      lng,
      wheat,
      gold
    },
    constructionMaterials,
    currencies,
    totalExportValue,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculate commodity price impact on Australian economy
 */
export function analyzeCommodityImpact(
  currentPrices: Awaited<ReturnType<typeof fetchAllAustralianCommodities>>
): {
  overallTrend: 'bullish' | 'bearish' | 'mixed';
  economicImpact: string;
  miningRevenue: string;
  constructionCosts: string;
  recommendation: string;
} {
  const exports = Object.values(currentPrices.exports).filter(Boolean);
  const upCount = exports.filter(e => e?.trend === 'up').length;
  const downCount = exports.filter(e => e?.trend === 'down').length;
  
  let overallTrend: 'bullish' | 'bearish' | 'mixed' = 'mixed';
  if (upCount > downCount + 1) overallTrend = 'bullish';
  else if (downCount > upCount + 1) overallTrend = 'bearish';
  
  let economicImpact = '';
  let miningRevenue = '';
  let constructionCosts = '';
  let recommendation = '';
  
  if (overallTrend === 'bullish') {
    economicImpact = '🟢 Positive - Australian export revenue increasing';
    miningRevenue = 'Mining sector revenues improving. BHP, Rio Tinto, Fortescue likely to report strong results.';
    recommendation = 'FAVORABLE: Lock in long-term contracts now. Export-driven industries should capitalize on strong commodity prices. AUD likely to strengthen.';
  } else if (overallTrend === 'bearish') {
    economicImpact = '🔴 Negative - Australian export revenue declining';
    miningRevenue = 'Mining sector under pressure. Revenue declines expected for major exporters.';
    recommendation = 'CAUTION: Review budget forecasts. Export-heavy businesses should hedge commodity exposure. AUD may weaken, making imports more expensive.';
  } else {
    economicImpact = '🟡 Mixed - Varied commodity performance';
    miningRevenue = 'Mixed results across commodity sectors. Monitor individual exposures.';
    recommendation = 'WATCH: Diverging commodity prices create opportunities and risks. Diversification important.';
  }
  
  // Construction costs analysis
  const { steel, copper, aluminum } = currentPrices.constructionMaterials;
  const constructionUp = [steel, copper, aluminum].filter(m => m?.trend === 'up').length;
  
  if (constructionUp >= 2) {
    constructionCosts = 'Construction material costs rising. Budget for 5-10% cost increases on projects.';
  } else if (constructionUp === 0) {
    constructionCosts = 'Construction material costs easing. Favorable conditions for new projects.';
  } else {
    constructionCosts = 'Construction material costs stable. Current budgets should hold.';
  }
  
  return {
    overallTrend,
    economicImpact,
    miningRevenue,
    constructionCosts,
    recommendation
  };
}
