'use client';

import React from 'react';
import { Info, Radio } from 'lucide-react';
import { AWLRStation } from '@/types';

interface FigmaSensorPanelProps {
  stations: AWLRStation[];
}

export function FigmaSensorPanel({ stations }: FigmaSensorPanelProps) {
  // Urutkan stasiun dari AWAS -> SIAGA -> WASPADA -> NORMAL
  const sortedStations = [...stations].sort((a, b) => {
    const priority: Record<string, number> = {
      AWAS: 0,
      SIAGA: 1,
      WASPADA: 2,
      NORMAL: 3,
    };
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
  });

  return (
    <div className="w-full bg-white border border-[#dce2e2] rounded-md overflow-hidden shadow-xs flex flex-col h-full md:h-[560px]">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#126b70]" />
            <h2 className="text-[17px] font-bold text-[#173744]">
              Sensor sungai resmi
            </h2>
          </div>
          <span className="text-xs text-[#66757c] font-medium">
            {stations.length} lokasi
          </span>
        </div>
        <p className="text-xs text-[#66757c] mt-0.5">
          AWLR BBWS / BPBD • interval 5 menit
        </p>
      </div>

      {/* Column Sub-label Bar */}
      <div className="bg-[#f8faf9] px-4 sm:px-5 py-2 border-y border-[#dce2e2] text-[10px] sm:text-[11px] font-bold tracking-wider text-[#66757c] uppercase shrink-0">
        LOKASI PANTAU / TINGGI MUKA AIR (TMA)
      </div>

      {/* Station List (Scrollable if many stations) */}
      <div className="flex-1 min-h-0 divide-y divide-[#dce2e2] overflow-y-auto custom-scrollbar">
        {sortedStations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#66757c]">
            Memuat data sensor sungai resmi...
          </div>
        ) : (
          sortedStations.map((st) => {
            const isAwas = st.status === 'AWAS';
            const isSiaga = st.status === 'SIAGA';
            const isWaspada = st.status === 'WASPADA';

            const badgeBg = isAwas
              ? 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]/80'
              : isSiaga
              ? 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]/80'
              : isWaspada
              ? 'bg-[#fef9e7] text-[#927626] border-[#fde8a0]/80'
              : 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]/80';

            return (
              <div
                key={st.id}
                className="p-4 sm:px-5 hover:bg-[#fbfcfb] transition-colors"
              >
                {/* Location and Status Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm text-[#173744] truncate">
                    {st.name}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border tracking-wide uppercase shrink-0 ${badgeBg}`}
                  >
                    {st.status}
                  </span>
                </div>

                {/* Sub-river name */}
                <div className="text-[11px] text-[#66757c] mt-0.5">
                  {st.river}
                </div>

                {/* TMA Measurement and Context */}
                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl sm:text-[26px] font-bold text-[#173744] tracking-tight">
                      {st.levelCm}
                    </span>
                    <span className="text-xs font-semibold text-[#66757c]">
                      cm
                    </span>
                  </div>

                  <span className="text-[11px] text-[#66757c]">
                    Batas Awas: {st.dangerThresholdCm} cm
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disclaimer / Note Footer */}
      <div className="p-3.5 sm:px-5 bg-[#f8faf9] border-t border-[#dce2e2] flex items-start gap-2 text-[11px] text-[#66757c] shrink-0">
        <Info className="w-3.5 h-3.5 text-[#126b70] shrink-0 mt-0.5" />
        <span className="leading-snug">
          Waktu tiap pembacaan otomatis terbarui tiap 5 menit dari jaringan sensor duga air resmi.
        </span>
      </div>
    </div>
  );
}

