'use client';

import React, { useState, useRef } from 'react';
import {
  Navigation,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Video,
  Camera,
} from 'lucide-react';
import { WaterDepthCategory, CreateReportInput, VerificationResult } from '@/types';
import { Button } from '@/components/ui/Button';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReportInput) => Promise<void>;
}

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dayeuhkolot': { lat: -6.9856, lng: 107.6219 },
  'Baleendah (Cieunteung)': { lat: -6.9980, lng: 107.6270 },
  'Bojongsoang (Cijagra)': { lat: -6.9790, lng: 107.6360 },
  'Kopo': { lat: -6.9450, lng: 107.5850 },
  'Kopo Sayati': { lat: -6.9710, lng: 107.5760 },
  'Cibaduyut': { lat: -6.9535, lng: 107.5925 },
  'Kopo - Katapang': { lat: -6.9740, lng: 107.5750 },
  'Majalaya (Sapan)': { lat: -7.0519, lng: 107.7583 },
  'Rancaekek (Dangdeur)': { lat: -6.9582, lng: 107.7289 },
  'Banjaran (Kamasan)': { lat: -7.0420, lng: 107.5910 },
  'Margahayu (Sayuran)': { lat: -6.9620, lng: 107.5850 },
};

export function ReportFormModal({ isOpen, onClose, onSubmit }: ReportFormModalProps) {
  const [author, setAuthor] = useState('');
  const [district, setDistrict] = useState('Dayeuhkolot');
  const [caption, setCaption] = useState('');
  const [depthCategory, setDepthCategory] = useState<WaterDepthCategory>('Selutut (20-50cm)');
  const [evidenceTab, setEvidenceTab] = useState<'photo' | 'tiktok'>('photo');
  const [tiktokLiveUrl, setTiktokLiveUrl] = useState('');
  const [gpsLocked, setGpsLocked] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isVerifyingAi, setIsVerifyingAi] = useState(false);
  const [aiResult, setAiResult] = useState<VerificationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validasi: Wajib mengisi caption, salah satu bukti (Foto/TikTok), dan mengunci GPS
  const hasPhoto = Boolean(imageBase64);
  const hasTiktok = Boolean(tiktokLiveUrl.trim());
  const hasEvidence = hasPhoto || hasTiktok;
  const canSubmit = caption.trim().length >= 5 && hasEvidence && gpsLocked && !isSubmitting;

  if (!isOpen) return null;

  const handleGPS = () => {
    if (!('geolocation' in navigator)) {
      alert('Perangkat Anda tidak mendukung fitur Geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLocked(true);
      },
      (err) => {
        console.warn('GPS failed:', err);
        // Fallback to district coordinates
        const defaultCoord = DISTRICT_COORDINATES[district] || { lat: -6.9856, lng: 107.6219 };
        setCoords(defaultCoord);
        setGpsLocked(true);
      },
      { timeout: 7000 }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setAiResult(null);

      // Trigger automatic AI Vision check
      setIsVerifyingAi(true);
      try {
        const res = await fetch('/api/verify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            caption,
            depthCategory,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAiResult(data.data);
        }
      } catch (err) {
        console.warn('AI verification failed:', err);
      } finally {
        setIsVerifyingAi(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    if (!gpsLocked || !coords) {
      alert('Mohon klik "Kunci Titik GPS" untuk memastikan akurasi posisi genangan banjir pada peta.');
      return;
    }

    if (!hasEvidence) {
      alert('Mohon lampirkan salah satu bukti: Foto Lapangan atau Link Live TikTok untuk memvalidasi laporan Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetCoord = coords || DISTRICT_COORDINATES[district] || {
        lat: -6.9856,
        lng: 107.6219,
      };

      await onSubmit({
        author: author.trim() || 'Warga Anonim',
        district,
        caption: caption.trim(),
        depthCategory,
        lat: targetCoord.lat,
        lng: targetCoord.lng,
        imageBase64: imageBase64 || undefined,
        tiktokLiveUrl: tiktokLiveUrl.trim() || undefined,
      });

      // Reset & close
      setCaption('');
      setAuthor('');
      setTiktokLiveUrl('');
      setImageBase64(null);
      setAiResult(null);
      setEvidenceTab('photo');
      setGpsLocked(false);
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gagal mengirim laporan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity z-[9999]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-[10000] max-h-[85vh] sm:max-h-[88vh] flex flex-col my-auto">
        {/* Modal Header (Fully Responsive on Mobile) */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-tight truncate">
                Laporkan Genangan Banjir
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-snug">
                Laporan langsung tampil di peta & feed warga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body with custom sleek scrollbar */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-4.5 text-xs sm:text-sm">
            {/* Author Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nama Pelapor (Opsional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Misal: Kang Dedi / Warga Bojongsoang"
                maxLength={60}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* District Selector & GPS Lock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kawasan / Kecamatan
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                >
                  {Object.keys(DISTRICT_COORDINATES).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Akurasi Posisi (GPS) <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-semibold ${
                      gpsLocked ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {gpsLocked ? '✓ Terkunci' : 'Wajib'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGPS}
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    gpsLocked
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${
                      gpsLocked ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                    }`}
                  />
                  {gpsLocked ? 'GPS Terkunci' : 'Kunci Titik GPS (Wajib)'}
                </button>
              </div>
            </div>

            {/* Caption */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Kondisi Lapangan & Akses Jalan <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500">{caption.length}/280</span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Contoh: Depan pabrik Kopo air mencapai knalpot motor, roda 2 putar balik..."
                maxLength={280}
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition leading-relaxed"
              />
            </div>

            {/* Water Depth Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Perkiraan Ketinggian Genangan
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    'Mata Kaki (<20cm)',
                    'Selutut (20-50cm)',
                    'Sepaha (50-80cm)',
                    'Diatas 1 Meter',
                  ] as WaterDepthCategory[]
                ).map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setDepthCategory(category)}
                    className={`py-2.5 px-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition ${
                      depthCategory === category
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Tab Selector (Wajib Pilih Salah Satu: Foto ATAU Live TikTok) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <span>Bukti Validasi Lapangan</span>
                  <span className="text-rose-400 font-bold">*</span>
                </label>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition ${
                    hasEvidence
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {hasEvidence ? '✓ Bukti Terlampir' : 'Wajib 1 Bukti'}
                </span>
              </div>

              {/* Tab Buttons */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEvidenceTab('photo')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    evidenceTab === 'photo'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>Foto Lapangan</span>
                  {hasPhoto && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEvidenceTab('tiktok')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    evidenceTab === 'tiktok'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 shrink-0" />
                  <span>Live TikTok</span>
                  {hasTiktok && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              </div>

              {/* Tab 1 Content: Foto Bukti Lapangan */}
              {evidenceTab === 'photo' && (
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {!imageBase64 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-5 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-medium">Klik untuk unggah foto genangan (Maks 5MB)</span>
                      <span className="text-[10px] text-slate-500">
                        Foto diverifikasi otomatis dengan Google Gemini Vision AI
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-44 bg-slate-950">
                        <img src={imageBase64} alt="Preview Bukti" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageBase64(null);
                            setAiResult(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                          title="Hapus foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* AI Verification Status Card */}
                      {isVerifyingAi ? (
                        <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center gap-2 text-blue-300 text-xs">
                          <Sparkles className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                          <span>Menganalisis foto dengan Gemini Flash AI...</span>
                        </div>
                      ) : aiResult ? (
                        <div
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                            aiResult.isFlood
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {aiResult.isFlood ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>
                                {aiResult.isFlood ? 'Foto Terverifikasi AI' : 'Peringatan AI'}
                              </span>
                              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                                {Math.round(aiResult.confidence * 100)}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                              {aiResult.explanation}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2 Content: Link Live TikTok */}
              {evidenceTab === 'tiktok' && (
                <div className="p-3.5 bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border border-rose-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 min-w-0">
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate sm:whitespace-normal">URL Siaran Langsung TikTok</span>
                    </label>
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                      Live Stream
                    </span>
                  </div>
                  <input
                    type="text"
                    value={tiktokLiveUrl}
                    onChange={(e) => setTiktokLiveUrl(e.target.value)}
                    placeholder="Contoh: https://vt.tiktok.com/xxxx/ atau tiktok.com/@akun/live"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/70 transition"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Tautan ini akan langsung muncul di peta &amp; feed warga agar komuter lain dapat memantau kondisi arus air secara langsung.
                  </p>
                </div>
              )}

              {/* Hint if neither evidence is provided */}
              {!hasEvidence && (
                <p className="text-xs text-amber-400/90 flex items-center gap-1.5 pt-1 leading-tight">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Wajib lampirkan 1 bukti (Foto atau Live TikTok).</span>
                </p>
              )}
            </div>
          </div>

          {/* Fixed Modal Footer Action */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="px-4 py-2">
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!canSubmit}
              className="px-5 py-2.5 shadow-md shadow-blue-600/30"
              title={
                !gpsLocked
                  ? 'Wajib mengunci titik koordinat GPS lokasi terlebih dahulu'
                  : !hasEvidence
                  ? 'Wajib melampirkan salah satu bukti (Foto atau Link Live TikTok)'
                  : undefined
              }
            >
              Kirim Laporan Siaga
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

