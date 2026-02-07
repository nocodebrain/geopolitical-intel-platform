'use client';

import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RegionThreat {
  region: string;
  score: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  eventCount: number;
  topThreat: string;
}

interface RegionalThreatMapProps {
  events: Array<{
    region: string;
    severity: number;
    category: string;
    title: string;
  }>;
}

export default function RegionalThreatMap({ events }: RegionalThreatMapProps) {
  const [regionThreats, setRegionThreats] = useState<RegionThreat[]>([]);

  useEffect(() => {
    calculateRegionalThreats();
  }, [events]);

  const calculateRegionalThreats = () => {
    const regions = ['Asia-Pacific', 'Middle East', 'Europe', 'Americas', 'Africa'];
    
    const threats: RegionThreat[] = regions.map(region => {
      const regionEvents = events.filter(e => e.region === region);
      
      if (regionEvents.length === 0) {
        return {
          region,
          score: 20,
          level: 'low' as const,
          eventCount: 0,
          topThreat: 'No significant threats'
        };
      }

      const avgSeverity = regionEvents.reduce((sum, e) => sum + e.severity, 0) / regionEvents.length;
      const criticalCount = regionEvents.filter(e => e.severity >= 8).length;
      
      let score = (avgSeverity * 8) + (criticalCount * 5);
      score = Math.min(100, Math.max(0, score));

      let level: 'low' | 'moderate' | 'high' | 'critical';
      if (score >= 80) level = 'critical';
      else if (score >= 60) level = 'high';
      else if (score >= 40) level = 'moderate';
      else level = 'low';

      const sortedEvents = [...regionEvents].sort((a, b) => b.severity - a.severity);
      const topThreat = sortedEvents[0]?.title.substring(0, 60) || 'Monitoring situation';

      return {
        region,
        score: Math.round(score),
        level,
        eventCount: regionEvents.length,
        topThreat
      };
    });

    setRegionThreats(threats);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return { bg: 'bg-red-600', border: 'border-red-600', text: 'text-white' };
      case 'high': return { bg: 'bg-orange-600', border: 'border-orange-600', text: 'text-white' };
      case 'moderate': return { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-white' };
      case 'low': return { bg: 'bg-green-600', border: 'border-green-600', text: 'text-white' };
      default: return { bg: 'bg-slate-600', border: 'border-slate-600', text: 'text-white' };
    }
  };

  const getRegionEmoji = (region: string) => {
    switch (region) {
      case 'Asia-Pacific': return '🌏';
      case 'Middle East': return '🕌';
      case 'Europe': return '🏰';
      case 'Americas': return '🗽';
      case 'Africa': return '🦁';
      default: return '🌍';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Regional Threat Assessment
          </h3>
          <p className="text-xs text-slate-500 mt-1">Risk scores by region (0-100)</p>
        </div>
        <MapPin className="w-6 h-6 text-slate-500" />
      </div>

      <div className="space-y-4">
        {regionThreats.map((threat) => {
          const colors = getLevelColor(threat.level);
          
          return (
            <div key={threat.region}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getRegionEmoji(threat.region)}</span>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{threat.region}</h4>
                    <p className="text-xs text-slate-500">{threat.eventCount} active events</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-100 mb-1">
                    {threat.score}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${colors.bg} ${colors.text} font-bold uppercase tracking-wide`}>
                    {threat.level}
                  </span>
                </div>
              </div>

              {/* Threat bar */}
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${colors.bg}`}
                  style={{ width: `${threat.score}%`, transition: 'width 1s ease-out' }}
                />
              </div>

              {/* Top threat */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2">
                <p className="text-xs text-slate-400">
                  <span className="text-slate-500 font-bold">Top threat:</span> {threat.topThreat}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Average */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-400">Global Average Risk</span>
          <span className="text-2xl font-bold text-slate-100">
            {Math.round(regionThreats.reduce((sum, r) => sum + r.score, 0) / regionThreats.length) || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
