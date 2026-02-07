'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Activity, RefreshCw, Zap } from 'lucide-react';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';

// Executive Components
import GlobalRiskScore from '@/components/executive/GlobalRiskScore';
import CommodityTracker from '@/components/executive/CommodityTracker';
import AIStrategicAdvisor from '@/components/executive/AIStrategicAdvisor';
import RegionalThreatMap from '@/components/executive/RegionalThreatMap';
import SupplyChainHealth from '@/components/executive/SupplyChainHealth';

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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Loading executive intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="space-y-6 pb-12">
        {/* Executive Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Executive Intelligence Platform
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Real-time geopolitical insights for strategic decision-making
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </motion.button>
              </div>
              <div className="text-sm text-slate-400">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Last updated: {getTimeAgo()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/0"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">Total Events</p>
                <Activity className="w-5 h-5 text-blue-500 opacity-50" />
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats?.totalEvents || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Active intelligence items</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-500/0"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">Critical Alerts</p>
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-400">!</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-red-400">{stats?.criticalEvents || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Severity 8+ events</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/0"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">Connections</p>
                <div className="w-5 h-5 text-purple-500 opacity-50">⚡</div>
              </div>
              <p className="text-3xl font-bold text-purple-400">{stats?.totalConnections || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Event relationships</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/0"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">Countries</p>
                <div className="text-xl opacity-50">🌍</div>
              </div>
              <p className="text-3xl font-bold text-green-400">{stats?.totalCountries || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Under monitoring</p>
            </div>
          </motion.div>
        </div>

        {/* Executive Widgets - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlobalRiskScore events={events} />
          <SupplyChainHealth events={events} />
          <CommodityTracker />
        </div>

        {/* AI Strategic Advisor - Full Width */}
        <AIStrategicAdvisor events={events} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Regional Threat Map */}
          <div className="lg:col-span-2">
            <RegionalThreatMap events={events} />
          </div>

          {/* Interactive World Map */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              
              <div className="relative">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  Global Event Map
                </h2>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <EnhancedWorldMap events={events} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Critical Events Feed */}
        {criticalEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-950/40 to-slate-900/90 backdrop-blur-xl border border-red-900/50 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
            
            <div className="relative">
              <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Critical Events Requiring Attention
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalEvents.slice(0, 6).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-slate-900/50 rounded-lg p-4 border border-red-900/30 hover:border-red-700/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/events/${event.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                        {event.severity}/10
                      </span>
                      <span className="text-xs text-slate-500">{event.region}</span>
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {event.description}
                    </p>
                    <div className="text-xs text-slate-600">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
