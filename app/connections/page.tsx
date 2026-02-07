'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Connection {
  id: number;
  event_a_id: number;
  event_b_id: number;
  relationship_type: string;
  confidence_score: number;
  explanation: string;
}

interface Event {
  id: number;
  title: string;
  category: string;
  severity: number;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [events, setEvents] = useState<Map<number, Event>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [connRes, eventsRes] = await Promise.all([
          fetch('/api/connections'),
          fetch('/api/events?limit=200')
        ]);

        const connData = await connRes.json();
        const eventsData = await eventsRes.json();

        setConnections(connData.connections || []);

        const eventMap = new Map<number, Event>();
        (eventsData.events || []).forEach((e: Event) => {
          eventMap.set(e.id, e);
        });
        setEvents(eventMap);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Event Connections
        </h1>
        <p className="text-slate-400 mt-1">
          Discover relationships and patterns between geopolitical events
        </p>
      </div>

      <div className="bg-blue-950/30 backdrop-blur border border-blue-900/50 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <TrendingUp className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-2">Pattern Recognition</h3>
            <p className="text-sm text-slate-300">
              Our AI analyzes events to identify causal relationships, correlations, and cascading effects.
              Understanding these connections helps predict supply chain disruptions, market movements, and strategic opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {connections.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-400">No connections identified yet</p>
          </div>
        ) : (
          connections.map((conn) => {
            const eventA = events.get(conn.event_a_id);
            const eventB = events.get(conn.event_b_id);

            if (!eventA || !eventB) return null;

            return (
              <div
                key={conn.id}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    conn.relationship_type === 'causes' ? 'bg-red-500/20 text-red-400' :
                    conn.relationship_type === 'relates_to' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {conn.relationship_type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-slate-400">
                    Confidence: <span className="text-slate-200 font-semibold">{Math.round(conn.confidence_score * 100)}%</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Link href={`/events/${eventA.id}`}>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{eventA.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          eventA.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                          eventA.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {eventA.severity}/10
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 line-clamp-2">
                        {eventA.title}
                      </p>
                    </div>
                  </Link>

                  <Link href={`/events/${eventB.id}`}>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{eventB.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          eventB.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                          eventB.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {eventB.severity}/10
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 line-clamp-2">
                        {eventB.title}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-300 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                    {conn.explanation}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6 text-center">
        <p className="text-sm text-slate-400 mb-2">
          📊 <strong>{connections.length}</strong> connections identified across <strong>{events.size}</strong> events
        </p>
        <p className="text-xs text-slate-500">
          AI continuously analyzes new events to discover emerging patterns
        </p>
      </div>
    </div>
  );
}
