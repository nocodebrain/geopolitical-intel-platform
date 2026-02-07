'use client';

import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Calendar } from 'lucide-react';

interface Insight {
  id: number;
  title: string;
  content: string;
  category: string;
  impact_level?: string;
  date: string;
  created_at: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights?limit=50');
        const data = await res.json();
        setInsights(data.insights || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  const dailyBriefs = insights.filter(i => i.category === 'daily_brief');
  const analyses = insights.filter(i => i.category === 'analysis');
  const predictions = insights.filter(i => i.category === 'prediction');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI-Generated Insights
        </h1>
        <p className="text-slate-400 mt-1">
          Strategic analysis and predictions for construction & logistics
        </p>
      </div>

      {/* Daily Briefs */}
      {dailyBriefs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            Daily Intelligence Briefs
          </h2>
          <div className="space-y-4">
            {dailyBriefs.map((insight) => (
              <div
                key={insight.id}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {insight.title}
                  </h3>
                  <span className="text-sm text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(insight.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-slate-300 whitespace-pre-wrap">
                    {insight.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyses */}
      {analyses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Strategic Analyses
          </h2>
          <div className="space-y-4">
            {analyses.map((insight) => (
              <div
                key={insight.id}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {insight.title}
                    </h3>
                    {insight.impact_level && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                        insight.impact_level === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.impact_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {insight.impact_level} impact
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(insight.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-slate-300 whitespace-pre-wrap">
                    {insight.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Predictions & Forecasts</h2>
          <div className="space-y-4">
            {predictions.map((insight) => (
              <div
                key={insight.id}
                className="bg-purple-950/30 backdrop-blur border border-purple-900/50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-300">
                    {insight.title}
                  </h3>
                  <span className="text-sm text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(insight.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-slate-300 whitespace-pre-wrap">
                    {insight.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length === 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center">
          <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No insights generated yet</p>
          <p className="text-sm text-slate-500">
            AI-generated insights will appear here as events are analyzed
          </p>
        </div>
      )}
    </div>
  );
}
