'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AdminStation } from '@/lib/dataService';
import { useTheme } from '@/lib/themeContext';

interface AdminMapLibreMapProps {
  stations: AdminStation[];
  onSelectStation?: (station: AdminStation) => void;
}

type TileProvider = 'CARTO_VOYAGER' | 'CARTO_DARK' | 'OSM_STANDARD' | 'ESRI_SATELLITE';

const TILE_SOURCES: Record<TileProvider, { name: string; tiles: string[]; attribution: string; maxzoom: number }> = {
  CARTO_VOYAGER: {
    name: 'Carto Voyager (Light)',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    ],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxzoom: 20,
  },
  CARTO_DARK: {
    name: 'Carto Dark Matter (Night)',
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    ],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxzoom: 20,
  },
  OSM_STANDARD: {
    name: 'OpenStreetMap (Standard)',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    ],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxzoom: 19,
  },
  ESRI_SATELLITE: {
    name: 'World Imagery (Satellite)',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxzoom: 19,
  },
};

const getMapLibreStyle = (provider: TileProvider) => {
  const source = TILE_SOURCES[provider];
  return {
    version: 8 as const,
    sources: {
      'raster-tiles': {
        type: 'raster' as const,
        tiles: source.tiles,
        tileSize: 256,
        attribution: source.attribution,
      },
    },
    layers: [
      {
        id: 'raster-layer',
        type: 'raster' as const,
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: source.maxzoom,
      },
    ],
  };
};

