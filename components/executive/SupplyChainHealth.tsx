'use client';

import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HealthMetric {
  name: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: number;
}

interface SupplyChainHealthProps {
  events: Array<{
    impact_tags?: string;
    severity: number;
    region: string;
  }>;
}

export default function SupplyChainHealth({ events }: SupplyChainHealthProps) {
  const [overallHealth, setOverallHealth] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    calculateHealthMetrics();
  }, [events]);

  const calculateHealthMetrics = () => {
    // Extract supply chain related events
    const supplyChainEvents = events.filter(e => {
      if (!e.impact_tags) return false;
      const tags = JSON.parse(e.impact_tags);
      return tags.some((tag: string) => 
        ['supply-chain-critical', 'logistics', 'shipping-routes', 'procurement', 'materials-pricing'].includes(tag)
      );
    });

    // Calculate metrics for different aspects
    const logisticsEvents = supplyChainEvents.filter(e => {
      const tags = JSON.parse(e.impact_tags || '[]');
      return tags.includes('logistics') || tags.includes('shipping-routes');
    });

    const procurementEvents = supplyChainEvents.filter(e => {
      const tags = JSON.parse(e.impact_tags || '[]');
      return tags.includes('procurement') || tags.includes('materials-pricing');
    });

    const criticalEvents = supplyChainEvents.filter(e => e.severity >= 7);

    // Calculate scores (100 = perfect, 0 = critical)
    const logisticsScore = Math.max(0, 100 - (logisticsEvents.length * 8) - (logisticsEvents.filter(e => e.severity >= 8).length * 15));
    const procurementScore = Math.max(0, 100 - (procurementEvents.length * 7) - (procurementEvents.filter(e => e.severity >= 8).length * 12));
    const routeScore = Math.max(0, 100 - (logisticsEvents.filter(e => e.severity >= 6).length * 10));
    const materialScore = Math.max(0, 100 - (procurementEvents.filter(e => e.severity >= 6).length * 9));

    const getStatus = (score: number): 'healthy' | 'warning' | 'critical' => {
      if (score >= 70) return 'healthy';
      if (score >= 40) return 'warning';
      return 'critical';
    };

    const metricsData: HealthMetric[] = [
      {
        name: 'Shipping Routes',
        score: Math.round(routeScore),
        status: getStatus(routeScore),
        issues: logisticsEvents.filter(e => e.severity >= 6).length
      },
      {
        name: 'Material Supply',
        score: Math.round(materialScore),
        status: getStatus(materialScore),
        issues: procurementEvents.filter(e => e.severity >= 6).length
      },
      {
        name: 'Logistics Network',
        score: Math.round(logisticsScore),
        status: getStatus(logisticsScore),
        issues: logisticsEvents.length
      },
      {
        name: 'Procurement',
        score: Math.round(procurementScore),
        status: getStatus(procurementScore),
        issues: procurementEvents.length
      }
    ];

    setMetrics(metricsData);
    
    const avgHealth = metricsData.reduce((sum, m) => sum + m.score, 0) / metricsData.length;
    setOverallHealth(Math.round(avgHealth));
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return { text: 'text-green-400', bg: 'bg-green-500', light: 'bg-green-500/20' };
    if (score >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500', light: 'bg-yellow-500/20' };
    return { text: 'text-red-400', bg: 'bg-red-500', light: 'bg-red-500/20' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const healthColor = getHealthColor(overallHealth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Supply Chain Health
            </h3>
            <p className="text-xs text-slate-500">Real-time network status</p>
          </div>
          <Package className="w-5 h-5 text-slate-500" />
        </div>

        {/* Overall Health Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Overall Health</span>
            <span className={`text-3xl font-bold ${healthColor.text}`}>
              {overallHealth}%
            </span>
          </div>
          
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallHealth}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${healthColor.bg} rounded-full`}
            />
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => {
            const color = getHealthColor(metric.score);
            
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-slate-800/40 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm text-slate-200">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.issues > 0 && (
                      <span className="text-xs text-slate-500">
                        {metric.issues} issue{metric.issues !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`text-lg font-bold ${color.text}`}>
                      {metric.score}%
                    </span>
                  </div>
                </div>
                
                <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 * index }}
                    className={`h-full ${color.bg} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alert Box */}
        {overallHealth < 70 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-4 p-3 rounded-lg border ${
              overallHealth < 40 
                ? 'bg-red-950/30 border-red-900/50' 
                : 'bg-yellow-950/30 border-yellow-900/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                overallHealth < 40 ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <p className={`text-xs ${
                overallHealth < 40 ? 'text-red-300' : 'text-yellow-300'
              }`}>
                {overallHealth < 40 
                  ? 'Critical disruptions detected. Review AI Strategic Advisor for mitigation strategies.'
                  : 'Supply chain stress detected. Monitor developments and prepare contingencies.'}
              </p>
            </div>
          </motion.div>
        )}

        {overallHealth >= 70 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-green-950/30 border border-green-900/50 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-300">
                Supply chain operating within normal parameters. Continue monitoring.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
