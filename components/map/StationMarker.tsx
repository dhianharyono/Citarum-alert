'use client';

import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { AWLRStation } from '@/types';
import { calculateAlertPercentage } from '@/lib/scraper';

interface StationMarkerProps {
  station: AWLRStation;
}

export const getStatusColor = (status: AWLRStation['status']) => {
  switch (status) {
    case 'AWAS':
      return '#f43f5e'; // Rose-500
    case 'SIAGA':
      return '#f59e0b'; // Amber-500
    case 'WASPADA':
      return '#eab308'; // Yellow-500
    default:
      return '#10b981'; // Emerald-500
  }
};

export default function StationMarker({ station }: StationMarkerProps) {
  const percentage = calculateAlertPercentage(station.levelCm, station.alertThresholdCm);
  const color = getStatusColor(station.status);

  return (
    <>
      {/* Outer pulsing ring for critical stations */}
      {(station.status === 'AWAS' || station.status === 'SIAGA') && (
        <CircleMarker
          center={[station.lat, station.lng]}
          radius={station.status === 'AWAS' ? 18 : 14}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 1,
            className: 'animate-ping origin-center',
          }}
        />
      )}

      {/* Main station point */}
      <CircleMarker
        center={[station.lat, station.lng]}
        radius={10}
        pathOptions={{
          color: '#ffffff',
          fillColor: color,
          fillOpacity: 0.95,
          weight: 2.5,
        }}
      >
        <Popup className="citarum-popup">
          <div className="p-1 min-w-[210px] text-slate-900 font-sans">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">{station.name}</h4>
                <p className="text-[11px] text-slate-500">{station.river}</p>
              </div>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: color }}
              >
                {station.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-[11px]">TMA Terkini:</span>
                <span className="font-extrabold text-sm text-slate-900">{station.levelCm} cm</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Batas Siaga:</span>
                <span className="font-semibold text-slate-700">{station.alertThresholdCm} cm</span>
              </div>

              {/* Progress bar towards alert threshold */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Kapasitas Ambang</span>
                  <span className="font-bold">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Sumber: Telemetri BBWS</span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}

