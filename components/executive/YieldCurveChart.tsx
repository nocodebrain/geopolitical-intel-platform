'use client';

import { useEffect, useState } from 'react';
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
        <div className="bg-slate-900 border border-slate-700 rounded p-3">
          <p className="text-sm font-bold text-slate-200">{data.date}</p>
          <p className={`text-sm font-bold ${data.value < 0 ? 'text-red-500' : 'text-green-500'}`}>
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const isInverted = latestValue < 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Yield Curve Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            10-Year vs 2-Year Treasury Spread
          </p>
        </div>
        {isInverted && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
            <TrendingDown className="w-4 h-4" />
            INVERTED
          </div>
        )}
      </div>

      {/* Current Spread */}
      <div className="mb-6">
        <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded">
          <div className="text-sm text-slate-400 mb-1 font-semibold">Current Spread</div>
          <div className={`text-4xl font-bold ${isInverted ? 'text-red-500' : 'text-green-500'}`}>
            {latestValue.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {isInverted ? 'Recession signal historically' : 'Normal yield curve'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="text-xs text-slate-500">
        <div className="flex items-center gap-4 justify-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Normal (Positive Spread)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Inverted (Negative Spread)</span>
          </div>
        </div>
        <p className="text-center text-slate-600">
          Inversions typically precede recessions by 6-18 months
        </p>
      </div>
    </div>
  );
}
