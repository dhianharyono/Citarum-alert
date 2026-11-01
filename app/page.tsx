'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, Plus } from 'lucide-react';
import { AWLRStation, FloodReport, CreateReportInput } from '@/types';
import { FigmaNavbar } from '@/components/dashboard/FigmaNavbar';
import { FigmaSummaryBar } from '@/components/dashboard/FigmaSummaryBar';
import { FigmaSensorPanel } from '@/components/dashboard/FigmaSensorPanel';
import { FigmaBulletin } from '@/components/dashboard/FigmaBulletin';
import { FigmaCitizenPanel } from '@/components/dashboard/FigmaCitizenPanel';
import { FigmaBulletinFullPage } from '@/components/dashboard/FigmaBulletinFullPage';
import { FigmaCitizenFullPage } from '@/components/dashboard/FigmaCitizenFullPage';
import { FigmaFooter } from '@/components/dashboard/FigmaFooter';
import { ReportFormModal } from '@/components/dashboard/ReportFormModal';
import { Alert } from '@/components/ui/Alert';

// Dynamic import with SSR disabled for Leaflet container
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[462px] bg-white border border-[#dce2e2] rounded-md animate-pulse flex items-center justify-center text-[#66757c] text-xs">
      Memuat Peta Spasial Citarum Alert...
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
  const [activeTab, setActiveTab] = useState<'pemantauan' | 'buletin' | 'laporan'>('pemantauan');

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

  const handleTabChange = (tab: 'pemantauan' | 'buletin' | 'laporan') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f5] text-[#173744] flex flex-col font-sans selection:bg-[#126b70] selection:text-white">
      {/* Global Floating Toast Alert */}
      {showRefreshToast && (
        <Alert
          floating
          position="top-center"
          variant="success"
          onClose={() => setShowRefreshToast(false)}
          autoClose={2500}
          className="justify-between"
        >
          <span className="font-semibold text-[#497665]">
            Data telemetri &amp; laporan warga diperbarui
          </span>
        </Alert>
      )}

      {/* Navbar matching Figma 1:1 */}
      <FigmaNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenReportModal={() => setIsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-7 space-y-6">
        {/* VIEW 1: TAB PEMANTAUAN (Dashboard Frame 3:1621 & Frame 3:11243) */}
        {activeTab === 'pemantauan' && (
          <>
            {/* DESKTOP DASHBOARD (Figma Frame 3:1621, 1440px wide) */}
            <div className="hidden md:flex flex-col gap-3.5 sm:gap-4">
              <FigmaSummaryBar
                stations={stations}
                isRefreshing={isRefreshing}
                onRefresh={handleManualRefresh}
                lastUpdated={lastUpdated}
              />

              {/* Row 1: Map (Left) + River Sensors (Right) */}
              <div className="grid grid-cols-12 gap-5 md:h-[560px] items-stretch">
                <div className="col-span-8 h-full flex flex-col">
                  <FloodMap
                    stations={stations}
                    reports={reports}
                    selectedReport={selectedReport}
                    onSelectReport={(rep) => setSelectedReport(rep)}
                  />
                </div>

                <div className="col-span-4 h-full flex flex-col">
                  <FigmaSensorPanel stations={stations} />
                </div>
              </div>

              {/* Row 2: Bulletin (Left) + Citizen Panel (Right) */}
              <div className="grid grid-cols-12 gap-5 items-start pt-1">
                <div className="col-span-8">
                  <FigmaBulletin lastUpdated={lastUpdated} />
                </div>

                <div className="col-span-4">
                  <FigmaCitizenPanel
                    reports={reports}
                    userVotes={userVotes}
                    onUpvote={handleUpvote}
                    onDownvote={handleDownvote}
                    onOpenReportModal={() => setIsModalOpen(true)}
                    onSelectReport={(rep) => setSelectedReport(rep)}
                  />
                </div>
              </div>
            </div>

            {/* MOBILE DASHBOARD (Figma Frame 3:11243, 412px wide) */}
            <div className="flex md:hidden flex-col gap-3.5">
              <FigmaSummaryBar
                stations={stations}
                isRefreshing={isRefreshing}
                onRefresh={handleManualRefresh}
                lastUpdated={lastUpdated}
              />

              <div className="w-full">
                <FloodMap
                  stations={stations}
                  reports={reports}
                  selectedReport={selectedReport}
                  onSelectReport={(rep) => setSelectedReport(rep)}
                />
              </div>

              <div className="w-full">
                <FigmaSensorPanel stations={stations} />
              </div>

              {/* Quick Navigation Cards */}
              <div className="w-full bg-white border border-[#dce2e2] rounded-md divide-y divide-[#dce2e2] shadow-xs overflow-hidden">
                <button
                  onClick={() => handleTabChange('buletin')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f8faf9] transition-colors cursor-pointer group"
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-[#173744]">
                      Buletin wilayah
                    </h3>
                    <p className="text-xs text-[#66757c] mt-0.5">
                      Ringkasan 4 wilayah • {lastUpdated || '1 Nov 2026'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#66757c] group-hover:text-[#126b70] transition-colors" />
                </button>

                <button
                  onClick={() => handleTabChange('laporan')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f8faf9] transition-colors cursor-pointer group"
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-[#173744]">
                      Laporan warga
                    </h3>
                    <p className="text-xs text-[#66757c] mt-0.5">
                      {reports.length} laporan • informasi komunitas
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#66757c] group-hover:text-[#126b70] transition-colors" />
                </button>
              </div>

              {/* Mobile CTA */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-11 bg-[#126b70] hover:bg-[#0e5458] text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Laporkan Banjir</span>
              </button>
            </div>
          </>
        )}

        {/* VIEW 2: TAB BULETIN WILAYAH (Full Page Frame 3:11384 & Frame 3:11500) */}
        {activeTab === 'buletin' && (
          <FigmaBulletinFullPage
            lastUpdated={lastUpdated}
            onOpenReportModal={() => setIsModalOpen(true)}
          />
        )}

        {/* VIEW 3: TAB LAPORAN WARGA (Full Page Frame 3:11612 & Frame 3:11691) */}
        {activeTab === 'laporan' && (
          <FigmaCitizenFullPage
            reports={reports}
            userVotes={userVotes}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onOpenReportModal={() => setIsModalOpen(true)}
            onSelectReport={(rep) => setSelectedReport(rep)}
            lastUpdated={lastUpdated}
          />
        )}
      </main>

      {/* Footer matching Figma */}
      <FigmaFooter />

      {/* Report Form Modal (Frame 3:10759 Desktop 920px & Frame 3:11142 Mobile) */}
      <ReportFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
