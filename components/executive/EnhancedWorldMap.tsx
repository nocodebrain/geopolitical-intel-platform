'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Calendar, Layers } from 'lucide-react';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface Event {
  id: number;
  title: string;
  description: string;
  severity: number;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  category: string;
  date: string;
  impact_tags?: string;
}

interface EnhancedWorldMapProps {
  events: Event[];
}

export default function EnhancedWorldMap({ events }: EnhancedWorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({
    severity: 0,
    category: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map with dark theme
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      worldCopyJump: true,
      zoomControl: true
    });

    // Dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Initialize marker cluster group
    markerClusterRef.current = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const childCount = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();
        const avgSeverity = markers.reduce((sum: number, m: any) => sum + (m.options.severity || 0), 0) / childCount;
        
        let className = 'marker-cluster-';
        if (avgSeverity >= 8) className += 'critical';
        else if (avgSeverity >= 6) className += 'high';
        else if (avgSeverity >= 4) className += 'medium';
        else className += 'low';

        return L.divIcon({
          html: `<div><span>${childCount}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40)
        });
      }
    });

    map.addLayer(markerClusterRef.current);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerClusterRef.current) return;

    // Clear existing markers
    markerClusterRef.current.clearLayers();

    // Filter events
    const filteredEvents = events.filter(e => {
      if (!e.latitude || !e.longitude) return false;
      
      if (filters.severity > 0 && e.severity < filters.severity) return false;
      if (filters.category !== 'all' && e.category !== filters.category) return false;
      
      if (filters.dateRange !== 'all') {
        const eventDate = new Date(e.date);
        const now = new Date();
        const daysDiff = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (filters.dateRange === 'day' && daysDiff > 1) return false;
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
      }
      
      return true;
    });

    // Add markers
    filteredEvents.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      // Color based on severity
      let color = '#10b981'; // green
      if (event.severity >= 8) color = '#ef4444'; // red
      else if (event.severity >= 6) color = '#f97316'; // orange
      else if (event.severity >= 4) color = '#eab308'; // yellow

      const radius = 8 + (event.severity * 1.5);

      // Create custom marker
      const marker = L.circleMarker([event.latitude, event.longitude], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        severity: event.severity
      } as any);

      // Click handler
      marker.on('click', () => {
        setSelectedEvent(event);
      });

      // Hover effect
      marker.on('mouseover', function(this: L.CircleMarker) {
        this.setStyle({ fillOpacity: 1, weight: 3 });
      });

      marker.on('mouseout', function(this: L.CircleMarker) {
        this.setStyle({ fillOpacity: 0.8, weight: 2 });
      });

      markerClusterRef.current.addLayer(marker);
    });

  }, [events, filters]);

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];

  // Region zoom shortcuts
  const regions = {
    'Asia-Pacific': { lat: 25, lng: 110, zoom: 4 },
    'Middle East': { lat: 30, lng: 45, zoom: 5 },
    'Europe': { lat: 50, lng: 10, zoom: 4 },
    'Americas': { lat: 20, lng: -80, zoom: 3 },
    'Africa': { lat: 0, lng: 20, zoom: 4 }
  };

  const zoomToRegion = (region: keyof typeof regions) => {
    if (mapRef.current) {
      const { lat, lng, zoom } = regions[region];
      mapRef.current.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full rounded-lg" style={{ minHeight: '600px' }}>
        <style jsx global>{`
          .leaflet-container {
            background: #0f172a;
            font-family: inherit;
          }
          .marker-cluster {
            background-clip: padding-box;
            border-radius: 50%;
          }
          .marker-cluster div {
            width: 36px;
            height: 36px;
            margin-left: 2px;
            margin-top: 2px;
            text-align: center;
            border-radius: 50%;
            font-weight: 700;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-cluster-critical {
            background-color: rgba(239, 68, 68, 0.6);
          }
          .marker-cluster-critical div {
            background-color: rgba(239, 68, 68, 0.9);
            color: white;
          }
          .marker-cluster-high {
            background-color: rgba(249, 115, 22, 0.6);
          }
          .marker-cluster-high div {
            background-color: rgba(249, 115, 22, 0.9);
            color: white;
          }
          .marker-cluster-medium {
            background-color: rgba(234, 179, 8, 0.6);
          }
          .marker-cluster-medium div {
            background-color: rgba(234, 179, 8, 0.9);
            color: white;
          }
          .marker-cluster-low {
            background-color: rgba(16, 185, 129, 0.6);
          }
          .marker-cluster-low div {
            background-color: rgba(16, 185, 129, 0.9);
            color: white;
          }
        `}</style>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Filter Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </motion.button>

        {/* Region Shortcuts */}
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-2 space-y-1">
          <div className="text-xs text-slate-400 px-2 mb-2">Quick Jump</div>
          {Object.keys(regions).map(region => (
            <button
              key={region}
              onClick={() => zoomToRegion(region as keyof typeof regions)}
              className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded transition-colors text-left"
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-48 z-[1000] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-4 w-64"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Min Severity: {filters.severity}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Time Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                >
                  <option value="all">All Time</option>
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ severity: 0, category: 'all', dateRange: 'all' })}
                className="w-full px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedEvent.severity >= 8 ? 'bg-red-500/20 text-red-400' :
                      selectedEvent.severity >= 6 ? 'bg-orange-500/20 text-orange-400' :
                      selectedEvent.severity >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      Severity: {selectedEvent.severity}/10
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">
                      {selectedEvent.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 mb-2">
                    {selectedEvent.title}
                  </h2>
                  <div className="text-sm text-slate-400">
                    {selectedEvent.country} • {selectedEvent.region} • {new Date(selectedEvent.date).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-300 mb-4 leading-relaxed">
                {selectedEvent.description}
              </p>

              {selectedEvent.impact_tags && (
                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-2">Impact Areas:</div>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedEvent.impact_tags).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={`/events/${selectedEvent.id}`}
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                View Full Details →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
