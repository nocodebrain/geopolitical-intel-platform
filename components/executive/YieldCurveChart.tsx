'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface YieldCurveData {
  date: string;
  value: number;
  interpretation: string;
}

export default function YieldCurveChart() {
  const [data, setData] = useState<YieldCurveData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYieldCurveData();
  }, []);

  const fetchYieldCurveData = async () => {
    try {
      const response = await fetch('/api/yield-curve?limit=90');
      const result = await response.json();
      
      // Reverse to show oldest first
      const history = result.history.reverse().map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.value,
        interpretation: item.interpretation
      }));
      
      setData(history);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching yield curve data:', error);
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-slate-200">{data.date}</p>
          <p className={`text-sm font-bold ${data.value < 0 ? 'text-red-400' : 'text-green-400'}`}>
            Spread: {data.value.toFixed(2)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">{data.interpretation}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const isInverted = latestValue < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className={`absolute inset-0 ${isInverted ? 'bg-gradient-to-br from-red-500/5 to-red-500/0' : 'bg-gradient-to-br from-green-500/5 to-green-500/0'}`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isInverted ? 'bg-red-500' : 'bg-green-500'}`}></span>
              Yield Curve Monitor
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              10-Year vs 2-Year Treasury Spread
            </p>
          </div>
          {isInverted && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
              <TrendingDown className="w-4 h-4" />
              INVERTED
            </div>
          )}
        </div>

        {/* Current Spread */}
        <div className="mb-4">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-sm text-slate-400 mb-1">Current Spread</div>
            <div className={`text-3xl font-bold ${isInverted ? 'text-red-400' : 'text-green-400'}`}>
              {latestValue.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {isInverted ? 'Recession signal historically' : 'Normal yield curve'}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inversionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                style={{ fontSize: '11px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b" 
                style={{ fontSize: '11px' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Zero line - critical threshold */}
              <ReferenceLine 
                y={0} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ value: 'Inversion Line', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }}
              />
              
              <Line
                type="monotone"
                dataKey="value"
                stroke={isInverted ? '#ef4444' : '#10b981'}
                strokeWidth={2}
                dot={false}
                fill={isInverted ? 'url(#inversionGradient)' : 'url(#yieldGradient)'}
                fillOpacity={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal (Positive Spread)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Inverted (Negative Spread)</span>
            </div>
          </div>
          <p className="text-center mt-2 text-slate-600">
            Inversions typically precede recessions by 6-18 months
          </p>
        </div>
      </div>
    </motion.div>
  );
}
