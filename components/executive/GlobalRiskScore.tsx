'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GlobalRiskScoreProps {
  events: Array<{ severity: number; category: string; date: string }>;
}

export default function GlobalRiskScore({ events }: GlobalRiskScoreProps) {
  const [riskScore, setRiskScore] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [previousScore, setPreviousScore] = useState(0);

  useEffect(() => {
    if (events.length === 0) return;

    // Calculate global risk score (0-100)
    const recentEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    });

    if (recentEvents.length === 0) {
      setRiskScore(30); // Baseline
      return;
    }

    // Weighted scoring
    const avgSeverity = recentEvents.reduce((sum, e) => sum + e.severity, 0) / recentEvents.length;
    const criticalCount = recentEvents.filter(e => e.severity >= 8).length;
    const highCount = recentEvents.filter(e => e.severity >= 6).length;
    
    // Score formula
    let score = (avgSeverity * 8) + (criticalCount * 3) + (highCount * 1.5);
    score = Math.min(100, Math.max(0, score));

    // Calculate trend
    const olderEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= twoWeeksAgo && eventDate < weekAgo;
    });

    if (olderEvents.length > 0) {
      const oldAvgSeverity = olderEvents.reduce((sum, e) => sum + e.severity, 0) / olderEvents.length;
      const oldScore = oldAvgSeverity * 8;
      setPreviousScore(Math.round(oldScore));
      
      if (score > oldScore + 5) setTrend('up');
      else if (score < oldScore - 5) setTrend('down');
      else setTrend('stable');
    }

    setRiskScore(Math.round(score));
  }, [events]);

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500' };
    if (score >= 60) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' };
    if (score >= 40) return { label: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500' };
    return { label: 'MODERATE', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Global Risk Score
          </h3>
          {trend !== 'stable' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-400" />
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {trend === 'up' ? 'Rising' : 'Falling'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Score Display */}
        <div className="flex items-end gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className={`text-6xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
              {riskScore}
            </div>
            <div className="absolute -top-2 -right-6 text-2xl text-slate-500 font-light">
              /100
            </div>
          </motion.div>

          <div className="mb-2">
            <div className={`px-3 py-1 rounded-full ${riskLevel.bg} ${riskLevel.border} border`}>
              <span className={`text-sm font-bold ${riskLevel.color}`}>
                {riskLevel.label}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${
              riskScore >= 80 ? 'from-red-500 to-red-600' :
              riskScore >= 60 ? 'from-orange-500 to-orange-600' :
              riskScore >= 40 ? 'from-yellow-500 to-yellow-600' :
              'from-green-500 to-green-600'
            }`}
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 mb-1">7-Day Average</div>
            <div className="text-slate-200 font-semibold">{riskScore}/100</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-500 mb-1">Previous Week</div>
            <div className="text-slate-200 font-semibold">{previousScore}/100</div>
          </div>
        </div>

        {/* Advisory */}
        {riskScore >= 70 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              High-risk environment detected. Review critical events and consider contingency measures.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
