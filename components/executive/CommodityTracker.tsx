'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
    // For now, simulate with realistic data
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Commodity Prices
            </h3>
            <p className="text-xs text-slate-500">Live market data</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>

        <div className="space-y-4">
          {commodities.map((commodity, index) => (
            <motion.div
              key={commodity.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative bg-slate-800/40 rounded-lg p-4 hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-200">{commodity.name}</h4>
                    <span className="text-xs text-slate-500">{commodity.symbol}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {commodity.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">{commodity.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`flex items-center gap-1 mb-1 ${
                    commodity.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {commodity.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {commodity.change >= 0 ? '+' : ''}{commodity.change}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${
                    commodity.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent}%
                  </div>
                </div>
              </div>

              {/* Mini chart */}
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
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`${value} ${commodity.unit}`, commodity.name]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Market Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Market Alert:</span> Steel and cement prices trending up due to infrastructure demand. Consider locking in rates.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
