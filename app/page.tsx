'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { Activity, RefreshCw } from 'lucide-react';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';

// Executive Components
import GlobalRiskScore from '@/components/executive/GlobalRiskScore';
import CommodityTracker from '@/components/executive/CommodityTracker';
import AIStrategicAdvisor from '@/components/executive/AIStrategicAdvisor';
import RegionalThreatMap from '@/components/executive/RegionalThreatMap';
import SupplyChainHealth from '@/components/executive/SupplyChainHealth';
import RecessionRiskMeter from '@/components/executive/RecessionRiskMeter';
import YieldCurveChart from '@/components/executive/YieldCurveChart';
import EconomicIndicatorsGrid from '@/components/executive/EconomicIndicatorsGrid';

// Dynamically import map to avoid SSR issues
const EnhancedWorldMap = dynamic(() => import('@/components/executive/EnhancedWorldMap'), { ssr: false });

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: number;
  region: string;
  country: string;
  date: string;
  latitude?: number;
  longitude?: number;
  sentiment_score?: number;
  impact_tags?: string;
}

interface Stats {
  totalEvents: number;
  totalConnections: number;
  totalCountries: number;
  criticalEvents: number;
  eventsByCategory: Array<{ category: string; count: number }>;
  eventsByRegion: Array<{ region: string; count: number }>;
}

export default function ExecutiveDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/events?limit=100'),
        fetch('/api/stats')
      ]);

      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();

      setEvents(eventsData.events || []);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 1 hour
  const { isRefreshing, refresh, getTimeAgo } = useAutoRefresh({
    interval: 60 * 60 * 1000, // 1 hour
    onRefresh: fetchDashboardData,
    enableToast: true
  });

  const criticalEvents = events.filter(e => e.severity >= 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-base">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="space-y-8 pb-12">
        {/* Executive Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                Executive Intelligence Dashboard
              </h1>
              <p className="text-slate-400 text-base">
                Real-time geopolitical insights for strategic decision-making
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div className="text-sm text-slate-500 mt-2">
                Last updated: {getTimeAgo()}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Events</p>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-slate-100">{stats?.totalEvents || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Active intelligence items</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Critical Alerts</p>
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-red-500">{stats?.criticalEvents || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Severity 8+ events</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Connections</p>
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-4xl font-bold text-slate-100">{stats?.totalConnections || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Event relationships</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Countries</p>
              <span className="text-xl">🌍</span>
            </div>
            <p className="text-4xl font-bold text-slate-100">{stats?.totalCountries || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Under monitoring</p>
          </div>
        </div>

        {/* Executive Widgets - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <RecessionRiskMeter />
          <GlobalRiskScore events={events} />
          <SupplyChainHealth events={events} />
          <CommodityTracker />
        </div>

        {/* Recession Prediction System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YieldCurveChart />
          <EconomicIndicatorsGrid />
        </div>

        {/* AI Strategic Advisor */}
        <AIStrategicAdvisor events={events} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Regional Threat Map */}
          <div className="lg:col-span-2">
            <RegionalThreatMap events={events} />
          </div>

          {/* Interactive World Map */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">
                Global Event Map
              </h2>
              <div className="h-[600px] rounded overflow-hidden bg-slate-950">
                <EnhancedWorldMap events={events} />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Events Feed */}
        {criticalEvents.length > 0 && (
          <div className="bg-slate-900 border border-red-900 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Critical Events Requiring Attention
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criticalEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-red-800 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/events/${event.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
                      {event.severity}/10
                    </span>
                    <span className="text-xs text-slate-500">{event.region}</span>
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="text-xs text-slate-600">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
