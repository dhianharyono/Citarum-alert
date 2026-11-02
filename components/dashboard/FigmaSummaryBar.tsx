'use client';

import React from 'react';
import { CalendarDays, RefreshCw, Info } from 'lucide-react';
import { AWLRStation } from '@/types';
import { CountingNumber } from '@/components/ui/CountingNumber';

interface FigmaSummaryBarProps {
  stations: AWLRStation[];
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
}

export function FigmaSummaryBar({
  stations,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: FigmaSummaryBarProps) {
  // Hitung jumlah stasiun berdasarkan status secara dinamis dari data telemetri
  const counts = stations.reduce(
    (acc, st) => {
      const s = st.status?.toUpperCase();
      if (s === 'AWAS') acc.awas++;
      else if (s === 'SIAGA') acc.siaga++;
      else if (s === 'WASPADA') acc.waspada++;
      else if (s === 'NORMAL') acc.normal++;
      return acc;
    },
    { awas: 0, siaga: 0, waspada: 0, normal: 0 },
  );

  // Nilai murni dari data telemetri aktual (tidak ada angka statis)
  const awasCount = counts.awas;
  const siagaCount = counts.siaga;
  const waspadaCount = counts.waspada;
  const normalCount = counts.normal;

  const displayDate = lastUpdated ? `Update: ${lastUpdated} WIB` : '1 Nov 2026';

  return (
    <div className='w-full'>
      {/* DESKTOP HEADER & STATS (Visible on md and up) */}
      <div className='hidden md:flex flex-col gap-4'>
        {/* Row 1: Title and Time Context */}
        <div className='flex items-start justify-between'>
          <div>
            <span className='text-[10px] sm:text-xs font-bold tracking-wider text-[#126b70] uppercase block'>
              PEMANTAUAN BANJIR
            </span>
            <h1 className='text-[30px] lg:text-[32px] font-bold text-[#173744] tracking-tight leading-tight'>
              Pantau sungai & siaga bersama
            </h1>
            <p className='text-[14px] text-[#66757c] mt-1'>
              Sensor sungai dan informasi warga di Kabupaten Bandung.
            </p>
          </div>

          <div className='flex flex-col items-end text-right'>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-[#173744]'>
              <CalendarDays className='w-3.5 h-3.5 text-[#126b70]' />
              <span>Pratinjau data • {displayDate}</span>
            </div>
            <span className='text-[11px] text-[#66757c] mt-0.5'>
              Terkoneksi ke pos AWLR &amp; sensor lapangan
            </span>
          </div>
        </div>

        {/* Row 2: Summary Metrics Card (Desktop Figma 1360x86) */}
        <div className='w-full bg-white border border-[#dce2e2] rounded-md shadow-xs p-4 lg:px-6 flex items-center justify-between'>
          {/* Label Scope */}
          <div className='pr-6 border-r border-[#dce2e2] min-w-[200px]'>
            <div className='text-[14px] font-bold text-[#173744]'>
              Status lokasi pantau
            </div>
            <div className='text-[11px] text-[#66757c] mt-0.5'>
              Berdasarkan{' '}
              <CountingNumber
                value={stations.length}
                isLoading={isRefreshing}
              />{' '}
              stasiun sungai aktif
            </div>
          </div>

          {/* Metric 1: Awas */}
          <div className='px-6 border-r border-[#dce2e2] flex items-center gap-3'>
            <span className='w-2 h-2 rounded-full bg-[#b33e35]' />
            <span className='font-mono text-2xl font-bold text-[#173744]'>
              <CountingNumber value={awasCount} isLoading={isRefreshing} />
            </span>
            <span className='text-[14px] text-[#173744]'>Awas</span>
          </div>

          {/* Metric 2: Siaga */}
          <div className='px-6 border-r border-[#dce2e2] flex items-center gap-3'>
            <span className='w-2 h-2 rounded-full bg-[#a9621d]' />
            <span className='font-mono text-2xl font-bold text-[#173744]'>
              <CountingNumber value={siagaCount} isLoading={isRefreshing} />
            </span>
            <span className='text-[14px] text-[#173744]'>Siaga</span>
          </div>

          {/* Metric 3: Waspada */}
          <div className='px-6 border-r border-[#dce2e2] flex items-center gap-3'>
            <span className='w-2 h-2 rounded-full bg-[#927626]' />
            <span className='font-mono text-2xl font-bold text-[#173744]'>
              <CountingNumber value={waspadaCount} isLoading={isRefreshing} />
            </span>
            <span className='text-[14px] text-[#173744]'>Waspada</span>
          </div>

          {/* Metric 4: Normal */}
          <div className='px-6 border-r border-[#dce2e2] flex items-center gap-3'>
            <span className='w-2 h-2 rounded-full bg-[#497665]' />
            <span className='font-mono text-2xl font-bold text-[#173744]'>
              <CountingNumber value={normalCount} isLoading={isRefreshing} />
            </span>
            <span className='text-[14px] text-[#173744]'>Normal</span>
          </div>

          {/* Refresh Action */}
          <div className='pl-6'>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className='h-9 px-3.5 rounded bg-white hover:bg-slate-50 border border-[#dce2e2] text-xs font-semibold text-[#173744] flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60'
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#126b70] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER & STATS (Visible on mobile only) */}
      <div className='flex md:hidden flex-col gap-3'>
        {/* Title (Font lebih proporsional & ringkas di layar mobile) */}
        <div>
          <span className='text-[10px] font-bold text-[#126b70] tracking-wider uppercase block'>
            PEMANTAUAN BANJIR
          </span>
          <h1 className='text-lg sm:text-xl font-bold text-[#173744] tracking-tight mt-0.5 leading-snug'>
            Pantau sungai, siaga bersama
          </h1>
          <p className='text-[11px] sm:text-xs text-[#66757c] mt-0.5'>
            Sensor sungai dan informasi warga di Kabupaten Bandung.
          </p>
        </div>

        {/* Soft Mint Info Box (Figma bg: #eaf3f1) */}
        <div className='p-3.5 bg-[#eaf3f1] border border-[#dce2e2] rounded-md flex items-start gap-2.5'>
          <Info className='w-4 h-4 text-[#126b70] shrink-0 mt-0.5' />
          <div className='text-xs text-[#173744]'>
            <div className='font-bold'>Pratinjau data • {displayDate}</div>
            <div className='text-[11px] text-[#66757c] mt-0.5 leading-snug'>
              Terhubung ke sensor AWLR &amp; validasi lapangan warga
              se-Kabupaten Bandung.
            </div>
          </div>
        </div>

        {/* Status Locations Summary Card */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold tracking-wider text-[#66757c] uppercase'>
              STATUS DARI{' '}
              <CountingNumber
                value={stations.length}
                isLoading={isRefreshing}
              />{' '}
              LOKASI PANTAU
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className='text-[11px] font-semibold text-[#126b70] flex items-center gap-1 cursor-pointer'
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          <div className='bg-white border border-[#dce2e2] rounded-md grid grid-cols-4 divide-x divide-[#dce2e2] py-2.5 shadow-xs'>
            {/* Awas */}
            <div className='flex flex-col items-center justify-center p-1'>
              <span className='font-mono text-xl font-bold text-[#b33e35]'>
                <CountingNumber value={awasCount} isLoading={isRefreshing} />
              </span>
              <span className='text-[11px] text-[#66757c] mt-0.5'>Awas</span>
            </div>

            {/* Siaga */}
            <div className='flex flex-col items-center justify-center p-1'>
              <span className='font-mono text-xl font-bold text-[#a9621d]'>
                <CountingNumber value={siagaCount} isLoading={isRefreshing} />
              </span>
              <span className='text-[11px] text-[#66757c] mt-0.5'>Siaga</span>
            </div>

            {/* Waspada */}
            <div className='flex flex-col items-center justify-center p-1'>
              <span className='font-mono text-xl font-bold text-[#927626]'>
                <CountingNumber value={waspadaCount} isLoading={isRefreshing} />
              </span>
              <span className='text-[11px] text-[#66757c] mt-0.5'>Waspada</span>
            </div>

            {/* Normal */}
            <div className='flex flex-col items-center justify-center p-1'>
              <span className='font-mono text-xl font-bold text-[#497665]'>
                <CountingNumber value={normalCount} isLoading={isRefreshing} />
              </span>
              <span className='text-[11px] text-[#66757c] mt-0.5'>Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
