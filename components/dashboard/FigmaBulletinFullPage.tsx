'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Info,
  AlertTriangle,
  Bike,
  Car,
  Mountain,
  Filter,
} from 'lucide-react';
import {
  SituationalBulletinData,
  DEFAULT_BULLETIN,
} from '@/lib/bulletin-types';
import { Dropdown } from '@/components/ui/Dropdown';

interface FigmaBulletinFullPageProps {
  bulletin?: SituationalBulletinData | null;
  lastUpdated?: string;
  onOpenReportModal?: () => void;
}

function getRegionIconAndStyle(reg: {
  region?: string;
  location?: string;
  status?: string;
}) {
  const text = `${reg.region || ''} ${reg.location || ''}`.toLowerCase();
  const lowerStatus = (reg.status || '').toLowerCase();

  let Icon = AlertTriangle;
  if (
    text.includes('kopo') ||
    text.includes('sayati') ||
    text.includes('cibaduyut') ||
    text.includes('roda 2') ||
    text.includes('motor')
  ) {
    Icon = Bike;
  } else if (
    text.includes('rancaekek') ||
    text.includes('jalan') ||
    text.includes('majalaya') ||
    text.includes('kahatex') ||
    text.includes('mobil')
  ) {
    Icon = Car;
  } else if (
    text.includes('pangalengan') ||
    text.includes('ciwidey') ||
    text.includes('ibun') ||
    text.includes('lereng') ||
    text.includes('longsor') ||
    text.includes('pasirjambu')
  ) {
    Icon = Mountain;
  }

  let badgeClass = 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]';

  if (
    lowerStatus.includes('awas') ||
    lowerStatus.includes('bahaya') ||
    lowerStatus.includes('tergenang parah')
  ) {
    badgeClass = 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]';
  } else if (lowerStatus.includes('siaga') || lowerStatus.includes('waspada')) {
    badgeClass = 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]';
  } else if (
    lowerStatus.includes('lancar') ||
    lowerStatus.includes('bisa dilewati') ||
    lowerStatus.includes('normal') ||
    lowerStatus.includes('aman')
  ) {
    badgeClass = 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]';
  }

  return { Icon, badgeClass };
}

