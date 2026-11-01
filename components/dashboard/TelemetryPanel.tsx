'use client';

import React, { useState } from 'react';
import { AWLRStation } from '@/types';
import {
  Droplets,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { calculateAlertPercentage } from '@/lib/scraper';

interface TelemetryPanelProps {
  stations: AWLRStation[];
}

export function TelemetryPanel({ stations }: TelemetryPanelProps) {
  const [showAllStations, setShowAllStations] = useState(false);

  const awasCount = stations.filter((s) => s.status === 'AWAS').length;
  const siagaCount = stations.filter((s) => s.status === 'SIAGA').length;
  const waspadaCount = stations.filter((s) => s.status === 'WASPADA').length;
  const normalCount = stations.filter((s) => s.status === 'NORMAL').length;

  // Urutkan stasiun dari AWAS -> SIAGA -> WASPADA -> NORMAL
  const statusRank: Record<string, number> = {
    AWAS: 1,
    SIAGA: 2,
    WASPADA: 3,
    NORMAL: 4,
  };

  const sortedStations = [...stations].sort((a, b) => {
    const rankA = statusRank[a.status] ?? 5;
    const rankB = statusRank[b.status] ?? 5;
    if (rankA !== rankB) return rankA - rankB;
    const pctA = calculateAlertPercentage(a.levelCm, a.alertThresholdCm);
    const pctB = calculateAlertPercentage(b.levelCm, b.alertThresholdCm);
    return pctB - pctA;
  });

  const criticalStations = sortedStations.filter(
    (s) => s.status === 'AWAS' || s.status === 'SIAGA'
  );
  const hasCritical = criticalStations.length > 0;

  // Tampilkan yang awas dan siaga saja jika ada secara default; atau 2 stasiun jika semua normal/waspada
  const displayedStations = showAllStations
    ? sortedStations
    : hasCritical
      ? criticalStations
      : sortedStations.slice(0, 2);

  const hiddenCount = sortedStations.length - displayedStations.length;

  const getStatusBadge = (status: AWLRStation['status']) => {
    switch (status) {
      case 'AWAS':
        return <Badge variant="awas">AWAS</Badge>;
      case 'SIAGA':
        return <Badge variant="siaga">SIAGA</Badge>;
      case 'WASPADA':
        return <Badge variant="waspada">WASPADA</Badge>;
      default:
        return <Badge variant="normal">NORMAL</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Status Awas</p>
            <p className="text-xl font-black text-rose-400">{awasCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Status Siaga</p>
            <p className="text-xl font-black text-amber-400">{siagaCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Status Waspada</p>
            <p className="text-xl font-black text-yellow-400">{waspadaCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <Droplets className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Status Normal</p>
            <p className="text-xl font-black text-emerald-400">{normalCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* River Water Level Telemetry Stations */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
              Sensor Debit Air Resmi (AWLR BBWS / BPBD)
            </h2>
          </div>

          <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-emerald-400 shrink-0" /> Update tiap 5 menit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedStations.map((st) => {
            const pct = calculateAlertPercentage(st.levelCm, st.alertThresholdCm);

            return (
              <div
                key={st.id}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 space-y-2.5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{st.name}</h3>
                    <p className="text-xs text-slate-400">{st.river}</p>
                  </div>
                  {getStatusBadge(st.status)}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Tinggi Muka Air (TMA):</span>
                    <span className="font-extrabold text-base text-slate-100">
                      {st.levelCm} <span className="text-xs font-normal text-slate-400">cm</span>
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Ambang Batas Siaga: {st.alertThresholdCm} cm</span>
                    <span className="font-semibold text-slate-300">{pct}%</span>
                  </div>

                  {/* Progress towards alert */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.status === 'AWAS'
                          ? 'bg-rose-500'
                          : st.status === 'SIAGA'
                            ? 'bg-amber-500'
                            : st.status === 'WASPADA'
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tombol Lihat Selengkapnya / Tampilkan Ringkas untuk Mobile & Desktop */}
        {hiddenCount > 0 && (
          <div className="pt-3 flex justify-center">
            <button
              onClick={() => setShowAllStations(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Lihat Selengkapnya ({hiddenCount} Stasiun Lainnya)</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        )}

        {showAllStations && stations.length > (hasCritical ? criticalStations.length : 2) && (
          <div className="pt-3 flex justify-center">
            <button
              onClick={() => setShowAllStations(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Tampilkan Ringkas ({hasCritical ? 'Hanya Siaga & Awas' : '2 Teratas'})</span>
              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
