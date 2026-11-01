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
  Video,
  ExternalLink,
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
        return '#b33e35'; // Merah Figma
      case 'SIAGA':
        return '#a9621d'; // Oranye Figma
      case 'WASPADA':
        return '#927626'; // Olive/Kuning Figma
      default:
        return '#497665'; // Hijau/Teal Figma
    }
  };

  const getDepthColor = (category: string) => {
    switch (category) {
      case 'Diatas 1 Meter':
        return '#b33e35'; // Awas Merah
      case 'Sepaha (50-80cm)':
        return '#a9621d'; // Siaga Oranye
      case 'Selutut (20-50cm)':
        return '#d97706'; // Amber
      default:
        return '#126b70'; // Teal Figma
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
        // OpenStreetMap Standard - Peta Terang Jalan & Sungai Citarum (100% Free & Tanpa API Key)
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = () => {
    switch (layerType) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';
      case 'topo':
        return 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, USGS, NPS';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <div className="w-full rounded-md overflow-hidden border border-[#dce2e2] shadow-xs relative bg-white flex flex-col">
      {/* Top Map Control Bar */}
      <div className="bg-white px-4 sm:px-5 py-3 border-b border-[#dce2e2] z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#126b70] shrink-0" />
          <h2 className="text-[17px] font-bold text-[#173744]">
            Peta pemantauan
          </h2>
        </div>

        {/* Filters & Layer Picker */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={layerType}
            onChange={(e) => setLayerType(e.target.value as MapLayerType)}
            className="bg-[#f8faf9] border border-[#dce2e2] text-[#173744] text-xs font-semibold px-2.5 py-1.5 rounded focus:outline-none cursor-pointer"
          >
            <option value="street">Peta Terang (OSM)</option>
            <option value="topo">Topografi Kontur</option>
            <option value="satellite">Citra Satelit</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'all' | 'critical' | 'reports')}
            className="bg-[#f8faf9] border border-[#dce2e2] text-[#173744] text-xs font-semibold px-2.5 py-1.5 rounded focus:outline-none cursor-pointer"
          >
            <option value="all">Semua ({stations.length + reports.length})</option>
            <option value="critical">Siaga & Awas</option>
            <option value="reports">Laporan Warga ({reports.length})</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="w-full h-[400px] sm:h-[460px] relative bg-[#edf0e9]">
        <MapContainer
          center={[-6.9850, 107.6250]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          className="w-full h-full z-0"
        >
          {/* Helper component to invalidate size and control center */}
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Basemaps */}
          <TileLayer
            key={layerType}
            attribution={getAttribution()}
            url={getTileUrl()}
            maxZoom={19}
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
                      fillOpacity: 0.2,
                      weight: 1.5,
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
                    weight: 2.5,
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] text-[#173744] font-sans">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <strong className="text-xs font-bold text-[#173744]">{st.name}</strong>
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded"
                          style={{ backgroundColor: color }}
                        >
                          {st.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#66757c] mt-1">{st.river}</p>
                      <div className="mt-2 text-xs font-semibold bg-[#f8faf9] border border-[#dce2e2] p-2 rounded">
                        TMA: <span className="text-sm font-mono font-bold text-[#173744]">{st.levelCm} cm</span>
                        <div className="text-[10px] text-[#66757c] mt-0.5">
                          Ambang Siaga: {st.warningThresholdCm} cm
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
                  <div className="p-1 min-w-[220px] max-w-[260px] text-[#173744] font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-xs text-[#126b70] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#b33e35]" />
                        {rep.district}
                      </span>
                      {rep.isAiVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                          Verified AI
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#173744] mt-1.5 leading-snug">{rep.caption}</p>

                    {rep.imageUrl && (
                      <div className="mt-2 rounded overflow-hidden border border-[#dce2e2] max-h-28">
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
                        className="mt-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition shadow-xs"
                      >
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
                      <span className="text-[#66757c] text-[10px]">{rep.createdAt}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Top-Left Overlay Button: Cekungan Bandung Selatan */}
        <div className="absolute top-3 left-3 z-[20]">
          <button
            onClick={() => {
              setMapCenter([-6.9850, 107.6250]);
              setMapZoom(12);
            }}
            className="bg-white/95 hover:bg-white text-[#173744] border border-[#dce2e2] text-xs font-semibold px-3 py-1.5 rounded shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <MapPin className="w-3.5 h-3.5 text-[#126b70]" />
            <span>Cekungan Bandung Selatan</span>
          </button>
        </div>

        {/* Top-Right Map Controls (+, -, Locate) */}
        <div className="absolute top-3 right-3 z-[20] flex flex-col bg-white border border-[#dce2e2] rounded shadow-xs overflow-hidden">
          <button
            onClick={() => setMapZoom((z) => Math.min(18, z + 1))}
            className="w-8 h-8 flex items-center justify-center text-[#173744] hover:bg-[#f8faf9] border-b border-[#dce2e2] font-bold text-sm cursor-pointer"
            title="Perbesar Peta"
          >
            +
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(9, z - 1))}
            className="w-8 h-8 flex items-center justify-center text-[#173744] hover:bg-[#f8faf9] border-b border-[#dce2e2] font-bold text-sm cursor-pointer"
            title="Perkecil Peta"
          >
            -
          </button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setMapCenter([pos.coords.latitude, pos.coords.longitude]);
                  setMapZoom(14);
                });
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-[#173744] hover:bg-[#f8faf9] text-xs cursor-pointer"
            title="Pusatkan ke Lokasi Saya"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#126b70]" />
          </button>
        </div>

        {/* Bottom-Left Compass */}
        <div className="absolute bottom-3 left-3 z-[20] bg-white/90 border border-[#dce2e2] px-2 py-1 rounded text-[10px] font-bold text-[#173744] flex items-center gap-1 shadow-2xs pointer-events-none">
          <span>U</span>
          <span>▲</span>
        </div>

        {/* Bottom-Right Orientation Note */}
        <div className="absolute bottom-3 right-3 z-[20] bg-white/90 border border-[#dce2e2] px-2.5 py-1 rounded text-[10px] text-[#66757c] shadow-2xs pointer-events-none hidden sm:block">
          Peta orientasi • posisi indikatif, bukan panduan rute
        </div>
      </div>

      {/* Footer Legenda (Figma Legenda 912x38) */}
      <div className="bg-[#f8faf9] px-4 sm:px-5 py-2.5 border-t border-[#dce2e2] flex flex-wrap items-center justify-between gap-y-1 text-xs text-[#66757c]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-[#173744] uppercase tracking-wider text-[10px]">
            LEGENDA
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#173744]">
            <span className="w-2 h-2 rounded-full bg-[#b33e35]" />
            Awas
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#173744]">
            <span className="w-2 h-2 rounded-full bg-[#a9621d]" />
            Siaga
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#173744]">
            <span className="w-3.5 h-1 bg-[#7baeb7] rounded-full inline-block" />
            Aliran sungai
          </span>
        </div>

        <div className="text-[11px] text-[#66757c]">
          {stations.length} lokasi sensor • {reports.length} laporan warga
        </div>
      </div>
    </div>
  );
}