export function FigmaBulletinFullPage({
  bulletin,
  lastUpdated,
}: FigmaBulletinFullPageProps) {
  const [fetchedData, setFetchedData] =
    useState<SituationalBulletinData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    if (bulletin) return;

    let isCancelled = false;
    fetch('/api/bulletin')
      .then((r) => r.json())
      .then((res) => {
        if (!isCancelled && res.success && res.data) {
          setFetchedData(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [bulletin]);

  const activeData = bulletin || fetchedData || DEFAULT_BULLETIN;
  const displayTime =
    activeData.lastUpdated || lastUpdated || '1 November 2026, 21:45 WIB';
  const regionsList =
    Array.isArray(activeData.regions) && activeData.regions.length > 0
      ? activeData.regions
      : DEFAULT_BULLETIN.regions;

  const filteredRegions =
    selectedFilter === 'all'
      ? regionsList
      : regionsList.filter((_, idx) => String(idx) === selectedFilter);

  return (
    <div className='w-full space-y-6'>
      {/* 1. HEADER SECTION (Frame 3:11384 Judul dan edisi 1360x98) */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4'>
        <div>
          <span className='text-[10px] sm:text-xs font-bold tracking-wider text-[#126b70] uppercase block'>
            INFORMASI WILAYAH
          </span>
          <h1 className='text-xl sm:text-2xl md:text-[32px] font-bold text-[#172d3b] tracking-tight mt-0.5 leading-tight'>
            Buletin terkini
          </h1>
          <p className='text-xs sm:text-sm text-[#66757c] mt-0.5'>
            {activeData.title || 'Buletin Informasi Terkini Kabupaten Bandung'}
          </p>
        </div>

        <div className='flex flex-col md:items-end text-left md:text-right'>
          <div className='flex items-center gap-2 text-xs font-semibold text-[#172d3b]'>
            <CalendarDays className='w-4 h-4 text-[#126b70]' />
            <span>{activeData.period || 'November 2026'}</span>
          </div>
          <span className='text-xs text-[#66757c] mt-0.5'>
            Pembaruan: {displayTime}
          </span>
        </div>
      </div>

      {/* 2. NOTICE CARD (Frame 3:11384 / 3:11500 Catatan informasi) */}
      <div className='p-4 sm:p-5 bg-[#eaf3f1] border border-[#dce2e2] rounded-md flex items-start gap-3'>
        <Info className='w-5 h-5 text-[#126b70] shrink-0 mt-0.5' />
        <div className='text-xs sm:text-sm text-[#173744] space-y-1'>
          <div className='font-bold text-[#126b70]'>
            Ringkasan Situasi Wilayah Terkini
          </div>
          <div className='text-xs text-[#173744] leading-relaxed'>
            {activeData.leadSummary ||
              'Ringkasan resmi situasi kebencanaan dan transportasi se-Kabupaten Bandung dari website Citarum Alert.'}
          </div>
        </div>
      </div>

      {/* 3. FILTER & SCOPE BAR (Frame 3:11384 Filter dan cakupan 1360x74) */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-3'>
        <div>
          <h2 className='text-base sm:text-lg font-bold text-[#172d3b]'>
            Kondisi per wilayah
          </h2>
          <p className='text-xs text-[#66757c] mt-0.5'>
            {filteredRegions.length} cakupan wilayah •{' '}
            {selectedFilter === 'all' ? 'semua ditampilkan' : 'terfilter'}
          </p>
        </div>

        <div className='w-full sm:w-52 space-y-1'>
          <label className='text-[11px] font-medium text-[#66757c] block'>
            Tampilkan wilayah
          </label>
          <Dropdown
            value={selectedFilter}
            onChange={setSelectedFilter}
            options={[
              { value: 'all', label: `Semua Wilayah (${regionsList.length})` },
              ...regionsList.map((r, idx) => ({
                value: String(idx),
                label: r.location || r.region || `Wilayah ${idx + 1}`,
              })),
            ]}
            fullWidth
            size='sm'
            icon={<Filter className='w-3 h-3 text-[#126b70]' />}
          />
        </div>
      </div>

      {/* 4. FOUR REGIONS CARD / TABLE (Frame 3:11384 / 3:11500) */}
      <div className='w-full bg-white border border-[#dce2e2] rounded-md shadow-xs overflow-hidden'>
        {/* DESKTOP TABLE HEADER */}
        <div className='hidden lg:grid grid-cols-12 gap-6 bg-[#f5f6f5] px-6 py-3 border-b border-[#dce2e2] text-[11px] font-bold text-[#66757c] uppercase tracking-wider'>
          <div className='col-span-4'>WILAYAH / KONDISI</div>
          <div className='col-span-2'>STATUS</div>
          <div className='col-span-6'>CATATAN KONDISI</div>
        </div>

        {/* ROWS */}
        <div className='divide-y divide-[#dce2e2]'>
          {filteredRegions.map((region, idx) => {
            const { Icon, badgeClass } = getRegionIconAndStyle(region);
            return (
              <div
                key={idx}
                className='p-5 sm:p-6 lg:px-6 lg:py-5 hover:bg-[#fbfcfb] transition-colors'
              >
                {/* DESKTOP GRID ROW */}
                <div className='hidden lg:grid grid-cols-12 gap-6 items-center'>
                  {/* Col 1: Wilayah / Kondisi */}
                  <div className='col-span-4 flex items-start gap-2.5'>
                    <div className='w-7 h-7 rounded bg-[#f5f6f5] border border-[#dce2e2] flex items-center justify-center text-[#126b70] shrink-0 mt-0.5'>
                      <Icon className='w-4 h-4' />
                    </div>
                    <div>
                      <div className='font-semibold text-sm text-[#172d3b] leading-snug'>
                        {region.location || region.region}
                      </div>
                      {region.region && region.region !== region.location && (
                        <div className='text-[11px] text-[#66757c] mt-0.5'>
                          {region.region}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Status */}
                  <div className='col-span-2'>
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${badgeClass}`}
                    >
                      {region.status}
                    </span>
                  </div>

                  {/* Col 3: Catatan Kondisi */}
                  <div className='col-span-6 text-xs sm:text-sm text-[#172d3b] leading-relaxed'>
                    {region.condition}
                  </div>
                </div>

                {/* MOBILE STACKED CARD (Frame 3:11500) */}
                <div className='flex lg:hidden flex-col gap-3'>
                  {/* Header & Badge */}
                  <div className='flex items-start gap-2.5'>
                    <div className='w-7 h-7 rounded bg-[#f5f6f5] border border-[#dce2e2] flex items-center justify-center text-[#126b70] shrink-0 mt-0.5'>
                      <Icon className='w-4 h-4' />
                    </div>
                    <div className='flex-1 min-w-0 space-y-1'>
                      <div className='flex flex-wrap items-center justify-between gap-1.5'>
                        <h3 className='font-bold text-sm text-[#172d3b] leading-tight'>
                          {region.location || region.region}
                        </h3>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${badgeClass}`}
                        >
                          {region.status}
                        </span>
                      </div>
                      {region.region && region.region !== region.location && (
                        <div className='text-[11px] text-[#66757c] font-medium leading-snug'>
                          {region.region}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kondisi */}
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-[#66757c] uppercase tracking-wider block'>
                      KONDISI
                    </span>
                    <p className='text-xs text-[#172d3b] leading-relaxed'>
                      {region.condition}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RUJUKAN & KONTEKS (Frame 3:11384 Rujukan buletin 1360x138) */}
      <div className='w-full bg-white border border-[#dce2e2] rounded-md p-5 sm:p-6 space-y-2 shadow-xs'>
        <h3 className='font-bold text-sm sm:text-base text-[#172d3b]'>
          Rujukan &amp; konteks
        </h3>
        <p className='text-xs text-[#66757c] leading-relaxed'>
          Sebagaimana tercantum di portal resmi:{' '}
          {activeData.sources ||
            'Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung, dan TMC Polresta Bandung.'}
        </p>
        <p className='text-xs text-[#66757c] leading-relaxed'>
          {activeData.mitigationNotice ||
            'Masyarakat dihimbau memantau sensor debit sungai real-time, menghindari berteduh di bawah lereng curam, serta memilih rute aman saat curah hujan meningkat.'}
        </p>
      </div>
    </div>
  );
}