export function AdminMapLibreMap({ stations, onSelectStation }: AdminMapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { theme } = useTheme();

  // Active Provider & Connection Status
  const [activeProvider, setActiveProvider] = useState<TileProvider>(
    theme === 'dark' ? 'CARTO_DARK' : 'CARTO_VOYAGER'
  );
  const [mapConnected, setMapConnected] = useState<boolean>(true);

  // Filter States
  const [selectedCpo, setSelectedCpo] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSpeed, setSelectedSpeed] = useState<string>('ALL');
  const [selectedConnector, setSelectedConnector] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Sync theme changes to default provider
  useEffect(() => {
    const defaultProvider = theme === 'dark' ? 'CARTO_DARK' : 'CARTO_VOYAGER';
    setActiveProvider(defaultProvider);
  }, [theme]);

  // Filter stations based on criteria
  const filteredStations = stations.filter((st) => {
    if (selectedCpo !== 'ALL' && st.cpoId !== selectedCpo && st.cpoName !== selectedCpo) return false;
    if (selectedStatus === 'AVAILABLE' && st.availableConnectors === 0) return false;
    if (selectedStatus === 'OCCUPIED' && st.availableConnectors > 0) return false;
    if (selectedStatus === 'MAINTENANCE' && st.status !== 'MAINTENANCE') return false;
    if (selectedSpeed === 'DC_FAST' && st.maxPowerKw < 50) return false;
    if (selectedSpeed === 'ULTRA_FAST' && st.maxPowerKw < 100) return false;
    if (selectedSpeed === 'AC' && st.maxPowerKw > 22) return false;
    if (selectedConnector !== 'ALL' && !st.connectors.some((c) => c.type === selectedConnector)) return false;
    if (selectedCity !== 'ALL' && st.city !== selectedCity && st.district !== selectedCity) return false;
    return true;
  });

  // Inject MapLibre CSS CDN if needed
  useEffect(() => {
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize MapLibre GL
  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initMapLibre() {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const maplibregl = await import('maplibre-gl');

        if (!isMounted || !mapContainerRef.current) return;

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: getMapLibreStyle(activeProvider),
          center: [77.21, 28.58], // [lng, lat] for MapLibre
          zoom: 10.5,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
        map.addControl(new maplibregl.FullscreenControl(), 'top-right');

        map.on('load', () => {
          if (!isMounted) return;
          mapRef.current = map;
          setMapConnected(true);
          map.resize();
          renderMapMarkers(maplibregl, map);

          // Second resize after layout stabilizes
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.resize();
            }
          }, 200);
        });

        map.on('error', (e: any) => {
          if (e?.sourceId === 'raster-tiles' && activeProvider !== 'OSM_STANDARD') {
            setActiveProvider('OSM_STANDARD');
          }
        });

        // Set up ResizeObserver to handle window and sidebar layout transitions
        if (window.ResizeObserver && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.resize();
            }
          });
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (err) {
        console.warn('MapLibre init error:', err);
      }
    }

    initMapLibre();

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update style when provider changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getMapLibreStyle(activeProvider));
    mapRef.current.once('style.load', async () => {
      const maplibregl = await import('maplibre-gl');
      mapRef.current.resize();
      renderMapMarkers(maplibregl, mapRef.current);
    });
  }, [activeProvider]);

  // Re-render markers when filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    import('maplibre-gl').then((maplibregl) => {
      renderMapMarkers(maplibregl, mapRef.current);
    });
  }, [filteredStations]);

  const renderMapMarkers = (maplibregl: any, map: any) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredStations.forEach((st) => {
      let markerColor = '#16A34A'; // Green (Available)
      let statusLabel = 'Available';

      if (st.status === 'MAINTENANCE') {
        markerColor = '#334155'; // Charcoal (Maintenance)
        statusLabel = 'Maintenance';
      } else if (st.availableConnectors === 0) {
        markerColor = '#DC2626'; // Red (Unavailable / Occupied)
        statusLabel = 'All Guns In-Use';
      } else if (st.availableConnectors < st.totalConnectors) {
        markerColor = '#D97706'; // Amber (Limited)
        statusLabel = `${st.availableConnectors}/${st.totalConnectors} Guns Free`;
      }

      // Create DOM element for custom pin marker
      const el = document.createElement('div');
      el.className = 'maplibre-station-marker';
      el.style.backgroundColor = markerColor;
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50% 50% 50% 0';
      el.style.transform = 'rotate(-45deg)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.35)';
      el.style.cursor = 'pointer';

      const iconSpan = document.createElement('span');
      iconSpan.style.transform = 'rotate(45deg)';
      iconSpan.style.color = '#ffffff';
      iconSpan.style.fontSize = '14px';
      iconSpan.style.fontWeight = 'bold';
      iconSpan.innerText = '⚡';
      el.appendChild(iconSpan);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; color: #0F172A; padding: 4px;">
          <strong style="font-size: 13.5px; display: block; margin-bottom: 2px; color: #0F172A;">${st.name}</strong>
          <div style="font-size: 11.5px; color: #0D9488; font-weight: 700; margin-bottom: 6px;">${st.cpoName}</div>
          <div style="font-size: 11.5px; color: #475569; margin-bottom: 6px;">${st.address}</div>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <span>Status:</span>
            <strong style="color: ${markerColor};">${statusLabel}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
            <span>Max Power:</span>
            <strong>⚡ ${st.maxPowerKw} kW</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 6px;">
            <span>Tariff Rate:</span>
            <strong>₹${st.tariffPerKwh.toFixed(2)} / kWh</strong>
          </div>
          <button id="btn-ml-${st.id}" style="
            width: 100%;
            background-color: #0D9488;
            color: #ffffff;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 4px;
          ">
            🔍 Inspect Hub Details
          </button>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);

      popup.on('open', () => {
        const btn = document.getElementById(`btn-ml-${st.id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => onSelectStation(st);
        }
      });

      // MapLibre uses [lng, lat]
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.coordinates.longitude, st.coordinates.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
      {/* Map Header & Status Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🗺️</span>
          <div>
            <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              Live Geospatial Station Map (MapLibre GL JS)
            </strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: mapConnected ? '#16A34A' : '#D97706',
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {mapConnected ? 'Tile Layer Connected (Keyless Open Basemap)' : 'Connecting tiles...'}
              </span>
            </div>
          </div>
        </div>

        {/* Tile Provider Switcher & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Tile Layer Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Layer:</span>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as TileProvider)}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: 11.5,
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="CARTO_VOYAGER">Carto Voyager (Light)</option>
              <option value="CARTO_DARK">Carto Dark (Night)</option>
              <option value="OSM_STANDARD">OpenStreetMap (Standard)</option>
              <option value="ESRI_SATELLITE">Esri Satellite</option>
            </select>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} /> Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} /> Limited
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} /> In-Use
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Criteria Filters Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, fontSize: 12 }}>
        {/* CPO Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>CPO Network</label>
          <select
            value={selectedCpo}
            onChange={(e) => setSelectedCpo(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          >
            <option value="ALL">All CPOs (12)</option>
            <option value="cpo-tata">Tata Power</option>
            <option value="cpo-jiobp">Jio-bp pulse</option>
            <option value="cpo-statiq">Statiq</option>
            <option value="cpo-zeon">Zeon</option>
            <option value="cpo-chargezone">ChargeZone</option>
            <option value="cpo-ather">Ather Grid</option>
            <option value="cpo-glida">Glida</option>
            <option value="cpo-shell">Shell</option>
            <option value="cpo-magenta">Magenta</option>
            <option value="cpo-relux">Relux</option>
            <option value="cpo-kazam">Kazam</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Availability</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Guns Free</option>
            <option value="OCCUPIED">Full / In-Use</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        {/* Speed Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Power Speed</label>
          <select
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          >
            <option value="ALL">All Speeds</option>
            <option value="ULTRA_FAST">⚡ Ultra-Fast (&gt;100 kW)</option>
            <option value="DC_FAST">⚡ DC Fast (&gt;50 kW)</option>
            <option value="AC">🔌 AC Slow (22 kW)</option>
          </select>
        </div>

        {/* Connector Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Connector Standard</label>
          <select
            value={selectedConnector}
            onChange={(e) => setSelectedConnector(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          >
            <option value="ALL">All Connectors</option>
            <option value="CCS2">CCS2 (DC)</option>
            <option value="TYPE2">Type 2 (AC)</option>
            <option value="CHADEMO">CHAdeMO</option>
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>City / Region</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
            }}
          >
            <option value="ALL">All Regions</option>
            <option value="New Delhi">New Delhi</option>
            <option value="Noida">Noida (UP)</option>
            <option value="Gurugram">Gurugram (HR)</option>
            <option value="Sonipat">Sonipat / Murthal</option>
            <option value="Karnal">Karnal (NH-44)</option>
          </select>
        </div>
      </div>

      {/* MapLibre Container */}
      <div
        ref={mapContainerRef}
        style={{
          height: 420,
          width: '100%',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      />
    </div>
  );
}
