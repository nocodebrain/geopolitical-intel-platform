'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  history: Array<{ value: number }>;
  color: string;
}

export default function CommodityTracker() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  useEffect(() => {
    // In production, fetch from API/database
    const mockCommodities: Commodity[] = [
      {
        name: 'Steel',
        symbol: 'HRC',
        price: 1240,
        change: 45,
        changePercent: 3.8,
        unit: 'USD/ton',
        history: [
          { value: 1180 }, { value: 1195 }, { value: 1205 }, { value: 1215 },
          { value: 1225 }, { value: 1230 }, { value: 1240 }
        ],
        color: '#3b82f6'
      },
      {
        name: 'Copper',
        symbol: 'HG',
        price: 8750,
        change: -120,
        changePercent: -1.4,
        unit: 'USD/ton',
        history: [
          { value: 8900 }, { value: 8880 }, { value: 8850 }, { value: 8820 },
          { value: 8800 }, { value: 8770 }, { value: 8750 }
        ],
        color: '#f97316'
      },
      {
        name: 'Crude Oil',
        symbol: 'WTI',
        price: 82.5,
        change: 2.3,
        changePercent: 2.9,
        unit: 'USD/barrel',
        history: [
          { value: 78 }, { value: 79 }, { value: 80 }, { value: 80.5 },
          { value: 81 }, { value: 81.8 }, { value: 82.5 }
        ],
        color: '#10b981'
      },
      {
        name: 'Cement',
        symbol: 'CEM',
        price: 145,
        change: 8,
        changePercent: 5.8,
        unit: 'USD/ton',
        history: [
          { value: 130 }, { value: 132 }, { value: 135 }, { value: 138 },
          { value: 140 }, { value: 143 }, { value: 145 }
        ],
        color: '#eab308'
      }
    ];

    setCommodities(mockCommodities);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-100">
          Commodity Prices
        </h3>
        <p className="text-xs text-slate-500 mt-1">Live market data</p>
      </div>

      <div className="space-y-4">
        {commodities.map((commodity) => (
          <div
            key={commodity.symbol}
            className="bg-slate-950 border border-slate-800 rounded p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-100">{commodity.name}</h4>
                  <span className="text-xs text-slate-500">{commodity.symbol}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-100">
                    {commodity.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">{commodity.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`flex items-center gap-1 justify-end mb-1 text-base font-bold ${
                  commodity.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {commodity.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {commodity.change >= 0 ? '+' : ''}{commodity.change}
                  </span>
                </div>
                <div className={`text-sm font-semibold ${
                  commodity.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent}%
                </div>
              </div>
            </div>

            {/* Simple chart */}
            <div className="h-12 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commodity.history}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={commodity.color}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(15, 23, 42)',
                      border: '1px solid rgb(30, 41, 59)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`${value} ${commodity.unit}`, commodity.name]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Market Alert */}
      <div className="mt-4 p-3 bg-blue-950 border border-blue-900 rounded">
        <p className="text-xs text-blue-300">
          <span className="font-bold">Alert:</span> Steel and cement prices rising due to infrastructure demand. Consider locking rates.
        </p>
      </div>
    </div>
  );
}
