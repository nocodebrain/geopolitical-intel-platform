'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, AlertTriangle, TrendingUp, Globe2 } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false });

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: number;
  region: string;
  country: string;
  date: string;
  sentiment_score?: number;
  impact_tags?: string;
}

interface Insight {
  title: string;
  content: string;
  date: string;
}

interface Stats {
  totalEvents: number;
  totalConnections: number;
  totalCountries: number;
  criticalEvents: number;
  eventsByCategory: Array<{ category: string; count: number }>;
  eventsByRegion: Array<{ region: string; count: number }>;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [dailyBrief, setDailyBrief] = useState<Insight | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch top events
        const eventsRes = await fetch('/api/events?limit=20');
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);

        // Fetch daily brief
        const briefRes = await fetch('/api/insights?category=daily_brief');
        const briefData = await briefRes.json();
        setDailyBrief(briefData.insight || null);

        // Fetch statistics
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const topEvents = events
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 10);

  const criticalEvents = events.filter(e => e.severity >= 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Strategic Intelligence Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time geopolitical insights for construction & logistics
          </p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Events</p>
              <p className="text-2xl font-bold text-blue-400">{stats?.totalEvents || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Critical Events</p>
              <p className="text-2xl font-bold text-red-400">{stats?.criticalEvents || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Connections</p>
              <p className="text-2xl font-bold text-purple-400">{stats?.totalConnections || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Countries Monitored</p>
              <p className="text-2xl font-bold text-green-400">{stats?.totalCountries || 0}</p>
            </div>
            <Globe2 className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Brief */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Daily Intelligence Brief
            </h2>
            {dailyBrief ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap">
                  {dailyBrief.content}
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Generated: {new Date(dailyBrief.date).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No brief available</p>
            )}
          </div>

          {/* Critical Alerts */}
          {criticalEvents.length > 0 && (
            <div className="bg-red-950/30 backdrop-blur border border-red-900/50 rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Alerts
              </h2>
              <div className="space-y-3">
                {criticalEvents.map((event) => (
                  <div key={event.id} className="border-l-2 border-red-500 pl-3">
                    <p className="text-sm font-medium text-slate-200">{event.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {event.region} • Severity: {event.severity}/10
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* World Map */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Global Risk Map</h2>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <WorldMap events={events} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Developing Situations */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top 10 Developing Situations</h2>
        <div className="space-y-3">
          {topEvents.map((event, index) => (
            <div
              key={event.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/events/${event.id}`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  event.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                  event.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                  event.severity >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-200 truncate">{event.title}</h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    event.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                    event.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                    event.severity >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.severity}/10
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{event.description}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-700/50 rounded">{event.category}</span>
                  <span>{event.region}</span>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      {stats && stats.eventsByCategory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Events by Category</h2>
            <div className="space-y-3">
              {stats.eventsByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="text-slate-400">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / stats.totalEvents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Events by Region</h2>
            <div className="space-y-3">
              {stats.eventsByRegion.map((item) => (
                <div key={item.region}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.region}</span>
                    <span className="text-slate-400">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / stats.totalEvents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
