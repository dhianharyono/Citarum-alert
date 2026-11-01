'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  LogOut,
  RefreshCw,
  KeyRound,
  Trash2,
  Check,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Video,
  MapPin,
  Camera,
  X,
  Info,
  Plug,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { FloodReport, AWLRStation } from '@/types';
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

  // Telemetry Stations
  const [stations, setStations] = useState<AWLRStation[]>(FALLBACK_AWLR_STATIONS);

  // Reports state
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Config & LLM state
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [inputApiKey, setInputApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Action status tracker
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Reference time stored in state to ensure pure, idempotent renders (React 19 / Compiler compliant)
  const [nowTimestamp, setNowTimestamp] = useState<number>(0);
  const [todayDateKey, setTodayDateKey] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setNowTimestamp(now.getTime());
    setTodayDateKey(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  }, []);

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

  // Load telemetry stations
  const fetchStations = useCallback(async () => {
    try {
      const res = await fetch('/api/stations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setStations(data.data);
      }
    } catch {
      // Keep fallback
    }
  }, []);

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
        void fetchStations();
        void fetchReports();
        void fetchConfig();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthChecking, fetchStations, fetchReports, fetchConfig]);

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
    if (!confirm(`Konfirmasi: Apakah Anda yakin ingin menghapus laporan #${id}? Laporan akan dihapus dari sistem dan feed publik.`)) {
      return;
    }

    setActionInProgress(`delete-${id}`);
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
        'Pembersihan Otomatis: Apakah Anda yakin ingin menghapus seluruh laporan yang usianya lebih dari 7 hari? Foto bukti terkait di cloud storage juga akan dibersihkan.'
      )
    ) {
      return;
    }

    setActionInProgress('cleanup');
    try {
      const res = await fetch('/api/admin/reports?olderThanDays=7', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Pembersihan selesai.');
        fetchReports();
      } else {
        alert(data.message || 'Gagal membersihkan data.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionInProgress(null);
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
        body: JSON.stringify({ geminiApiKey: inputApiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: 'success', text: data.message || 'API key berhasil disimpan.' });
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

  // Filtered reports logic (pure, without inline Date.now or new Date calls)
  const filteredReports = reports.filter((r) => {
    if (dateFilter === 'today' && r.createdAtIso && todayDateKey) {
      const d = new Date(r.createdAtIso);
      const itemKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (itemKey !== todayDateKey) return false;
    } else if (dateFilter === '7days' && r.createdAtIso && nowTimestamp > 0) {
      const d = new Date(r.createdAtIso);
      const diffDays = (nowTimestamp - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.district.toLowerCase().includes(q) ||
      r.caption.toLowerCase().includes(q) ||
      (r.author && r.author.toLowerCase().includes(q))
    );
  });

  const todayReportsCount = reports.filter((r) => {
    if (!r.createdAtIso || !todayDateKey) return false;
    const d = new Date(r.createdAtIso);
    const itemKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return itemKey === todayDateKey;
  }).length;

  const verifiedCount = reports.filter((r) => r.isAiVerified).length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#f5f6f5] flex items-center justify-center text-[#66757c]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#126b70]" />
          <span className="text-sm font-semibold">Memverifikasi sesi administrator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f5] text-[#173744] flex flex-col font-sans selection:bg-[#126b70] selection:text-white">
      {/* ============================================================== */}
      {/* NAVBAR ADMIN (Figma Frame 15:4422 Navigasi admin 1440x152) */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#dce2e2] shadow-2xs">
        {/* Top Header Row */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#173744] flex items-center justify-center shrink-0 shadow-xs">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M2 6c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 12c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 18c3-3 5-3 8 0s5 3 8 0 5-3 8 0"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl leading-tight text-[#172d3b] tracking-tight">
                Citarum Alert
              </span>
              <span className="text-[10px] tracking-widest text-[#66757c] font-semibold uppercase">
                ADMIN PANEL
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3 sm:px-4 rounded bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] flex items-center gap-1.5 shadow-2xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#172d3b]" />
              <span className="hidden sm:inline">Buka Peta Publik</span>
              <span className="sm:hidden">Peta</span>
            </Link>

            <button
              onClick={handleLogout}
              className="h-10 px-3 sm:px-4 rounded bg-white hover:bg-[#fbeeeb] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] hover:text-[#b33e35] flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 border-t border-[#dce2e2]">
          <nav className="flex items-center gap-6 sm:gap-8 h-14 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`h-full text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#126b70] text-[#126b70]'
                  : 'border-transparent text-[#66757c] hover:text-[#172d3b]'
              }`}
            >
              <span>Ringkasan &amp; Telemetri</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`h-full text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'border-[#126b70] text-[#126b70]'
                  : 'border-transparent text-[#66757c] hover:text-[#172d3b]'
              }`}
            >
              <span>Kelola Laporan Warga</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'reports'
                    ? 'bg-[#126b70] text-white'
                    : 'bg-[#edf0e9] text-[#66757c]'
                }`}
              >
                {reports.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`h-full text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#126b70] text-[#126b70]'
                  : 'border-transparent text-[#66757c] hover:text-[#172d3b]'
              }`}
            >
              <span>Pengaturan LLM &amp; Sistem</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN ADMIN CONTENT CONTAINER */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: RINGKASAN & TELEMETRI (Desktop 15:4422 & Mobile 15:4543) */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-[#66757c] uppercase block">
                PUSAT PENGAWASAN
              </span>
              <h1 className="text-2xl sm:text-[32px] font-bold text-[#172d3b] tracking-tight">
                Ringkasan &amp; Telemetri
              </h1>
              <p className="text-xs sm:text-sm text-[#66757c]">
                Pantau laporan masuk dan pembacaan tinggi muka air Citarum Hulu.
              </p>
            </div>

            {/* Stat Cards (Ringkasan aktivitas Frame 15:4422 1360x145) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-[#dce2e2] rounded-md divide-y lg:divide-y-0 lg:divide-x divide-[#dce2e2] shadow-xs overflow-hidden">
              {/* Stat 1 */}
              <div className="p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#66757c]">
                  Laporan Hari Ini
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#172d3b] my-2">
                  {todayReportsCount}
                </div>
                <span className="text-[11px] text-[#66757c]">
                  Aktif di feed publik
                </span>
              </div>

              {/* Stat 2 */}
              <div className="p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#66757c]">
                  Total Laporan Masuk
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#172d3b] my-2">
                  {reports.length}
                </div>
                <span className="text-[11px] text-[#66757c]">
                  Sepanjang waktu
                </span>
              </div>

              {/* Stat 3 */}
              <div className="p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#66757c]">
                  Terverifikasi AI / Admin
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#172d3b] my-2">
                  {verifiedCount}
                </div>
                <span className="text-[11px] text-[#66757c]">
                  Gemini Vision AI
                </span>
              </div>

              {/* Stat 4 */}
              <div className="p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#66757c]">
                  Sensor AWLR BBWS
                </span>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[#172d3b]">
                    {stations.length}
                  </span>
                  <span className="text-xs font-semibold text-[#66757c]">pos</span>
                </div>
                <span className="text-[11px] text-[#66757c]">
                  Sinkron tiap 5 menit
                </span>
              </div>
            </div>

            {/* Table Telemetry (Status pos duga air Frame 15:4422 1360x589) */}
            <div className="bg-white border border-[#dce2e2] rounded-md shadow-xs overflow-hidden">
              {/* Table Header */}
              <div className="p-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dce2e2]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#172d3b]">
                    Status Pos Duga Air Citarum Hulu
                  </h2>
                  <p className="text-xs text-[#66757c] mt-0.5">
                    Sensor AWLR BBWS · Sinkron setiap 5 menit
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#66757c] bg-[#f8faf9] px-3 py-1 rounded border border-[#dce2e2] self-start sm:self-auto">
                  {stations.length} Stasiun Resmi BBWS
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f5f6f5] border-b border-[#dce2e2] text-[#66757c] font-semibold">
                    <tr>
                      <th className="py-3 px-6">Stasiun</th>
                      <th className="py-3 px-6">Sungai / Sub DAS</th>
                      <th className="py-3 px-6">TMA (Ketinggian)</th>
                      <th className="py-3 px-6">Batas Siaga / Awas</th>
                      <th className="py-3 px-6 text-right">Status Siaga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dce2e2] text-[#172d3b]">
                    {stations.map((st) => {
                      const isAwas = st.status === 'AWAS';
                      const isSiaga = st.status === 'SIAGA';
                      const isWaspada = st.status === 'WASPADA';

                      const badgeStyle = isAwas
                        ? 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]'
                        : isSiaga
                        ? 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]'
                        : isWaspada
                        ? 'bg-[#f7f2df] text-[#866a20] border-[#fde8a0]'
                        : 'bg-[#edf4f0] text-[#497665] border-[#c3e6cb]';

                      return (
                        <tr key={st.id} className="hover:bg-[#fbfcfb] transition-colors">
                          <td className="py-3.5 px-6 font-semibold">{st.name}</td>
                          <td className="py-3.5 px-6 text-[#66757c]">{st.river}</td>
                          <td className="py-3.5 px-6 font-mono font-bold text-sm">
                            {st.levelCm} cm
                          </td>
                          <td className="py-3.5 px-6 text-[#66757c] font-mono">
                            {st.warningThresholdCm} cm / {st.dangerThresholdCm} cm
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${badgeStyle}`}
                            >
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-[#dce2e2]">
                {stations.map((st) => {
                  const isAwas = st.status === 'AWAS';
                  const isSiaga = st.status === 'SIAGA';
                  const isWaspada = st.status === 'WASPADA';

                  const badgeStyle = isAwas
                    ? 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]'
                    : isSiaga
                    ? 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]'
                    : isWaspada
                    ? 'bg-[#f7f2df] text-[#866a20] border-[#fde8a0]'
                    : 'bg-[#edf4f0] text-[#497665] border-[#c3e6cb]';

                  return (
                    <div key={st.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-[#172d3b]">{st.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}
                        >
                          {st.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#66757c]">{st.river}</div>
                      <div className="flex items-baseline justify-between pt-1 text-xs">
                        <div>
                          <span className="text-[#66757c]">TMA: </span>
                          <span className="font-mono font-bold text-base text-[#172d3b]">
                            {st.levelCm} cm
                          </span>
                        </div>
                        <div className="text-[11px] text-[#66757c] font-mono">
                          Batas: {st.warningThresholdCm} / {st.dangerThresholdCm} cm
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Context Note (Konteks pratinjau Frame 15:4422) */}
            <div className="flex items-center gap-2 text-xs text-[#66757c] px-1">
              <Info className="w-4 h-4 text-[#126b70] shrink-0" />
              <span>
                Pratinjau data · Pembacaan dan status mengikuti cuplikan sumber, bukan telemetri langsung yang terverifikasi.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: KELOLA LAPORAN WARGA (Desktop 15:4731 & Mobile 15:4824) */}
        {/* ============================================================ */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-[#66757c] uppercase block">
                PUSAT PENGAWASAN
              </span>
              <h1 className="text-2xl sm:text-[32px] font-bold text-[#172d3b] tracking-tight">
                Kelola Laporan Warga
              </h1>
              <p className="text-xs sm:text-sm text-[#66757c]">
                Tinjau laporan lapangan dan lakukan verifikasi secara manual.
              </p>
            </div>

            {/* Search and Filters Bar (Frame 15:4731 Pencarian dan filter 1360x78) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Box */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-[#66757c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kecamatan, nama pelapor, atau teks laporan…"
                  className="w-full h-11 pl-10 pr-4 text-xs bg-white border border-[#dce2e2] rounded focus:outline-none focus:border-[#126b70] text-[#172d3b] placeholder:text-[#66757c] shadow-2xs transition"
                />
              </div>

              {/* Date Filter Dropdown */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | '7days')}
                className="h-11 px-3.5 bg-white border border-[#dce2e2] rounded text-xs font-semibold text-[#172d3b] focus:outline-none focus:border-[#126b70] shadow-2xs cursor-pointer"
              >
                <option value="all">Tampilkan Semua Hari</option>
                <option value="today">Hari Ini Saja</option>
                <option value="7days">7 Hari Terakhir</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchReports}
                disabled={isLoadingReports}
                className="h-11 px-4 bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] rounded text-xs font-semibold text-[#172d3b] flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#126b70] ${
                    isLoadingReports ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {/* Result Counter (Hasil pencarian Frame 15:4731) */}
            <div className="flex items-center justify-between text-xs text-[#66757c] px-1">
              <span className="font-bold text-[#172d3b]">
                {filteredReports.length} laporan masuk
              </span>
              <span>
                Menampilkan {filteredReports.length} dari {reports.length} laporan
              </span>
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && (
              <div className="bg-white border border-[#dce2e2] rounded-md p-10 text-center space-y-2">
                <p className="text-sm font-semibold text-[#172d3b]">
                  Tidak ada laporan yang sesuai dengan kriteria filter.
                </p>
                <p className="text-xs text-[#66757c]">
                  Coba ubah kata kunci pencarian atau pilih &ldquo;Tampilkan Semua Hari&rdquo;.
                </p>
              </div>
            )}

            {/* Report Cards List (Laporan dan tindakan Frame 15:4731 1360x467) */}
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const isVerified = report.isAiVerified;
                const dateDisplay = report.createdAtIso
                  ? new Date(report.createdAtIso).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Waktu tidak tersedia';

                return (
                  <div
                    key={report.id}
                    className="bg-white border border-[#dce2e2] rounded-md shadow-xs p-5 sm:p-6 flex flex-col lg:flex-row items-start justify-between gap-6"
                  >
                    {/* Left: Report Details */}
                    <div className="flex-1 space-y-3.5 w-full">
                      {/* Top Meta Row */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold border tracking-wide uppercase ${
                            isVerified
                              ? 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]'
                              : 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]'
                          }`}
                        >
                          {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-[#66757c]">
                          <MapPin className="w-3.5 h-3.5 text-[#126b70]" />
                          <span className="font-semibold text-[#172d3b]">{report.district}</span>
                        </div>

                        <span className="text-xs text-[#66757c]">• {dateDisplay}</span>
                      </div>

                      {/* Reporter Name */}
                      <div className="font-bold text-lg text-[#172d3b]">
                        {report.author || 'Warga Anonim'}
                      </div>

                      {/* Citizen Text Report */}
                      <div className="p-3 bg-[#f8faf9] border border-[#dce2e2] rounded space-y-1">
                        <span className="text-[10px] font-bold text-[#66757c] uppercase tracking-wider block">
                          KETERANGAN WARGA
                        </span>
                        <p className="text-sm text-[#172d3b] leading-relaxed">
                          {report.caption}
                        </p>
                      </div>

                      {/* Detail Metrics Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#66757c]">
                        <div>
                          <span className="text-[#66757c]">Kedalaman: </span>
                          <span className="font-semibold text-[#172d3b]">
                            {report.depthCategory}
                          </span>
                        </div>

                        {report.lat && report.lng && (
                          <div>
                            <span className="text-[#66757c]">GPS: </span>
                            <span className="font-mono text-[#172d3b]">
                              {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Evidence Buttons Row */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        {report.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(report.imageUrl || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] shadow-2xs transition cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#126b70]" />
                            <span>Lihat Foto Lapangan</span>
                          </button>
                        )}

                        {report.tiktokLiveUrl && (
                          <a
                            href={report.tiktokLiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] shadow-2xs transition cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-[#b33e35]" />
                            <span>Pantau Live TikTok</span>
                            <ExternalLink className="w-3 h-3 text-[#66757c]" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions Panel (Tindakan admin Frame 15:4731 302x307) */}
                    <div className="w-full lg:w-[300px] bg-[#f5f6f5] border border-[#dce2e2] rounded-md p-4 space-y-4 shrink-0">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-[#172d3b] block">
                          Tinjau laporan
                        </span>
                        <p className="text-xs text-[#66757c] leading-relaxed">
                          Periksa isi laporan dan rujukan warga sebelum melakukan verifikasi.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVerify(report)}
                          disabled={actionInProgress === `verify-${report.id}`}
                          className={`w-full h-10 px-4 rounded text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                            isVerified
                              ? 'bg-white hover:bg-slate-50 border border-[#dce2e2] text-[#172d3b]'
                              : 'bg-[#126b70] hover:bg-[#0e5458] text-white shadow-xs'
                          }`}
                        >
                          {actionInProgress === `verify-${report.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isVerified ? 'Batalkan Verifikasi' : 'Verifikasi Manual'}
                          </span>
                        </button>

                        <div className="pt-2 border-t border-[#dce2e2]">
                          <p className="text-[11px] text-[#66757c] mb-2 leading-tight">
                            Penghapusan terpisah dari proses verifikasi.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={actionInProgress === `delete-${report.id}`}
                            className="w-full h-10 px-4 rounded bg-white hover:bg-[#fbeeeb] border border-[#dce2e2] text-xs font-semibold text-[#b33e35] flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            {actionInProgress === `delete-${report.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-[#b33e35]" />
                            )}
                            <span>Hapus Laporan</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Archive Maintenance Bar (Pemeliharaan arsip Frame 15:4731 1360x68) */}
            <div className="p-4 sm:p-5 bg-white border border-[#dce2e2] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#172d3b]">
                  Pemeliharaan laporan
                </h3>
                <p className="text-xs text-[#66757c] mt-0.5">
                  Hapus laporan berusia lebih dari 7 hari.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCleanupOldReports}
                disabled={actionInProgress === 'cleanup'}
                className="h-10 px-4 bg-white hover:bg-[#fbeeeb] border border-[#dce2e2] rounded text-xs font-semibold text-[#b33e35] flex items-center gap-2 shadow-2xs transition cursor-pointer"
              >
                {actionInProgress === 'cleanup' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-[#b33e35]" />
                )}
                <span>Bersihkan &gt;7 Hari</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PENGATURAN LLM & SISTEM (Desktop 15:4921 & Mobile 15:5034) */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-[#66757c] uppercase block">
                PUSAT PENGAWASAN
              </span>
              <h1 className="text-2xl sm:text-[32px] font-bold text-[#172d3b] tracking-tight">
                Pengaturan LLM &amp; Sistem
              </h1>
              <p className="text-xs sm:text-sm text-[#66757c]">
                Kelola kredensial layanan analisis foto genangan air.
              </p>
            </div>

            {/* 2-Column Grid: Left Configuration & Right Step Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Konfigurasi Gemini Vision Frame 15:4921 768x574) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-[#dce2e2] rounded-md shadow-xs p-6 space-y-6">
                  {/* Card Header */}
                  <div className="pb-4 border-b border-[#dce2e2] space-y-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#126b70]" />
                      <h2 className="text-base sm:text-lg font-bold text-[#172d3b]">
                        Konfigurasi Google Gemini Vision API Key
                      </h2>
                    </div>
                    <p className="text-xs text-[#66757c] leading-relaxed">
                      Kunci ini digunakan untuk analisis foto genangan air secara otomatis.
                    </p>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f5f6f5] border border-[#dce2e2] text-xs">
                      <span className="text-[#66757c]">Model:</span>
                      <span className="font-mono font-semibold text-[#172d3b]">
                        gemini-2.5-flash
                      </span>
                    </div>
                  </div>

                  {/* Status Kunci Saat Ini Box */}
                  <div className="p-4 bg-[#f8faf9] border border-[#dce2e2] rounded space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#172d3b]">
                      <span>Status Kunci Saat Ini</span>
                      <Lock className="w-3.5 h-3.5 text-[#66757c]" />
                    </div>
                    <div className="font-mono text-base font-bold text-[#172d3b] tracking-wider">
                      {config?.geminiKeyMasked || '••••••••••••••••'}
                    </div>
                    <div className="text-xs font-semibold text-[#126b70] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#126b70]" />
                      <span>{config?.hasKey ? 'Kunci tersimpan' : 'Belum dikonfigurasi'}</span>
                    </div>
                  </div>

                  {/* Form Update Key */}
                  <form onSubmit={handleSaveApiKey} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#172d3b] block">
                        Masukkan / Perbarui Gemini API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={inputApiKey}
                          onChange={(e) => setInputApiKey(e.target.value)}
                          placeholder="Masukkan API key baru"
                          className="w-full h-11 px-3.5 pr-10 text-xs bg-white border border-[#dce2e2] rounded focus:outline-none focus:border-[#126b70] text-[#172d3b] placeholder:text-[#66757c] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#66757c] hover:text-[#172d3b] cursor-pointer"
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#66757c] leading-relaxed">
                        API key diterapkan setelah disimpan, tanpa perlu memulai ulang server Next.js.
                      </p>
                    </div>

                    {/* Messages */}
                    {saveMessage && (
                      <div
                        className={`p-3 rounded text-xs flex items-start gap-2 ${
                          saveMessage.type === 'success'
                            ? 'bg-[#eaf3f1] border border-[#c3e6cb] text-[#497665]'
                            : 'bg-[#fbeeeb] border border-[#f5c6cb] text-[#b33e35]'
                        }`}
                      >
                        {saveMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <span>{saveMessage.text}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSavingKey || !inputApiKey.trim()}
                        className="h-10 px-4 bg-[#126b70] hover:bg-[#0e5458] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingKey ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Simpan API Key</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingKey}
                        className="h-10 px-4 bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] rounded shadow-2xs flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                      >
                        {isTestingKey ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#126b70]" />
                        ) : (
                          <Plug className="w-3.5 h-3.5 text-[#126b70]" />
                        )}
                        <span>Uji Koneksi Gemini</span>
                      </button>
                    </div>

                    {/* Test Result Info Box */}
                    {testResult ? (
                      <div
                        className={`p-3.5 rounded border text-xs flex items-start gap-2.5 animate-in fade-in ${
                          testResult.success
                            ? 'bg-[#eaf3f1] border-[#c3e6cb] text-[#497665]'
                            : 'bg-[#fbeeeb] border-[#f5c6cb] text-[#b33e35]'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold">{testResult.message}</div>
                          {testResult.latency !== undefined && (
                            <div className="text-[11px] mt-0.5 opacity-80">
                              Waktu respon: {testResult.latency} ms
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-[#66757c] pt-1">
                        <Info className="w-3.5 h-3.5 text-[#66757c] shrink-0" />
                        <span>
                          Belum diuji pada sesi ini. Kunci tersimpan belum memastikan koneksi runtime tersedia.
                        </span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Disclaimer Alert Box */}
                <div className="p-4 bg-[#eaf3f1] border border-[#c3e6cb] rounded-md flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#126b70] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#173744] leading-relaxed">
                    Analisis otomatis membantu peninjauan foto. Hasilnya bukan verifikasi resmi BPBD dan tidak menggantikan pemeriksaan admin.
                  </p>
                </div>
              </div>

              {/* Right Column: Step-by-Step Guide (Panduan kunci API Frame 15:4921 564x547) */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-[#dce2e2] rounded-md shadow-xs p-6 space-y-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#172d3b]">
                      Cara mendapatkan Gemini API Key
                    </h2>
                    <p className="text-xs text-[#66757c] mt-0.5">
                      Kelola kunci melalui Google AI Studio.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded bg-[#eaf3f1] text-[#126b70] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="space-y-1.5 flex-1">
                        <div className="font-bold text-[#172d3b]">
                          Buka Google AI Studio
                        </div>
                        <p className="text-[#66757c] leading-relaxed">
                          Kunjungi tautan di bawah untuk mengelola kunci API.
                        </p>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#126b70] hover:underline"
                        >
                          <span>aistudio.google.com/app/apikey</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded bg-[#eaf3f1] text-[#126b70] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-[#172d3b]">
                          Masuk dengan akun Google
                        </div>
                        <p className="text-[#66757c] leading-relaxed">
                          Gunakan akun Google Anda di Google AI Studio.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded bg-[#eaf3f1] text-[#126b70] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-[#172d3b]">
                          Buat kunci untuk proyek Anda
                        </div>
                        <p className="text-[#66757c] leading-relaxed">
                          Klik &ldquo;Create API key&rdquo;, lalu pilih proyek yang akan digunakan.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded bg-[#eaf3f1] text-[#126b70] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        4
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-[#172d3b]">
                          Salin API key
                        </div>
                        <p className="text-[#66757c] leading-relaxed">
                          Salin kunci dari Google AI Studio dan tempelkan pada kolom API key baru.
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded bg-[#eaf3f1] text-[#126b70] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        5
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-[#172d3b]">
                          Simpan dan uji koneksi
                        </div>
                        <p className="text-[#66757c] leading-relaxed">
                          Klik Simpan API Key, lalu Uji Koneksi Gemini untuk memeriksa koneksi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* PHOTO PREVIEW LIGHTBOX MODAL */}
      {/* ============================================================== */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-[#102530]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-md max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#dce2e2] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#172d3b]">Foto Bukti Lapangan</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-[#66757c] hover:text-[#172d3b] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-[#f5f6f5] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Bukti foto banjir"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FOOTER ADMIN (Figma Catatan layanan 1440x91) */}
      {/* ============================================================== */}
      <footer className="w-full bg-white border-t border-[#dce2e2] mt-12 py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#66757c]">
          <div className="font-bold text-[#172d3b]">
            CitarumAlert · Kabupaten Bandung
          </div>
          <div>
            Portal pengawasan data &amp; konfigurasi AI bencana · Akses khusus admin
          </div>
        </div>
      </footer>
    </div>
  );
}
