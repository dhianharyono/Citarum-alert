'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AWLRStation, FloodReport } from '@/types';
import {
  MapPin,
  Layers,
  Crosshair,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Video,
  ExternalLink,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface FloodMapProps {
  stations: AWLRStation[];
  reports: FloodReport[];
  selectedReport?: FloodReport | null;
  onSelectReport?: (report: FloodReport) => void;
}

type MapLayerType = 'street' | 'satellite' | 'topo';

/**
 * Controller component inside MapContainer to handle auto-resize and center panning
 */
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately so Leaflet renders full width and height
    map.invalidateSize();

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    map.invalidateSize();
  }, [center, zoom, map]);

  return null;
}

export default function FloodMap({
  stations,
  reports,
  selectedReport,
  onSelectReport,
}: FloodMapProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'reports'>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.9850, 107.6250]);
  const [mapZoom, setMapZoom] = useState(12);
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const [activeFocus, setActiveFocus] = useState<string>('all');
  const [layerType, setLayerType] = useState<MapLayerType>('street');
  const [isMinimized, setIsMinimized] = useState(false);

  const FOCUS_OPTIONS = [
    {
      id: 'all',
      name: 'Semua Wilayah',
      coords: [-6.9950, 107.6300] as [number, number],
      zoom: 11,
    },
    {
      id: 'dayeuhkolot',
      name: 'Dayeuhkolot / Baleendah',
      coords: [-6.9856, 107.6219] as [number, number],
      zoom: 14,
    },
    {
      id: 'kopo',
      name: 'Kopo - Katapang',
      coords: [-6.9740, 107.5750] as [number, number],
      zoom: 14,
    },
    {
      id: 'bojongsoang',
      name: 'Bojongsoang',
      coords: [-6.9790, 107.6360] as [number, number],
      zoom: 14,
    },
    {
      id: 'rancaekek',
      name: 'Rancaekek / Cikeruh',
      coords: [-6.9582, 107.7289] as [number, number],
      zoom: 13,
    },
  ];

  const getStationColor = (status: AWLRStation['status']) => {
    switch (status) {
      case 'AWAS':
        return '#f43f5e'; // Merah
      case 'SIAGA':
        return '#f97316'; // Oranye
      case 'WASPADA':
        return '#eab308'; // Kuning
      default:
        return '#10b981'; // Hijau
    }
  };

  const getDepthColor = (category: string) => {
    switch (category) {
      case 'Diatas 1 Meter':
        return '#9333ea'; // Ungu
      case 'Sepaha (50-80cm)':
        return '#ef4444'; // Merah
      case 'Selutut (20-50cm)':
        return '#f59e0b'; // Amber
      default:
        return '#3b82f6'; // Biru (mata kaki)
    }
  };

  const filteredStations = stations.filter((s) => {
    if (filterMode === 'reports') return false;
    if (filterMode === 'critical') return s.status === 'SIAGA' || s.status === 'AWAS';
    return true;
  });

  const filteredReports = reports.filter(() => {
    if (filterMode === 'critical') return false;
    return true;
  });

  const getTileUrl = () => {
    switch (layerType) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'topo':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950 flex flex-col">
      {/* Top Map Control Bar */}
      <div className="bg-slate-900/95 backdrop-blur px-3 sm:px-4 py-2 border-b border-slate-800 z-10">
        {/* Row 1: Judul di Kiri, Tombol Minimize Sejajar di Pojok Kanan */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold min-w-0">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">Peta Cekungan Bandung</span>
            {isMinimized && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                Diminimalkan
              </span>
            )}
          </div>

          {/* Minimize / Expand Toggle Button di Pojok Kanan */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Perbesar / Buka Peta' : 'Minimize Peta'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer shrink-0 ml-auto"
          >
            {isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Row 2: Quick Filter Buttons & Layer Switcher (Saat Peta Terbuka) */}
        {!isMinimized && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2">
            {/* Layer Mode Picker */}
            <select
              value={layerType}
              onChange={(e) => setLayerType(e.target.value as MapLayerType)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="street">Peta Jalan</option>
              <option value="satellite">Satelit</option>
              <option value="topo">Topografi</option>
            </select>

            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              Semua ({stations.length + reports.length})
            </button>
            <button
              onClick={() => setFilterMode('critical')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${filterMode === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              Siaga/Awas
            </button>
            <button
              onClick={() => setFilterMode('reports')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${filterMode === 'reports'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              Warga ({reports.length})
            </button>
          </div>
        )}
      </div>

      {isMinimized ? (
        <div
          onClick={() => setIsMinimized(false)}
          className="p-3 sm:px-4 bg-slate-950/90 hover:bg-slate-900 border-t border-slate-800 transition cursor-pointer flex items-center gap-2 text-xs text-slate-400 group"
          title="Klik untuk membuka kembali peta"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs text-slate-300">
            Peta Cekungan Bandung diminimalkan. Klik di sini untuk membuka kembali peta spasial.
          </span>
        </div>
      ) : (
        /* Interactive Map Box */
        <div className="w-full h-[420px] sm:h-[480px] lg:h-[520px] relative bg-slate-950">
          <MapContainer
            center={[-6.9850, 107.6250]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', minHeight: '420px' }}
            className="w-full h-full z-0"
          >
            {/* Helper component to invalidate size and control center */}
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Esri ArcGIS World Basemaps (100% Reliable, Fast CDN, No API Key, Global CORS) */}
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
              url={getTileUrl()}
              maxZoom={18}
            />

            {/* AWLR River Telemetry Markers */}
            {filteredStations.map((st) => {
              const color = getStationColor(st.status);
              const isAlert = st.status === 'AWAS' || st.status === 'SIAGA';

              return (
                <React.Fragment key={st.id}>
                  {isAlert && (
                    <CircleMarker
                      center={[st.lat, st.lng]}
                      radius={st.status === 'AWAS' ? 18 : 14}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.25,
                        weight: 1,
                      }}
                    />
                  )}
                  <CircleMarker
                    center={[st.lat, st.lng]}
                    radius={9}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: color,
                      fillOpacity: 0.95,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[200px] text-slate-900 font-sans">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <strong className="text-xs text-slate-900">{st.name}</strong>
                          <span
                            className="text-[10px] font-bold text-white px-2 py-0.5 rounded"
                            style={{ backgroundColor: color }}
                          >
                            {st.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{st.river}</p>
                        <div className="mt-2 text-xs font-semibold bg-slate-100 p-2 rounded-lg">
                          TMA: <span className="text-sm font-extrabold text-blue-700">{st.levelCm} cm</span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Ambang Siaga: {st.alertThresholdCm} cm
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Citizen Report Markers */}
            {filteredReports.map((rep) => {
              const depthColor = getDepthColor(rep.depthCategory);
              const isSelected = selectedReport?.id === rep.id;

              return (
                <CircleMarker
                  key={rep.id}
                  center={[rep.lat, rep.lng]}
                  radius={isSelected ? 11 : 8}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : depthColor,
                    fillColor: depthColor,
                    fillOpacity: 0.85,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectReport && onSelectReport(rep),
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[220px] max-w-[260px] text-slate-900 font-sans">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-xs text-blue-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {rep.district}
                        </span>
                        {rep.isAiVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            AI Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-1.5 leading-snug">{rep.caption}</p>

                      {rep.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-28">
                          <img
                            src={rep.imageUrl}
                            alt="Foto Lokasi"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {rep.tiktokLiveUrl && (
                        <a
                          href={rep.tiktokLiveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition shadow-sm"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <Video className="w-3.5 h-3.5" />
                          <span>Tonton Live TikTok</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </a>
                      )}

                      <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span
                          className="font-bold px-1.5 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: depthColor }}
                        >
                          {rep.depthCategory}
                        </span>
                        <span className="text-slate-500 text-[10px]">{rep.createdAt}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Floating Focus Menu (Collapsible on Mobile) */}
          <div className="absolute top-2.5 right-2.5 z-[20] flex flex-col items-end">
            <button
              onClick={() => setShowFocusMenu(!showFocusMenu)}
              className="sm:hidden bg-slate-900/90 text-slate-200 border border-slate-700 p-2 rounded-xl text-xs flex items-center gap-1 shadow-lg"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>Fokus</span>
              {showFocusMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <div
              className={`${showFocusMenu ? 'flex' : 'hidden sm:flex'
                } flex-col gap-1 bg-slate-950/90 backdrop-blur p-2 rounded-xl border border-slate-800 shadow-xl mt-1.5 max-w-[170px]`}
            >
              <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-blue-400" /> Fokus Cekungan
              </span>

              {FOCUS_OPTIONS.map((opt) => {
                const isActive = activeFocus === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setActiveFocus(opt.id);
                      setMapCenter(opt.coords);
                      setMapZoom(opt.zoom);
                      setShowFocusMenu(false);
                    }}
                    className={`text-[11px] text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between border ${isActive
                        ? 'bg-blue-600 text-white font-semibold border-blue-400/50 shadow-sm'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-transparent'
                      }`}
                  >
                    <span>{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend (Mobile-Responsive, Dot Never Disappears) */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto z-[20] bg-slate-950/95 backdrop-blur p-2 sm:p-2.5 rounded-xl border border-slate-800 shadow-xl text-[10px]">
            <span className="font-bold text-slate-300 block mb-1 text-[10px]">
              Legenda Status:
            </span>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="inline-flex items-center gap-1 text-slate-300 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block shadow-sm" />
                Normal
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0 inline-block shadow-sm" />
                Waspada
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 inline-block shadow-sm" />
                Siaga
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 inline-block shadow-sm" />
                Awas
              </span>
              <span className="inline-flex items-center gap-1 text-blue-400 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 inline-block shadow-sm" />
                Laporan Warga
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
