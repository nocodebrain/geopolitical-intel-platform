'use client';

import { Brain, Lightbulb, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Recommendation {
  id: string;
  type: 'opportunity' | 'risk' | 'action';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  icon: any;
}

interface AIStrategicAdvisorProps {
  events: Array<{
    title: string;
    description: string;
    category: string;
    severity: number;
    region: string;
    impact_tags?: string;
  }>;
}

export default function AIStrategicAdvisor({ events }: AIStrategicAdvisorProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [recessionRisk, setRecessionRisk] = useState<number>(0);

  useEffect(() => {
    fetchRecessionRisk();
    generateRecommendations();
  }, [events]);

  const fetchRecessionRisk = async () => {
    try {
      const response = await fetch('/api/recession-risk');
      const data = await response.json();
      setRecessionRisk(data.riskScore || 0);
    } catch (error) {
      console.error('Error fetching recession risk:', error);
    }
  };

  const generateRecommendations = () => {
    setIsAnalyzing(true);
    
    // Analyze events for patterns
    const criticalEvents = events.filter(e => e.severity >= 8);
    const supplyChainEvents = events.filter(e => {
      const tags = e.impact_tags ? JSON.parse(e.impact_tags) : [];
      return tags.includes('supply-chain-critical') || tags.includes('logistics') || tags.includes('shipping-routes');
    });
    const commodityEvents = events.filter(e => {
      const tags = e.impact_tags ? JSON.parse(e.impact_tags) : [];
      return tags.includes('materials-pricing') || tags.includes('cost-impact');
    });

    const recs: Recommendation[] = [];

    // Add recession risk warning if high
    if (recessionRisk >= 60) {
      recs.push({
        id: 'recession-warning',
        type: 'risk',
        priority: 'high',
        title: `Elevated Recession Risk: ${recessionRisk.toFixed(0)}% Risk Score`,
        description: 'Economic indicators show elevated recession risk. Delay major capex, secure credit lines, build cash reserves, and review supplier contracts for flexibility.',
        impact: 'Financial Risk: High',
        timeframe: 'Next 12-18 months',
        icon: AlertTriangle
      });
    } else if (recessionRisk < 30) {
      recs.push({
        id: 'expansion-opportunity',
        type: 'opportunity',
        priority: 'medium',
        title: `Low Recession Risk: Strong Economic Conditions`,
        description: 'Economic indicators show low recession risk. Favorable time for expansion, locking in long-term contracts, and strategic investments.',
        impact: 'Growth Opportunity: High',
        timeframe: 'Next 12-24 months',
        icon: TrendingUp
      });
    }

    // Red Sea / Shipping disruptions
    if (supplyChainEvents.some(e => e.title.toLowerCase().includes('red sea') || e.title.toLowerCase().includes('suez'))) {
      recs.push({
        id: 'red-sea-freight',
        type: 'action',
        priority: 'high',
        title: 'Red Sea Disruptions: Lock in Freight Rates',
        description: 'Ongoing Red Sea tensions are causing shipping delays and rate increases. Freight costs expected to surge 25-35% in Q2.',
        impact: 'Cost Impact: High',
        timeframe: 'Next 30 days',
        icon: Shield
      });
    }

    // Taiwan / Semiconductor
    if (events.some(e => e.title.toLowerCase().includes('taiwan') && e.severity >= 6)) {
      recs.push({
        id: 'taiwan-semiconductor',
        type: 'risk',
        priority: 'high',
        title: 'Taiwan Tensions: Diversify Semiconductor Suppliers',
        description: 'Rising geopolitical tensions in Taiwan Strait threaten global chip supply. Secure 6-month buffer stock from alternative suppliers.',
        impact: 'Supply Chain Risk: Critical',
        timeframe: 'Next 60 days',
        icon: AlertTriangle
      });
    }

    // India infrastructure opportunity
    if (events.some(e => e.region === 'Asia-Pacific' && e.description.toLowerCase().includes('india') && e.description.toLowerCase().includes('infrastructure'))) {
      recs.push({
        id: 'india-infrastructure',
        type: 'opportunity',
        priority: 'medium',
        title: 'India Infrastructure Boom: Expand Procurement',
        description: 'India\'s infrastructure push creates demand surge. Consider expanding steel procurement from Australia-India corridor for favorable rates.',
        impact: 'Growth Opportunity: High',
        timeframe: 'Next 90 days',
        icon: TrendingUp
      });
    }

    // Commodity price hedging
    if (commodityEvents.length > 3) {
      recs.push({
        id: 'commodity-hedging',
        type: 'action',
        priority: 'high',
        title: 'Commodity Volatility: Implement Hedging Strategy',
        description: 'Multiple commodity price fluctuations detected. Consider futures contracts or fixed-rate agreements for steel and copper.',
        impact: 'Cost Protection: Medium-High',
        timeframe: 'Next 45 days',
        icon: Shield
      });
    }

    // Middle East conflicts
    if (events.some(e => e.region === 'Middle East' && e.severity >= 7)) {
      recs.push({
        id: 'middle-east-oil',
        type: 'risk',
        priority: 'high',
        title: 'Middle East Escalation: Secure Alternative Energy Sources',
        description: 'Rising tensions in Middle East threaten oil supply. Diversify energy procurement and secure long-term contracts with non-MENA suppliers.',
        impact: 'Operational Risk: High',
        timeframe: 'Immediate',
        icon: AlertTriangle
      });
    }

    // Default recommendations if no specific patterns
    if (recs.length < 3) {
      recs.push({
        id: 'supply-chain-review',
        type: 'action',
        priority: 'medium',
        title: 'Quarterly Supply Chain Health Check',
        description: 'Current environment shows moderate risk. Conduct supplier risk assessment and ensure backup procurement channels are active.',
        impact: 'Risk Mitigation: Medium',
        timeframe: 'Next 30 days',
        icon: CheckCircle
      });

      recs.push({
        id: 'regional-diversification',
        type: 'opportunity',
        priority: 'medium',
        title: 'Regional Diversification Strategy',
        description: 'Explore emerging markets in Southeast Asia and Africa for cost-competitive materials and reduced dependency on high-risk regions.',
        impact: 'Strategic Advantage: Medium',
        timeframe: 'Next 60 days',
        icon: Lightbulb
      });
    }

    setTimeout(() => {
      setRecommendations(recs.slice(0, 5));
      setIsAnalyzing(false);
    }, 800);
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'risk': return '⚠️';
      case 'action': return '🎯';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-950 border-green-900';
      case 'risk': return 'bg-red-950 border-red-900';
      case 'action': return 'bg-blue-950 border-blue-900';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              AI Strategic Advisor
            </h3>
            <p className="text-xs text-slate-500">Executive recommendations</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            Analyzing...
          </div>
        )}
      </div>

      {isAnalyzing ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-950 border border-slate-800 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className={`border rounded-lg p-4 hover:border-slate-700 transition-colors ${getTypeBg(rec.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl mt-0.5">
                    {getTypeIcon(rec.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-100 text-sm leading-tight">
                        {rec.title}
                      </h4>
                      <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded text-white uppercase tracking-wide ${getPriorityBg(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        <span>{rec.impact}</span>
                      </div>
                      <div>•</div>
                      <div>{rec.timeframe}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isAnalyzing && recommendations.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-slate-400">All systems nominal. No critical actions required.</p>
        </div>
      )}
    </div>
  );
}
