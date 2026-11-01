'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Info,
  ChevronDown,
  AlertTriangle,
  Bike,
  Car,
  Mountain,
} from 'lucide-react';

interface FigmaBulletinFullPageProps {
  lastUpdated?: string;
  onOpenReportModal?: () => void;
}

export function FigmaBulletinFullPage({
  lastUpdated,
  onOpenReportModal,
}: FigmaBulletinFullPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const regions = [
    {
      id: 'dayeuhkolot',
      icon: AlertTriangle,
      name: 'Dayeuhkolot, Baleendah & Bojongsoang',
      badge: 'Siaga genangan',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      condition:
        'TMA Dayeuhkolot 685 cm. Genangan 20–50 cm saat hujan deras di akses Jembatan Lama Dayeuhkolot dan Jl. Raya Andir-Baleendah.',
      advice:
        'Pengalihan dalam ringkasan website: melalui Jembatan Baru Dayeuhkolot. Periksa kondisi setempat sebelum melintas.',
    },
    {
      id: 'kopo',
      icon: Bike,
      name: 'Kopo Sayati, Cibaduyut & Katapang',
      badge: 'Roda 2 waspada',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      condition:
        'Genangan 30–50 cm saat hujan lebih dari 1 jam. Pengendara roda dua perlu meningkatkan kewaspadaan.',
      advice:
        'Pilih rute sesuai jenis kendaraan dan kondisi setempat. Jangan memaksakan perjalanan melalui genangan.',
    },
    {
      id: 'rancaekek',
      icon: Car,
      name: 'Rancaekek & Majalaya',
      badge: 'Bisa dilewati',
      badgeClass: 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]',
      condition:
        'Kawasan PT Kahatex di Jalan Nasional Bandung–Garut: genangan sisa 10–20 cm di lajur kiri. Cikeruh dalam pengawasan.',
      advice:
        'Kurangi kecepatan saat melintas. Status dalam arsip ini bukan jaminan kondisi jalan saat ini.',
    },
    {
      id: 'pangalengan',
      icon: Mountain,
      name: 'Pangalengan, Ciwidey, Ibun & Pasirjambu',
      badge: 'Waspada longsor',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      condition:
        'Potensi longsor di wilayah perbukitan, terutama sore hingga malam.',
      advice:
        'Hindari berteduh di bawah lereng curam dan pantau pembaruan informasi.',
    },
  ];

  const filteredRegions =
    selectedFilter === 'all'
      ? regions
      : regions.filter((r) => r.id === selectedFilter);

  const displayTime = lastUpdated || '1 November 2026, 21:45 WIB';

  return (
    <div className="w-full space-y-6">
      {/* 1. HEADER SECTION (Frame 3:11384 Judul dan edisi 1360x98) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#126b70] uppercase block">
            INFORMASI WILAYAH / ARSIP
          </span>
          <h1 className="text-[28px] sm:text-[36px] font-bold text-[#172d3b] tracking-tight mt-1 leading-tight">
            Buletin wilayah
          </h1>
          <p className="text-sm text-[#66757c] mt-1">
            Buletin Informasi Terkini Kabupaten Bandung
          </p>
        </div>

        <div className="flex flex-col md:items-end text-left md:text-right">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#172d3b]">
            <CalendarDays className="w-4 h-4 text-[#126b70]" />
            <span>Awal November 2026</span>
          </div>
          <span className="text-xs text-[#66757c] mt-0.5">
            Pembaruan: {displayTime}
          </span>
        </div>
      </div>

      {/* 2. NOTICE CARD (Frame 3:11384 / 3:11500 Catatan informasi) */}
      <div className="p-4 sm:p-5 bg-[#eaf3f1] border border-[#dce2e2] rounded-md flex items-start gap-3">
        <Info className="w-5 h-5 text-[#126b70] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#173744] space-y-0.5">
          <div className="font-bold">
            Anda sedang membaca buletin arsip
          </div>
          <div className="text-xs text-[#66757c] leading-relaxed">
            Ringkasan kondisi awal November 2026 dari website Citarum Alert. Bukan kondisi live atau verifikasi lapangan terbaru; periksa pembaruan dan arahan petugas sebelum bepergian.
          </div>
        </div>
      </div>

      {/* 3. FILTER & SCOPE BAR (Frame 3:11384 Filter dan cakupan 1360x74) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172d3b]">
            Kondisi &amp; imbauan per wilayah
          </h2>
          <p className="text-xs text-[#66757c] mt-0.5">
            {filteredRegions.length} cakupan wilayah •{' '}
            {selectedFilter === 'all' ? 'semua ditampilkan' : 'terfilter'}
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <label className="text-xs font-semibold text-[#172d3b] block">
            Tampilkan wilayah
          </label>
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full h-11 appearance-none bg-white border border-[#dce2e2] rounded px-3.5 pr-8 text-xs font-semibold text-[#172d3b] focus:outline-none focus:border-[#126b70] cursor-pointer"
            >
              <option value="all">Semua Wilayah</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#66757c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. FOUR REGIONS CARD / TABLE (Frame 3:11384 / 3:11500) */}
      <div className="w-full bg-white border border-[#dce2e2] rounded-md shadow-xs overflow-hidden">
        {/* DESKTOP TABLE HEADER (Frame 3:11384 Kepala tabel buletin 1360x42) */}
        <div className="hidden lg:grid grid-cols-12 gap-6 bg-[#f5f6f5] px-6 py-3 border-b border-[#dce2e2] text-[11px] font-bold text-[#66757c] uppercase tracking-wider">
          <div className="col-span-4">WILAYAH / KONDISI</div>
          <div className="col-span-4">CATATAN KONDISI</div>
          <div className="col-span-4">IMBAUAN / AKSES JALAN</div>
        </div>

        {/* ROWS */}
        <div className="divide-y divide-[#dce2e2]">
          {filteredRegions.map((region) => {
            const Icon = region.icon;
            return (
              <div
                key={region.id}
                className="p-5 sm:p-6 lg:px-6 lg:py-5 hover:bg-[#fbfcfb] transition-colors"
              >
                {/* DESKTOP GRID ROW */}
                <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
                  {/* Col 1: Wilayah / Kondisi */}
                  <div className="col-span-4 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#f5f6f5] border border-[#dce2e2] flex items-center justify-center text-[#126b70] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-sm text-[#172d3b] leading-snug">
                        {region.name}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${region.badgeClass}`}
                      >
                        {region.badge}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Catatan Kondisi */}
                  <div className="col-span-4 text-xs sm:text-sm text-[#172d3b] leading-relaxed">
                    {region.condition}
                  </div>

                  {/* Col 3: Imbauan / Akses Jalan */}
                  <div className="col-span-4 text-xs sm:text-sm text-[#172d3b] leading-relaxed font-medium">
                    {region.advice}
                  </div>
                </div>

                {/* MOBILE STACKED CARD (Frame 3:11500) */}
                <div className="flex lg:hidden flex-col gap-3">
                  {/* Header & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#126b70] shrink-0" />
                      <h3 className="font-semibold text-sm text-[#172d3b]">
                        {region.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${region.badgeClass}`}
                    >
                      {region.badge}
                    </span>
                  </div>

                  {/* Kondisi */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#66757c] uppercase tracking-wider block">
                      KONDISI
                    </span>
                    <p className="text-xs text-[#172d3b] leading-relaxed">
                      {region.condition}
                    </p>
                  </div>

                  {/* Imbauan */}
                  <div className="space-y-1 border-l-2 border-[#126b70] pl-3 py-0.5 bg-[#fbfcfb] rounded-r">
                    <span className="text-[10px] font-bold text-[#126b70] uppercase tracking-wider block">
                      IMBAUAN / AKSES
                    </span>
                    <p className="text-xs text-[#172d3b] leading-relaxed font-medium">
                      {region.advice}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RUJUKAN & KONTEKS (Frame 3:11384 Rujukan buletin 1360x138) */}
      <div className="w-full bg-white border border-[#dce2e2] rounded-md p-5 sm:p-6 space-y-2 shadow-xs">
        <h3 className="font-bold text-sm sm:text-base text-[#172d3b]">
          Rujukan &amp; konteks
        </h3>
        <p className="text-xs text-[#66757c] leading-relaxed">
          Sebagaimana tercantum di website: Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung, dan TMC Polresta Bandung.
        </p>
        <p className="text-xs text-[#66757c] leading-relaxed">
          Rangkuman website menyebut BPBD menetapkan 25 kecamatan waspada potensi hidrometeorologi. Ini bukan temuan atau verifikasi baru.
        </p>
      </div>
    </div>
  );
}

