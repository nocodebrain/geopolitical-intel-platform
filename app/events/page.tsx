'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Calendar, MapPin, Tag } from 'lucide-react';

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
  impact_tags?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<number>(0);
  
  const categories = ['All', 'Conflict', 'Trade', 'Politics', 'Economy', 'Climate', 'Tech'];
  const regions = ['All', 'Asia-Pacific', 'Middle East', 'Europe', 'Americas', 'Africa', 'Global'];
  const severities = [
    { value: 0, label: 'All Levels' },
    { value: 8, label: 'Critical (8+)' },
    { value: 6, label: 'High (6+)' },
    { value: 4, label: 'Medium (4+)' },
    { value: 1, label: 'Low (1+)' }
  ];

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events?limit=200');
        const data = await res.json();
        setEvents(data.events || []);
        setFilteredEvents(data.events || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.country.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Apply region filter
    if (selectedRegion && selectedRegion !== 'All') {
      filtered = filtered.filter(e => e.region === selectedRegion);
    }

    // Apply severity filter
    if (selectedSeverity > 0) {
      filtered = filtered.filter(e => e.severity >= selectedSeverity);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, selectedRegion, selectedSeverity, events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Events Timeline
        </h1>
        <p className="text-slate-400 mt-1">
          Comprehensive view of geopolitical events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, countries, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(reg => (
                <option key={reg} value={reg === 'All' ? '' : reg}>{reg}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {severities.map(sev => (
                <option key={sev.value} value={sev.value}>{sev.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{filteredEvents.length}</span> of <span className="text-slate-200 font-semibold">{events.length}</span> events
          </p>
          {(searchTerm || selectedCategory || selectedRegion || selectedSeverity > 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedRegion('');
                setSelectedSeverity(0);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-400">No events match your filters</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => window.location.href = `/events/${event.id}`}
              className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-lg p-6 hover:border-slate-700 hover:bg-slate-900/70 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      event.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                      event.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                      event.severity >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      Severity: {event.severity}/10
                    </span>
                    <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.country} • {event.region}
                    </span>
                    {event.source_name && (
                      <span>Source: {event.source_name}</span>
                    )}
                  </div>
                  {event.impact_tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {JSON.parse(event.impact_tags).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
