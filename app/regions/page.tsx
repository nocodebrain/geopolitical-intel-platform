'use client';

import { useEffect, useState } from 'react';
import { Globe2, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Country {
  name: string;
  region: string;
  iso_code: string;
  risk_level?: string;
  stability_index?: number;
  active_conflicts_count?: number;
}

interface Event {
  country: string;
  severity: number;
}

export default function RegionsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countriesRes, eventsRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/events?limit=500')
        ]);

        const countriesData = await countriesRes.json();
        const eventsData = await eventsRes.json();

        setCountries(countriesData.countries || []);
        setEvents(eventsData.events || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Group countries by region
  const regions = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  // Count events per country
  const eventCounts = events.reduce((acc, event) => {
    acc[event.country] = (acc[event.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average severity per country
  const countrySeverity = events.reduce((acc, event) => {
    if (!acc[event.country]) {
      acc[event.country] = { total: 0, count: 0 };
    }
    acc[event.country].total += event.severity;
    acc[event.country].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading regional data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Regional Intelligence
        </h1>
        <p className="text-slate-400 mt-1">
          Country profiles and regional risk assessments
        </p>
      </div>

      {Object.entries(regions).sort().map(([region, regionCountries]) => (
        <div key={region} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Globe2 className="w-5 h-5 mr-2 text-blue-400" />
              {region}
            </h2>
            <span className="text-sm text-slate-400">
              {regionCountries.length} countries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionCountries.map((country) => {
              const eventCount = eventCounts[country.name] || 0;
              const severity = countrySeverity[country.name];
              const avgSeverity = severity ? Math.round(severity.total / severity.count) : 0;

              return (
                <div
                  key={country.iso_code}
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-100">{country.name}</h3>
                    {country.risk_level && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getRiskColor(country.risk_level)}`}>
                        {country.risk_level}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {eventCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Active Events:</span>
                        <span className="text-slate-200 font-medium">{eventCount}</span>
                      </div>
                    )}

                    {avgSeverity > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Severity:</span>
                        <span className={`font-medium ${
                          avgSeverity >= 8 ? 'text-red-400' :
                          avgSeverity >= 6 ? 'text-orange-400' :
                          avgSeverity >= 4 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {avgSeverity}/10
                        </span>
                      </div>
                    )}

                    {country.active_conflicts_count !== undefined && country.active_conflicts_count > 0 && (
                      <div className="flex items-center text-red-400">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span className="text-xs">
                          {country.active_conflicts_count} active conflict{country.active_conflicts_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {eventCount > 0 && (
                      <Link
                        href={`/events?country=${encodeURIComponent(country.name)}`}
                        className="block mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View events →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(regions).length === 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center">
          <Globe2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No regional data available</p>
        </div>
      )}
    </div>
  );
}
