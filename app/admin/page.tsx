'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Trash2,
  ExternalLink,
  RefreshCw,
  KeyRound,
  Sparkles,
  AlertTriangle,
  Search,
  Loader2,
  CheckCircle2,
  Radio,
  Layers,
  Clock,
  Eye,
  EyeOff,
  Video,
  MapPin,
} from 'lucide-react';
import { FloodReport } from '@/types';
import { FALLBACK_AWLR_STATIONS } from '@/lib/scraper';

interface ConfigState {
  geminiConfigured: boolean;
  geminiKeyMasked: string;
  hasKey: boolean;
  model: string;
  status: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'settings'>('overview');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Reports state
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);

  // Config & LLM state
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [inputApiKey, setInputApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Action status
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Check auth
  const verifyAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/login');
      const data = await res.json();
      if (!data.authenticated) {
        router.replace('/admin/login');
      } else {
        setIsAuthChecking(false);
      }
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void verifyAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, [verifyAuth]);

  // Load reports
  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReports(data.data);
      }
    } catch (err) {
      console.error('Failed to load reports for admin:', err);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  // Load config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecking) {
      const timer = setTimeout(() => {
        void fetchReports();
        void fetchConfig();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthChecking, fetchReports, fetchConfig]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.replace('/admin/login');
    } catch {
      router.replace('/admin/login');
    }
  };

  // Handle Delete Report
  const handleDeleteReport = async (id: string) => {
    if (!confirm(`Konfirmasi: Apakah Anda yakin ingin menghapus laporan #${id}? Laporan hoax/spam akan dihapus dari peta publik.`)) {
      return;
    }

    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/reports?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.message || 'Gagal menghapus laporan.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Bulk Cleanup (> 7 Days)
  const handleCleanupOldReports = async () => {
    if (
      !confirm(
        'Pembersihan Otomatis: Apakah Anda yakin ingin menghapus laporan yang usianya lebih dari 7 hari? Foto bukti terkait di Vercel Blob juga akan dihapus agar kuota penyimpanan tetap hemat.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reports?olderThanDays=7', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchReports();
      } else {
        alert(data.message || 'Gagal membersihkan data.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Handle Toggle Verification
  const handleToggleVerify = async (report: FloodReport) => {
    const newStatus = !report.isAiVerified;
    setActionInProgress(`verify-${report.id}`);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, isAiVerified: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, isAiVerified: newStatus } : r))
        );
      }
    } catch {
      alert('Gagal mengubah status verifikasi.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Save API Key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputApiKey.trim()) return;

    setIsSavingKey(true);
    setSaveMessage(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: inputApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: 'success', text: data.message });
        setInputApiKey('');
        fetchConfig();
      } else {
        setSaveMessage({ type: 'error', text: data.message || 'Gagal menyimpan kunci.' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Kesalahan jaringan saat menyimpan API key.' });
    } finally {
      setIsSavingKey(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputApiKey.trim() || undefined }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
        latency: data.details?.latencyMs,
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Tidak dapat menjangkau endpoint tes Gemini AI.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (filterTodayOnly) {
      if (r.createdAtIso) {
        const d = new Date(r.createdAtIso);
        const now = new Date();
        const isToday =
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate();
        if (!isToday) return false;
      }
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.district.toLowerCase().includes(q) ||
      r.caption.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q)
    );
  });

  const todayReportsCount = reports.filter((r) => {
    if (!r.createdAtIso) return true;
    const d = new Date(r.createdAtIso);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;

  const verifiedCount = reports.filter((r) => r.isAiVerified).length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Memverifikasi sesi administrator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">Citarum Alert</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pusat Pengawasan Data & Konfigurasi AI Bencana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700/60"
            >
              <span>Buka Peta Publik</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 transition-colors border border-rose-500/30"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan & Telemetri</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Kelola Laporan Warga ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan LLM & Sistem</span>
            {config?.hasKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Laporan Hari Ini</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{todayReportsCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Aktif di feed publik</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Total Laporan Masuk</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{reports.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Sepanjang waktu</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Terverifikasi AI / Admin</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{verifiedCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Gemini Vision AI</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Sensor AWLR BBWS</span>
                  <Radio className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">{FALLBACK_AWLR_STATIONS.length} Pos</div>
                <div className="text-[11px] text-slate-500 mt-1">Sinkron tiap 5 menit</div>
              </div>
            </div>

            {/* River Stations Telemetry Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Status Pos Duga Air Citarum Hulu</h3>
                </div>
                <span className="text-xs text-slate-400">{FALLBACK_AWLR_STATIONS.length} Stasiun Resmi BBWS</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2.5">Stasiun</th>
                      <th className="pb-2.5">Sungai / Sub DAS</th>
                      <th className="pb-2.5">TMA (Ketinggian)</th>
                      <th className="pb-2.5">Batas Siaga / Awas</th>
                      <th className="pb-2.5">Status Siaga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {FALLBACK_AWLR_STATIONS.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-medium text-slate-200">{st.name}</td>
                        <td className="py-2.5 text-slate-400">{st.river}</td>
                        <td className="py-2.5 font-mono text-slate-300">
                          {st.levelCm} cm
                        </td>
                        <td className="py-2.5 text-slate-500 font-mono">
                          {st.alertThresholdCm} cm / {st.dangerThresholdCm} cm
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.status === 'AWAS'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : st.status === 'SIAGA'
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                  : st.status === 'WASPADA'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REPORTS MANAGEMENT */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter toolbar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari kecamatan, nama pelapor, atau teks laporan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTodayOnly(!filterTodayOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors shrink-0 ${filterTodayOnly
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {filterTodayOnly ? '✓ Hanya Hari Ini' : 'Tampilkan Semua Hari'}
                </button>

                <button
                  onClick={handleCleanupOldReports}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 hover:border-rose-700/60 transition-colors flex items-center gap-1.5 shrink-0"
                  title="Hapus data laporan yang lebih dari 7 hari beserta foto di Blob Storage untuk hemat kuota"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Bersihkan &gt; 7 Hari
                </button>

                <button
                  onClick={fetchReports}
                  disabled={isLoadingReports}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Muat ulang laporan"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingReports ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">Belum ada laporan yang cocok.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Laporan warga baru yang dikirimkan via form akan tampil di sini secara real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-white">{report.author}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-blue-400 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {report.district}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {report.createdAtIso
                            ? new Date(report.createdAtIso).toLocaleString('id-ID')
                            : report.createdAt}
                        </span>

                        {report.isAiVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                            Menunggu Verifikasi
                          </span>
                        )}
                      </div>

                      {/* Caption text */}
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">
                        {report.caption}
                      </p>

                      {/* Evidence / Multimedia */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-300 font-medium">
                          {report.depthCategory}
                        </span>

                        {report.tiktokLiveUrl && (
                          <a
                            href={report.tiktokLiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-rose-400" />
                            <span>Live TikTok</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        )}

                        {report.imageUrl && (
                          <a
                            href={report.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Foto Bukti</span>
                          </a>
                        )}

                        <span className="text-[11px] text-slate-500 font-mono">
                          GPS: {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                      <button
                        onClick={() => handleToggleVerify(report)}
                        disabled={actionInProgress === `verify-${report.id}`}
                        className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${report.isAiVerified
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                      >
                        {report.isAiVerified ? 'Batalkan Verifikasi' : 'Verifikasi Manual'}
                      </button>

                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={actionInProgress === report.id}
                        className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Laporan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS & LLM KEY CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6 animate-in fade-in">
            {/* LLM Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Konfigurasi Google Gemini Vision API Key</h3>
                  <p className="text-xs text-slate-400">
                    Kunci ini digunakan untuk verifikasi citra genangan air secara otomatis dengan model{' '}
                    <code className="text-blue-300">gemini-2.5-flash</code>.
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-5">
                <div className="text-xs">
                  <span className="text-slate-400">Status Kunci Saat Ini: </span>
                  <span className="font-semibold text-white ml-1">
                    {config?.geminiKeyMasked || 'Belum Dikonfigurasi'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {config?.hasKey ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Belum Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback messages */}
              {saveMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${saveMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveMessage.text}</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`mb-4 p-3.5 rounded-xl border text-xs ${testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Masukkan / Perbarui Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="Contoh: AIzaSyD..."
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      className="w-full pr-10 pl-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    API Key langsung aktif tanpa perlu merestart server Next.js.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingKey || !inputApiKey.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    {isSavingKey ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Simpan API Key</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingKey}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-700"
                  >
                    {isTestingKey ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menguji ke Google AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Uji Koneksi Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Guide Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2.5">
              <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <span>Cara Mendapatkan Gemini API Key Gratis:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-300">
                <li>
                  Buka konsol Google AI Studio di{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline inline-flex items-center gap-0.5 hover:text-blue-300"
                  >
                    aistudio.google.com/app/apikey
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Login menggunakan Akun Google Anda.</li>
                <li>Klik tombol <strong>Create API key</strong> dan pilih proyek Anda.</li>
                <li>Salin string API key yang diawali dengan <code>AIzaSy...</code></li>
                <li>Tempelkan pada formulir di atas lalu klik <strong>Simpan API Key</strong> & <strong>Uji Koneksi Gemini</strong>.</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
