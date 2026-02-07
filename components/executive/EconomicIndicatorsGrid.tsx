'use client';

import { useEffect, useState } from 'react';
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
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-100">
          Economic Indicators
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          10 leading recession predictors
        </p>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Indicator
              </th>
              <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Value
              </th>
              <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Risk
              </th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((indicator) => {
              const config = INDICATOR_CONFIG[indicator.indicator_name];
              if (!config) return null;

              const Icon = config.icon;

              return (
                <tr 
                  key={indicator.indicator_name}
                  className="border-b border-slate-800 hover:bg-slate-850 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          {config.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {config.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="text-base font-bold text-slate-100">
                      {indicator.value.toFixed(1)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`text-base font-bold ${getScoreColor(indicator.score)}`}>
                        {indicator.score.toFixed(0)}
                      </div>
                      <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreBg(indicator.score)}`}
                          style={{ width: `${indicator.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-xs text-slate-400">
                      {indicator.interpretation}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-600"></div>
            <span className="text-slate-500">Low (0-40)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-600"></div>
            <span className="text-slate-500">Moderate (40-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-600"></div>
            <span className="text-slate-500">High (60-80)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-600"></div>
            <span className="text-slate-500">Critical (80+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
