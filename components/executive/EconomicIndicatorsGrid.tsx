'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  TrendingUp, 
  Factory, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity, 
  Home, 
  Building2,
  Fuel,
  AlertCircle
} from 'lucide-react';

interface Indicator {
  indicator_name: string;
  value: number;
  interpretation: string;
  score: number;
  date: string;
}

const INDICATOR_CONFIG: { [key: string]: { label: string; icon: any; unit: string } } = {
  yield_curve: { label: 'Yield Curve', icon: TrendingDown, unit: '% spread' },
  manufacturing_pmi: { label: 'Manufacturing PMI', icon: Factory, unit: 'index' },
  unemployment_rate: { label: 'Unemployment', icon: Users, unit: '%' },
  consumer_confidence: { label: 'Consumer Confidence', icon: ShoppingCart, unit: 'index' },
  gdp_growth: { label: 'GDP Growth', icon: DollarSign, unit: '% YoY' },
  vix: { label: 'Market Volatility', icon: Activity, unit: 'VIX' },
  housing_starts: { label: 'Housing Starts', icon: Home, unit: 'K units' },
  corporate_bond_spread: { label: 'Corp. Bond Spread', icon: Building2, unit: '% spread' },
  commodity_prices: { label: 'Commodities', icon: Fuel, unit: '$ WTI' },
  banking_stress: { label: 'Banking Stress', icon: AlertCircle, unit: '% delinq.' }
};

export default function EconomicIndicatorsGrid() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/economic-indicators');
      const data = await response.json();
      setIndicators(data.indicators || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
      
      <div className="relative">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Economic Indicators
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            10 leading recession predictors
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {indicators.map((indicator, index) => {
            const config = INDICATOR_CONFIG[indicator.indicator_name];
            if (!config) return null;

            const Icon = config.icon;
            const scoreColor = getScoreTextColor(indicator.score);

            return (
              <motion.div
                key={indicator.indicator_name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all h-full">
                  {/* Icon & Score Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getScoreColor(indicator.score)} opacity-20`}>
                      <Icon className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className={`text-xs font-bold ${scoreColor}`}>
                      {indicator.score.toFixed(0)}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-xs font-semibold text-slate-400 mb-1">
                    {config.label}
                  </div>

                  {/* Value */}
                  <div className="text-lg font-bold text-slate-200 mb-1">
                    {indicator.value.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-600">
                    {config.unit}
                  </div>

                  {/* Status Bar */}
                  <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${indicator.score}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={`h-full bg-gradient-to-r ${getScoreColor(indicator.score)}`}
                    />
                  </div>

                  {/* Interpretation - shown on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                    <div className="text-xs text-slate-400 italic">
                      {indicator.interpretation}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-700/30">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <span className="text-slate-500">Low Risk (0-40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              <span className="text-slate-500">Moderate (40-60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <span className="text-slate-500">High (60-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600"></div>
              <span className="text-slate-500">Critical (80+)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
