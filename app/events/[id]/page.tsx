'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Tag, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: number;
  region: string;
  country: string;
  date: string;
  source_name?: string;
  source_url?: string;
  entities?: string;
  sentiment_score?: number;
  impact_tags?: string;
}

interface Connection {
  id: number;
  event_a_id: number;
  event_b_id: number;
  relationship_type: string;
  confidence_score: number;
  explanation: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        const data = await res.json();
        setEvent(data.event);
        setConnections(data.connections || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Event not found</p>
        <Link href="/events" className="text-blue-400 hover:text-blue-300">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const entities = event.entities ? JSON.parse(event.entities) : null;
  const impactTags = event.impact_tags ? JSON.parse(event.impact_tags) : [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center text-sm text-slate-400 hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
              event.severity >= 8 ? 'bg-red-500/20 text-red-400' :
              event.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
              event.severity >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              Severity: {event.severity}/10
            </span>
            <span className="px-4 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-full font-semibold">
              {event.category}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-100 mb-4">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5" />
            {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1.5" />
            {event.country} • {event.region}
          </span>
          {event.sentiment_score !== undefined && (
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Sentiment: {event.sentiment_score > 0 ? 'Positive' : event.sentiment_score < 0 ? 'Negative' : 'Neutral'}
            </span>
          )}
        </div>

        <p className="text-slate-300 text-lg leading-relaxed mb-6">
          {event.description}
        </p>

        {event.source_name && event.source_url && (
          <div className="pt-4 border-t border-slate-700">
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Read original source: {event.source_name}
            </a>
          </div>
        )}
      </div>

      {/* Impact Tags */}
      {impactTags.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-purple-400" />
            Impact Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {impactTags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Entities */}
      {entities && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entities.countries && entities.countries.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-slate-200">Countries Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {entities.countries.map((country: string) => (
                  <span key={country} className="px-3 py-1 text-sm bg-slate-700 rounded">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entities.companies && entities.companies.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-slate-200">Companies Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {entities.companies.map((company: string) => (
                  <span key={company} className="px-3 py-1 text-sm bg-slate-700 rounded">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entities.commodities && entities.commodities.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-slate-200">Commodities Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {entities.commodities.map((commodity: string) => (
                  <span key={commodity} className="px-3 py-1 text-sm bg-slate-700 rounded">
                    {commodity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entities.people && entities.people.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-slate-200">People Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {entities.people.map((person: string) => (
                  <span key={person} className="px-3 py-1 text-sm bg-slate-700 rounded">
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related Events / Connections */}
      {connections.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Related Events</h2>
          <div className="space-y-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400 capitalize">
                    {conn.relationship_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    Confidence: {Math.round(conn.confidence_score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-300">{conn.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
