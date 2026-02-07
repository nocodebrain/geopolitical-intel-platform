'use client';

import { motion } from 'framer-motion';
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
    // Fetch recession risk data
    fetchRecessionRisk();
    // Analyze events and generate strategic recommendations
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
    const opportunityEvents = events.filter(e => {
      const tags = e.impact_tags ? JSON.parse(e.impact_tags) : [];
      return tags.includes('opportunity');
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

    // Generate recommendations based on patterns
    
    // Red Sea / Shipping disruptions
    if (supplyChainEvents.some(e => e.title.toLowerCase().includes('red sea') || e.title.toLowerCase().includes('suez'))) {
      recs.push({
        id: 'red-sea-freight',
        type: 'action',
        priority: 'high',
        title: 'Red Sea Disruptions: Lock in Freight Rates',
        description: 'Ongoing Red Sea tensions are causing shipping delays and rate increases. Freight costs expected to surge 25-35% in Q2.',
        impact: 'Cost Impact: High | Timeline: Immediate',
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
      setRecommendations(recs.slice(0, 5)); // Top 5 recommendations
      setIsAnalyzing(false);
    }, 1500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'risk': return '⚠️';
      case 'action': return '🎯';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
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
              <div key={i} className="h-24 bg-slate-800/40 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative bg-slate-800/40 rounded-lg p-4 hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-slate-600"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg ${
                        rec.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                        rec.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      } flex items-center justify-center text-lg`}>
                        {getTypeIcon(rec.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-slate-200 text-sm leading-tight">
                          {rec.title}
                        </h4>
                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Icon className="w-3 h-3" />
                          <span>{rec.impact}</span>
                        </div>
                        <div className="text-slate-600">•</div>
                        <div className="text-slate-500">{rec.timeframe}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
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

        {!isAnalyzing && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              View Full Analysis Report →
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
