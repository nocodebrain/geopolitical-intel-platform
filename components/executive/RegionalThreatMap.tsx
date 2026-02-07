'use client';

import { motion } from 'framer-motion';
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
      
      // Calculate risk score
      let score = (avgSeverity * 8) + (criticalCount * 5);
      score = Math.min(100, Math.max(0, score));

      let level: 'low' | 'moderate' | 'high' | 'critical';
      if (score >= 80) level = 'critical';
      else if (score >= 60) level = 'high';
      else if (score >= 40) level = 'moderate';
      else level = 'low';

      // Find top threat
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
      case 'critical': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', bar: 'bg-red-500' };
      case 'high': return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', bar: 'bg-orange-500' };
      case 'moderate': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', bar: 'bg-yellow-500' };
      case 'low': return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', bar: 'bg-green-500' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-500', text: 'text-slate-400', bar: 'bg-slate-500' };
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Regional Threat Assessment
            </h3>
            <p className="text-xs text-slate-500">Risk scores by region (0-100)</p>
          </div>
          <MapPin className="w-5 h-5 text-slate-500" />
        </div>

        <div className="space-y-4">
          {regionThreats.map((threat, index) => {
            const colors = getLevelColor(threat.level);
            
            return (
              <motion.div
                key={threat.region}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRegionEmoji(threat.region)}</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{threat.region}</h4>
                      <p className="text-xs text-slate-500">{threat.eventCount} active events</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">
                      {threat.score}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
                      {threat.level.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Threat bar */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${threat.score}%` }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                    className={`h-full ${colors.bar} rounded-full`}
                  />
                </div>

                {/* Top threat */}
                <div className="bg-slate-800/30 rounded p-2">
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500 font-medium">Top threat:</span> {threat.topThreat}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Average */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-4 border-t border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Global Average Risk</span>
            <span className="text-xl font-bold text-white">
              {Math.round(regionThreats.reduce((sum, r) => sum + r.score, 0) / regionThreats.length) || 0}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
