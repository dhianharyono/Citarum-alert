'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Droplets,
  RefreshCw,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AWLRStation, FloodReport, CreateReportInput } from '@/types';
import { TelemetryPanel } from '@/components/dashboard/TelemetryPanel';
import { SituationalBriefing } from '@/components/dashboard/SituationalBriefing';
import { CommunityFeed } from '@/components/dashboard/CommunityFeed';
import { ReportFormModal } from '@/components/dashboard/ReportFormModal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

// Dynamic import with SSR disabled for Leaflet container
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[480px] bg-slate-900 border border-slate-800 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-xs">
      Memuat Peta Spasial CitarumAlert...
    </div>
  ),
});

export default function DashboardPage() {
  const [stations, setStations] = useState<AWLRStation[]>([]);
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote'>>({});

  // Muat status voting yang tersimpan di localStorage agar user tidak bisa spam
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('citarum_user_votes');
        if (saved) {
          setUserVotes(JSON.parse(saved));
        }
      } catch (err) {
        console.warn('Could not read user votes from localStorage:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const start = Date.now();
    try {
      const [resStations, resReports] = await Promise.all([
        fetch('/api/stations').then((r) => r.json()),
        fetch('/api/reports').then((r) => r.json()),
      ]);

      if (resStations.success) {
        setStations(resStations.data || []);
      }

      if (resReports.success) {
        setReports(resReports.data || []);
      }

      setLastUpdated(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    } finally {
      // Ensure visible feedback of at least 700ms so user clearly perceives the loading
      const elapsed = Date.now() - start;
      if (elapsed < 700) {
        await new Promise((resolve) => setTimeout(resolve, 700 - elapsed));
      }
      setIsRefreshing(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 2500);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const performFetch = async () => {
      try {
        const [resStations, resReports] = await Promise.all([
          fetch('/api/stations').then((r) => r.json()),
          fetch('/api/reports').then((r) => r.json()),
        ]);

        if (!isCancelled) {
          if (resStations.success) {
            setStations(resStations.data || []);
          }

          if (resReports.success) {
            setReports(resReports.data || []);
          }

          setLastUpdated(
            new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          );
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      }
    };

    const timer = setTimeout(() => {
      void performFetch();
    }, 0);

    const interval = setInterval(() => {
      void performFetch();
    }, 60000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleCreateReport = async (newInput: CreateReportInput) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInput),
    });

    const data = await res.json();
    if (data.success && data.data) {
      setReports((prev) => [data.data, ...prev]);
      setSelectedReport(data.data);
    } else {
      throw new Error(data.error || 'Gagal menyimpan laporan');
    }
  };

  const handleVote = async (id: string, type: 'upvote' | 'downvote') => {
    const currentVote = userVotes[id];
    let action: string;
    let nextVotes: Record<string, 'upvote' | 'downvote'>;

    if (currentVote === type) {
      // User membatalkan vote (unvote)
      action = type === 'upvote' ? 'un-upvote' : 'un-downvote';
      const updated = { ...userVotes };
      delete updated[id];
      nextVotes = updated;

      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (type === 'upvote') {
            return { ...r, upvotes: Math.max(0, r.upvotes - 1) };
          } else {
            return { ...r, downvotes: Math.max(0, (r.downvotes || 0) - 1) };
          }
        })
      );
    } else if (currentVote) {
      // User berpindah vote (misal dari konfirmasi ke surut)
      action = type === 'upvote' ? 'switch-to-upvote' : 'switch-to-downvote';
      nextVotes = { ...userVotes, [id]: type };

      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (type === 'upvote') {
            return {
              ...r,
              upvotes: r.upvotes + 1,
              downvotes: Math.max(0, (r.downvotes || 0) - 1),
            };
          } else {
            return {
              ...r,
              upvotes: Math.max(0, r.upvotes - 1),
              downvotes: (r.downvotes || 0) + 1,
            };
          }
        })
      );
    } else {
      // Vote pertama kali
      action = type;
      nextVotes = { ...userVotes, [id]: type };

      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (type === 'upvote') {
            return { ...r, upvotes: r.upvotes + 1 };
          } else {
            return { ...r, downvotes: (r.downvotes || 0) + 1 };
          }
        })
      );
    }

    setUserVotes(nextVotes);
    try {
      localStorage.setItem('citarum_user_votes', JSON.stringify(nextVotes));
    } catch (err) {
      console.warn('Failed to save vote to localStorage:', err);
    }

    try {
      await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
    } catch (err) {
      console.warn('Vote sync error:', err);
    }
  };

  const handleUpvote = (id: string) => handleVote(id, 'upvote');
  const handleDownvote = (id: string) => handleVote(id, 'downvote');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Floating Toast Alert (Simple & Informatif di Mobile/Desktop) */}
      {showRefreshToast && (
        <Alert
          floating
          position="top-center"
          variant="success"
          onClose={() => setShowRefreshToast(false)}
          autoClose={2500}
          className="justify-between"
        >
          <span className="font-semibold text-emerald-200">
            Data telemetri &amp; laporan warga diperbarui
          </span>
        </Alert>
      )}

      {/* Inline styles for guaranteed smooth 60fps marquee across all browsers */}
      <style>{`
        @keyframes citarumMarquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .citarum-marquee-track {
          display: inline-flex !important;
          white-space: nowrap !important;
          animation: citarumMarquee 54s linear infinite !important;
          will-change: transform;
        }
        .citarum-marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Top Warning Banner / Live Running Text Ticker (Oranye / Amber untuk SIAGA) */}
      <div className="bg-amber-950/85 border-b border-amber-900/70 py-1.5 px-3 flex items-center overflow-hidden relative text-[10px] sm:text-[11px] text-amber-200">
        <div className="flex items-center gap-1.5 shrink-0 bg-amber-950/95 pr-2.5 z-10 font-bold uppercase tracking-wider text-amber-400 border-r border-amber-800/70 shadow-md">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="whitespace-nowrap">Siaga Banjir</span>
        </div>

        <div className="overflow-hidden w-full relative pl-2 flex-1">
          <div className="citarum-marquee-track text-amber-200 font-medium items-center">
            <span>Sungai Citarum Dayeuhkolot: TMA 685 cm (Status SIAGA)</span>
            <span className="mx-3 text-amber-500/80 font-bold select-none">|</span>
            <span>Jembatan Cikeruh: TMA 225 cm (Status AWAS)</span>
            <span className="mx-3 text-amber-500/80 font-bold select-none">|</span>
            <span>Jembatan Bojongsoang: TMA 480 cm (Status SIAGA)</span>
            <span className="mx-3 text-amber-500/80 font-bold select-none">|</span>
            <span>Himbauan: Pengendara motor waspada genangan di koridor Kopo, Dayeuhkolot, Cibaduyut &amp; Baleendah</span>
            <span className="mx-3 text-amber-500/80 font-bold select-none">|</span>
            <span>Pantau debit air resmi dan kirim laporan lapangan terkini melalui tombol Laporkan Banjir</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] text-amber-400/80 shrink-0 bg-amber-950/95 pl-2.5 z-10 border-l border-amber-800/70 shadow-md">
          <Clock className="w-3 h-3 shrink-0 text-amber-400" /> {lastUpdated || 'Baru saja'}
        </div>
      </div>

      {/* Main Header (Responsive on Mobile) */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-white shrink-0">
                CitarumAlert
              </h1>
              <span className="hidden sm:inline-flex bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Kab. Bandung
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              Telemetri Sensor Sungai Resmi & Crowdsourcing Siaga Warga
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Muat ulang data telemetri"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium shrink-0 disabled:opacity-80 shadow-sm cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 ${isRefreshing ? 'animate-spin' : ''
                }`}
            />
            <span className="hidden xs:inline">{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg shadow-blue-600/20 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Laporkan Banjir</span>
            <span className="sm:hidden">Lapor</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column (8 cols): Interactive Spatial Map & Telemetry Dashboard */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Spatial Flood Map */}
          <section>
            <FloodMap
              stations={stations}
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={(rep) => setSelectedReport(rep)}
            />
          </section>

          {/* Telemetry Sensor AWLR Panel */}
          <section>
            <TelemetryPanel stations={stations} />
          </section>

          {/* Buletin Situasi & Pantauan Lapangan Se-Kabupaten Bandung */}
          <section>
            <SituationalBriefing />
          </section>
        </div>

        {/* Right Column (4 cols): Citizen Micro-Report Stream & Report Action */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* Quick Action Card */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <h3 className="font-bold text-xs text-blue-200">Bantu Sesama Komuter</h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Kirim info genangan jalan, akses motor mogok, atau luapan tanggul di sekitar Anda.
              Didukung verifikasi visual Gemini AI.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              Buat Laporan Lapangan
            </Button>
          </div>

          {/* Real-time Community Feed */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <CommunityFeed
              reports={reports}
              userVotes={userVotes}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onSelectReport={(rep) => setSelectedReport(rep)}
            />
          </div>
        </div>
      </main>

      {/* Report Form Modal with GPS & AI Verification */}
      <ReportFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>
          CitarumAlert Platform • Integrasi Data Hidrologi BBWS Citarum, BPBD Kab. Bandung &amp; Partisipasi Warga.
        </p>
      </footer>
    </div>
  );
}
