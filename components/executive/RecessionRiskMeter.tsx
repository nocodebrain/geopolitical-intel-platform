'use client';

import { useEffect, useState } from 'react';
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
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 30) return '#eab308';
    return '#10b981';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return { text: 'CRITICAL RISK', icon: AlertTriangle, color: 'text-red-500' };
    if (score >= 60) return { text: 'HIGH RISK', icon: TrendingDown, color: 'text-orange-500' };
    if (score >= 30) return { text: 'MODERATE', icon: Info, color: 'text-yellow-500' };
    return { text: 'LOW RISK', icon: TrendingUp, color: 'text-green-500' };
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-slate-800 rounded mb-4"></div>
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const riskScore = riskData?.riskScore || 0;
  const riskLabel = getRiskLabel(riskScore);
  const RiskIcon = riskLabel.icon;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Recession Risk Meter
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            10 economic indicators
          </p>
        </div>
        <RiskIcon className={`w-7 h-7 ${riskLabel.color}`} />
      </div>

      {/* Simple Circular Gauge */}
      <div className="mb-6">
        <div className="relative h-36 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgb(30, 41, 59)"
              strokeWidth="16"
            />
            {/* Risk Arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getStrokeColor(riskScore)}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          
          {/* Center Score */}
          <div className="text-center z-10">
            <div className={`text-5xl font-bold ${getRiskColor(riskScore)}`}>
              {riskScore.toFixed(0)}
            </div>
            <div className="text-sm text-slate-500">/ 100</div>
          </div>
        </div>

        {/* Risk Label */}
        <div className="text-center mt-4">
          <div className={`text-base font-bold ${riskLabel.color}`}>
            {riskLabel.text}
          </div>
          <div className="text-sm text-slate-400 mt-2">
            {riskData?.prediction}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-slate-950 border border-slate-800 rounded p-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-lg">
            {riskScore >= 60 ? '🔴' : riskScore >= 40 ? '🟡' : '🟢'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Recommendation
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
  );
}
