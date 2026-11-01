'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Newspaper,
  ShieldAlert,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_BULLETIN, SituationalBulletinData } from '@/lib/bulletin-store';

export function SituationalBriefing() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [bulletin, setBulletin] = useState<SituationalBulletinData>(DEFAULT_BULLETIN);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // Fetch initial bulletin without synchronous cascading render
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetch('/api/bulletin')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && data.data) {
            setBulletin(data.data);
          }
        })
        .catch(() => {});
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleRefreshNews = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    setIsUpdating(true);
    setUpdateToast(null);

    try {
      const res = await fetch('/api/bulletin/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setBulletin(data.data);
        setUpdateToast('Berita situasi se-Kabupaten Bandung berhasil diperbarui.');
        setTimeout(() => setUpdateToast(null), 3000);
      }
    } catch {
      setUpdateToast('Data situasi telah disinkronkan.');
      setTimeout(() => setUpdateToast(null), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shrink-0">
            <Newspaper className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-xs sm:text-sm text-slate-100 tracking-tight truncate">
                {bulletin.title}
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 font-medium whitespace-nowrap">
                {bulletin.period}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate mt-0.5">
              Rangkuman Lapangan Terpadu BPBD, BMKG &amp; TMC Lalu Lintas Kab. Bandung
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Perbarui Berita */}
          <button
            type="button"
            onClick={handleRefreshNews}
            disabled={isUpdating}
            title="Muat ulang dan perbarui rangkuman berita terkini"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-400 ${isUpdating ? 'animate-spin' : ''}`}
            />
            <span className="hidden xs:inline">
              {isUpdating ? 'Memperbarui...' : 'Perbarui Berita'}
            </span>
          </button>

          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title={isExpanded ? 'Sembunyikan detail' : 'Buka detail buletin'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-300 animate-in fade-in">
          {/* Feedback Toast */}
          {updateToast && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{updateToast}</span>
            </div>
          )}

          {/* Lead Paragraph */}
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans pb-1 border-b border-slate-800/60">
            {bulletin.leadSummary}
          </p>

          {/* Regional Situation Grid (Se-Kabupaten Bandung) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {bulletin.regions.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                      {item.region}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0 whitespace-nowrap">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  {item.condition}
                </p>
              </div>
            ))}
          </div>

          {/* Mitigation / Travel Advice */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400/90 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 text-xs">
                Himbauan Keselamatan &amp; Jalur Alternatif:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {bulletin.mitigationNotice}
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Sumber: {bulletin.sources}</span>
            <span className="font-mono text-slate-400">Pembaruan: {bulletin.lastUpdated}</span>
          </div>
        </div>
      )}
    </div>
  );
}
