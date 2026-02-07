'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface RecessionRiskData {
  riskScore: number;
  prediction: string;
  recommendation: string;
  lastUpdated: string | null;
  indicators: Array<{
    name: string;
    score: number;
    weight: number;
    value: number;
    interpretation: string;
  }>;
}

export default function RecessionRiskMeter() {
  const [riskData, setRiskData] = useState<RecessionRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const response = await fetch('/api/recession-risk');
      const data = await response.json();
      setRiskData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recession risk:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-700';
    if (score >= 60) return 'from-orange-500 to-orange-700';
    if (score >= 30) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return { text: 'CRITICAL RISK', icon: AlertTriangle, color: 'text-red-400' };
    if (score >= 60) return { text: 'HIGH RISK', icon: TrendingDown, color: 'text-orange-400' };
    if (score >= 30) return { text: 'MODERATE', icon: Info, color: 'text-yellow-400' };
    return { text: 'LOW RISK', icon: TrendingUp, color: 'text-green-400' };
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
          <div className="h-32 bg-slate-700 rounded mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      </motion.div>
    );
  }

  const riskScore = riskData?.riskScore || 0;
  const riskLabel = getRiskLabel(riskScore);
  const RiskIcon = riskLabel.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Recession Risk Meter
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Based on 10 economic indicators
            </p>
          </div>
          <RiskIcon className={`w-8 h-8 ${riskLabel.color}`} />
        </div>

        {/* Risk Score Gauge */}
        <div className="mb-6">
          <div className="relative h-32 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="20"
              />
              {/* Animated Risk Arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#riskGradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 502.4} 502.4`}
                initial={{ strokeDasharray: '0 502.4' }}
                animate={{ strokeDasharray: `${(riskScore / 100) * 502.4} 502.4` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={getRiskColor(riskScore).includes('green') ? 'text-green-500' : getRiskColor(riskScore).includes('yellow') ? 'text-yellow-500' : getRiskColor(riskScore).includes('orange') ? 'text-orange-500' : 'text-red-500'} stopColor="currentColor" />
                  <stop offset="100%" className={getRiskColor(riskScore).includes('green') ? 'text-green-600' : getRiskColor(riskScore).includes('yellow') ? 'text-yellow-600' : getRiskColor(riskScore).includes('orange') ? 'text-orange-600' : 'text-red-700'} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Score */}
            <div className="text-center z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-4xl font-bold"
              >
                <span className={riskLabel.color}>
                  {riskScore.toFixed(0)}
                </span>
              </motion.div>
              <div className="text-xs text-slate-500">/ 100</div>
            </div>
          </div>

          {/* Risk Label */}
          <div className="text-center mt-4">
            <div className={`text-lg font-bold ${riskLabel.color}`}>
              {riskLabel.text}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              {riskData?.prediction}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              {riskScore >= 60 ? '🔴' : riskScore >= 40 ? '🟡' : '🟢'}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">
                Strategic Recommendation
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                {riskData?.recommendation?.replace(/^[🔴🟡🟢]\s*[A-Z\s]+:\s*/, '') || 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {riskData?.lastUpdated && (
          <div className="text-xs text-slate-600 mt-4 text-center">
            Updated: {new Date(riskData.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
