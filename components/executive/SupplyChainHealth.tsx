'use client';

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
    const supplyChainEvents = events.filter(e => {
      if (!e.impact_tags) return false;
      const tags = JSON.parse(e.impact_tags);
      return tags.some((tag: string) => 
        ['supply-chain-critical', 'logistics', 'shipping-routes', 'procurement', 'materials-pricing'].includes(tag)
      );
    });

    const logisticsEvents = supplyChainEvents.filter(e => {
      const tags = JSON.parse(e.impact_tags || '[]');
      return tags.includes('logistics') || tags.includes('shipping-routes');
    });

    const procurementEvents = supplyChainEvents.filter(e => {
      const tags = JSON.parse(e.impact_tags || '[]');
      return tags.includes('procurement') || tags.includes('materials-pricing');
    });

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
      { name: 'Shipping Routes', score: Math.round(routeScore), status: getStatus(routeScore), issues: logisticsEvents.filter(e => e.severity >= 6).length },
      { name: 'Material Supply', score: Math.round(materialScore), status: getStatus(materialScore), issues: procurementEvents.filter(e => e.severity >= 6).length },
      { name: 'Logistics Network', score: Math.round(logisticsScore), status: getStatus(logisticsScore), issues: logisticsEvents.length },
      { name: 'Procurement', score: Math.round(procurementScore), status: getStatus(procurementScore), issues: procurementEvents.length }
    ];

    setMetrics(metricsData);
    setOverallHealth(Math.round(metricsData.reduce((sum, m) => sum + m.score, 0) / metricsData.length));
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return { text: 'text-green-500', bg: 'bg-green-600' };
    if (score >= 40) return { text: 'text-yellow-500', bg: 'bg-yellow-600' };
    return { text: 'text-red-500', bg: 'bg-red-600' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const healthColor = getHealthColor(overallHealth);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Supply Chain Health
          </h3>
          <p className="text-xs text-slate-500 mt-1">Real-time network status</p>
        </div>
        <Package className="w-6 h-6 text-slate-500" />
      </div>

      {/* Overall Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-400">Overall Health</span>
          <span className={`text-4xl font-bold ${healthColor.text}`}>
            {overallHealth}%
          </span>
        </div>
        
        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${healthColor.bg}`}
            style={{ width: `${overallHealth}%`, transition: 'width 1s ease-out' }}
          />
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-3">
        {metrics.map((metric) => {
          const color = getHealthColor(metric.score);
          
          return (
            <div key={metric.name} className="bg-slate-950 border border-slate-800 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-semibold text-slate-200">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metric.issues > 0 && (
                    <span className="text-xs text-slate-500">
                      {metric.issues} issue{metric.issues !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`text-base font-bold ${color.text}`}>
                    {metric.score}%
                  </span>
                </div>
              </div>
              
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bg}`}
                  style={{ width: `${metric.score}%`, transition: 'width 0.8s ease-out' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Box */}
      {overallHealth < 70 && (
        <div className={`mt-4 p-3 rounded border ${
          overallHealth < 40 
            ? 'bg-red-950 border-red-900' 
            : 'bg-yellow-950 border-yellow-900'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              overallHealth < 40 ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <p className={`text-xs ${
              overallHealth < 40 ? 'text-red-300' : 'text-yellow-300'
            }`}>
              {overallHealth < 40 
                ? 'Critical disruptions detected. Review AI Strategic Advisor for mitigation strategies.'
                : 'Supply chain stress detected. Monitor developments and prepare contingencies.'}
            </p>
          </div>
        </div>
      )}

      {overallHealth >= 70 && (
        <div className="mt-4 p-3 bg-green-950 border border-green-900 rounded">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-300">
              Supply chain operating within normal parameters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
