'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Event {
  id: number;
  title: string;
  severity: number;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  category: string;
}

interface WorldMapProps {
  events: Event[];
}

export default function WorldMap({ events }: WorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      worldCopyJump: true,
      zoomControl: true
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for events with coordinates
    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);

    eventsWithCoords.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      // Determine color based on severity
      let color = '#10b981'; // green
      if (event.severity >= 8) color = '#ef4444'; // red
      else if (event.severity >= 6) color = '#f97316'; // orange
      else if (event.severity >= 4) color = '#eab308'; // yellow

      // Determine radius based on severity
      const radius = 5 + (event.severity * 2);

      // Create circle marker
      const marker = L.circleMarker([event.latitude, event.longitude], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      // Add popup
      marker.bindPopup(`
        <div style="color: #000; min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">
            ${event.title}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${event.country} • ${event.region}
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="
              background: ${color}; 
              color: white; 
              padding: 2px 8px; 
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
            ">
              ${event.severity}/10
            </span>
            <span style="
              background: #e5e7eb; 
              padding: 2px 8px; 
              border-radius: 4px;
              font-size: 11px;
            ">
              ${event.category}
            </span>
          </div>
          <a 
            href="/events/${event.id}" 
            style="
              display: inline-block;
              margin-top: 8px;
              color: #3b82f6;
              font-size: 12px;
              text-decoration: none;
            "
          >
            View details →
          </a>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.addTo(map);

      // Add hover effect
      marker.on('mouseover', function(this: L.CircleMarker) {
        this.setStyle({ fillOpacity: 1, weight: 2 });
      });

      marker.on('mouseout', function(this: L.CircleMarker) {
        this.setStyle({ fillOpacity: 0.7, weight: 1 });
      });
    });

    // Add country heat overlay (aggregate events by country)
    const countryCounts = new Map<string, { count: number; severity: number; coords: [number, number] }>();

    eventsWithCoords.forEach(event => {
      if (!event.latitude || !event.longitude) return;
      
      const key = event.country;
      const existing = countryCounts.get(key);
      
      if (existing) {
        existing.count += 1;
        existing.severity = Math.max(existing.severity, event.severity);
      } else {
        countryCounts.set(key, {
          count: 1,
          severity: event.severity,
          coords: [event.latitude, event.longitude]
        });
      }
    });

    // Add heat circles for countries with multiple events
    countryCounts.forEach((data, country) => {
      if (data.count > 1) {
        const heatRadius = 30 + (data.count * 10);
        let heatColor = '#10b981';
        
        if (data.severity >= 8) heatColor = '#ef4444';
        else if (data.severity >= 6) heatColor = '#f97316';
        else if (data.severity >= 4) heatColor = '#eab308';

        L.circle(data.coords, {
          radius: heatRadius * 50000, // meters
          fillColor: heatColor,
          color: heatColor,
          weight: 0,
          fillOpacity: 0.15
        }).addTo(map);
      }
    });

  }, [events]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg" style={{ minHeight: '500px' }}>
      <style jsx global>{`
        .leaflet-container {
          background: #0f172a;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  );
}
