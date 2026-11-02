'use client';

import React from 'react';
import { Info, Radio, ExternalLink, ShieldCheck } from 'lucide-react';
import { AWLRStation } from '@/types';
import { CountingNumber } from '@/components/ui/CountingNumber';

interface FigmaSensorPanelProps {
  stations: AWLRStation[];
  isLoading?: boolean;
}

export function FigmaSensorPanel({
  stations,
  isLoading = false,
}: FigmaSensorPanelProps) {
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
            <CountingNumber value={stations.length} isLoading={isLoading} /> lokasi
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-[#66757c] gap-2 flex-wrap">
          <span>AWLR BBWS / BPBD • interval 5 menit</span>
          <a
            href="https://sda.pu.go.id/balai/bbwscitarum/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#126b70] hover:text-[#0e5458] hover:underline transition"
            title="Buka Portal Resmi BBWS Citarum (Kementerian PU)"
          >
            <span>Sumber Resmi</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Column Sub-label Bar */}
      <div className="bg-[#f8faf9] px-4 sm:px-5 py-2 border-y border-[#dce2e2] text-[10px] sm:text-[11px] font-bold tracking-wider text-[#66757c] uppercase shrink-0">
        LOKASI PANTAU / TINGGI MUKA AIR (TMA)
      </div>

      {/* Station List (Scrollable if many stations) */}
      <div className="flex-1 min-h-0 divide-y divide-[#dce2e2] overflow-y-auto custom-scrollbar flex flex-col">
        {sortedStations.length === 0 ? (
          <div className="flex-1 min-h-[240px] w-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#66757c] gap-3">
            <div className="w-5 h-5 border-2 border-[#126b70]/20 border-t-[#126b70] rounded-full animate-spin" />
            <span className="font-medium text-[#66757c]">
              Memuat data sensor sungai resmi...
            </span>
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
                      <CountingNumber value={st.levelCm} isLoading={isLoading} />
                    </span>
                    <span className="text-xs font-semibold text-[#66757c]">
                      cm
                    </span>
                  </div>

                  <span className="text-[11px] text-[#66757c]">
                    Batas Awas: <CountingNumber value={st.dangerThresholdCm ?? 0} /> cm
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disclaimer & Official Verification Footer */}
      <div className="p-3.5 sm:px-5 bg-[#f8faf9] border-t border-[#dce2e2] space-y-1.5 text-[11px] text-[#66757c] shrink-0">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#126b70] shrink-0 mt-0.5" />
          <span className="leading-snug">
            Rujukan data sensor: Telemetri <strong>BBWS Citarum (Kementerian PU)</strong> &amp; <strong>BPBD</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2.5 pt-0.5 pl-5.5 flex-wrap text-[10px] sm:text-[11px]">
          <a
            href="https://sda.pu.go.id/balai/bbwscitarum/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#126b70] hover:underline"
            title="Portal Utama Balai Besar Wilayah Sungai Citarum"
          >
            <span>Portal BBWS Citarum</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span className="text-[#dce2e2]">•</span>
          <a
            href="https://ffws-bbwscitarum.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#126b70] hover:underline"
            title="Flood Forecasting and Warning System BBWS Citarum"
          >
            <span>FFWS Telemetri Banjir</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

