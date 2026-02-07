'use client';

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
    if (score >= 80) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-600', border: 'border-red-600' };
    if (score >= 60) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-600', border: 'border-orange-600' };
    if (score >= 40) return { label: 'ELEVATED', color: 'text-yellow-500', bg: 'bg-yellow-600', border: 'border-yellow-600' };
    return { label: 'MODERATE', color: 'text-green-500', bg: 'bg-green-600', border: 'border-green-600' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-100">
          Global Risk Score
        </h3>
        {trend !== 'stable' && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {trend === 'up' ? 'Rising' : 'Falling'}
            </span>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="flex items-end gap-4 mb-6">
        <div className="relative">
          <div className="text-5xl font-bold text-slate-100">
            {riskScore}
          </div>
          <div className="absolute -top-1 -right-6 text-xl text-slate-500">
            /100
          </div>
        </div>

        <div className="mb-2">
          <div className={`px-3 py-1 rounded ${riskLevel.bg}`}>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {riskLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${riskLevel.bg}`}
          style={{ 
            width: `${riskScore}%`,
            transition: 'width 1s ease-out' 
          }}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-slate-500 mb-1 text-xs">7-Day Average</div>
          <div className="text-slate-100 font-bold">{riskScore}/100</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded p-3">
          <div className="text-slate-500 mb-1 text-xs">Previous Week</div>
          <div className="text-slate-100 font-bold">{previousScore}/100</div>
        </div>
      </div>

      {/* Advisory */}
      {riskScore >= 70 && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-950 border border-red-900 rounded">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">
            High-risk environment detected. Review critical events and consider contingency measures.
          </p>
        </div>
      )}
    </div>
  );
}
