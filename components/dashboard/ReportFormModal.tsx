'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Waves,
  Camera,
  UserRound,
  LocateFixed,
  Info,
  Send,
  ImagePlus,
  Video,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { CreateReportInput, WaterDepthCategory } from '@/types';
import { Button } from '@/components/ui/Button';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReportInput) => Promise<void>;
}

// Kawasan langganan banjir & koridor arteri utama Kab. Bandung
export const PRIMARY_HOTSPOT_ZONES = [
  'Dayeuhkolot',
  'Baleendah (Andir / Cieunteung)',
  'Bojongsoang (Cikapundung / Telkom)',
  'Kopo Sayati (Margahayu)',
  'Cibaduyut (Batas Dayeuhkolot)',
  'Rancaekek (Kahatex / Cikeruh)',
  'Majalaya (Citarum Hulu)',
  'Katapang (Gandasoli)',
  'Banjaran (Kamasan / Cisangkuy)',
  'Margaasih (Nanjung / Lagadar)',
];

// Seluruh 31 Kecamatan resmi administratif Kabupaten Bandung (A-Z lengkap)
export const KAB_BANDUNG_31_KECAMATAN = [
  'Arjasari',
  'Baleendah',
  'Banjaran',
  'Bojongsoang',
  'Cangkuang',
  'Cicalengka',
  'Cikancung',
  'Cilengkrang',
  'Cileunyi',
  'Cimaung',
  'Cimenyan',
  'Ciparay',
  'Ciwidey',
  'Dayeuhkolot',
  'Ibun',
  'Katapang',
  'Kertasari',
  'Kopo',
  'Kutawaringin',
  'Majalaya',
  'Margaasih',
  'Margahayu',
  'Nagreg',
  'Pacet',
  'Pameungpeuk',
  'Pangalengan',
  'Paseh',
  'Pasirjambu',
  'Rancabali',
  'Rancaekek',
  'Solokanjeruk',
  'Soreang',
];

export const DISTRICT_LIST = [
  ...PRIMARY_HOTSPOT_ZONES,
  ...KAB_BANDUNG_31_KECAMATAN,
];

export function ReportFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ReportFormModalProps) {
  const [author, setAuthor] = useState('');
  const [district, setDistrict] = useState(DISTRICT_LIST[0]);
  const [caption, setCaption] = useState('');
  const [depthCategory, setDepthCategory] =
    useState<WaterDepthCategory>('Selutut (20-50cm)');
  const [evidenceType, setEvidenceType] = useState<'photo' | 'tiktok'>('photo');

  // Evidence states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tiktokUrl, setTiktokUrl] = useState('');

  // GPS states
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLocked, setGpsLocked] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Form submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle GPS lock
  const handleLockGPS = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Browser tidak mendukung GPS');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsLocked(true);
        setIsGpsLoading(false);
      },
      (err) => {
        let msg = 'Gagal mengambil lokasi GPS';
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            'Izin lokasi ditolak. Buka pengaturan browser untuk mengizinkan GPS.';
        }
        setGpsError(msg);
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const hasEvidence =
    (evidenceType === 'photo' && file !== null) ||
    (evidenceType === 'tiktok' && tiktokUrl.trim().length > 0);

  const isFormValid = gpsLocked && caption.trim().length >= 5 && hasEvidence;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let uploadedImageUrl: string | undefined = undefined;

      // 1. Upload photo to Vercel Blob if provided
      if (evidenceType === 'photo' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('district', district);

        const uploadRes = await fetch('/api/verify-image', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'Gagal mengunggah foto lapangan');
        }

        uploadedImageUrl = uploadData.data?.url;
      }

      // 2. Submit report
      const newReportInput: CreateReportInput = {
        author: author.trim() || 'Warga Anonim',
        district,
        caption: caption.trim(),
        depthCategory,
        lat: lat || -6.9922,
        lng: lng || 107.6186,
        imageUrl: uploadedImageUrl,
        tiktokLiveUrl:
          evidenceType === 'tiktok' && tiktokUrl.trim()
            ? tiktokUrl.trim()
            : undefined,
      };

      await onSubmit(newReportInput);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setSubmitError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#102530]/60 backdrop-blur-xs animate-in fade-in duration-200'>
      {/* Modal Dialog Card (Figma Desktop 920px max-width) */}
      <div className='w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-[920px] bg-white rounded-none sm:rounded-lg border-0 sm:border border-[#dce2e2] shadow-2xl flex flex-col overflow-hidden text-[#173744]'>
        {/* MOBILE TOP NAVIGATION (Frame 3:11142 Navigasi form 412x64) */}
        <div className='flex sm:hidden h-14 px-4 items-center justify-between border-b border-[#dce2e2] bg-white shrink-0'>
          <span className='text-sm font-semibold text-[#172d3b]'>
            Citarum Alert / Laporan
          </span>
          <button
            onClick={onClose}
            className='flex items-center gap-1.5 text-xs font-semibold text-[#66757c] hover:text-[#172d3b] p-1.5 rounded cursor-pointer'
          >
            <X className='w-4 h-4' />
            <span>Tutup</span>
          </button>
        </div>

        {/* DESKTOP HEADER (Frame 3:10759 Kepala form 920x111) */}
        <div className='hidden sm:flex px-7 py-5 items-start justify-between border-b border-[#dce2e2] bg-white shrink-0'>
          <div>
            <h2 className='text-[24px] lg:text-[26px] font-bold text-[#172d3b] tracking-tight leading-tight'>
              Laporkan Genangan Banjir
            </h2>
            <p className='text-xs text-[#66757c] mt-1'>
              Bagikan kondisi yang Anda lihat. Tanda * wajib diisi.
            </p>
          </div>
          <button
            onClick={onClose}
            className='flex items-center gap-1.5 text-xs font-semibold text-[#66757c] hover:text-[#172d3b] px-2.5 py-1.5 rounded hover:bg-[#f5f6f5] transition-colors cursor-pointer'
          >
            <X className='w-4 h-4' />
            <span>Tutup</span>
          </button>
        </div>

        {/* FORM BODY (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className='flex-1 overflow-y-auto custom-scrollbar flex flex-col'
        >
          <div className='p-4 sm:p-7 space-y-6 flex-1'>
            {/* Mobile Title & Guide (if on mobile) */}
            <div className='block sm:hidden'>
              <h1 className='text-xl font-bold text-[#172d3b] leading-tight'>
                Laporkan Genangan Banjir
              </h1>
              <p className='text-xs text-[#66757c] mt-1'>
                Bagikan kondisi yang Anda lihat. Tanda * wajib diisi.
              </p>
            </div>

            {/* Notice Card: Safety First (Figma Frame 3:10759 / 3:11142) */}
            <div className='p-3.5 sm:p-4 bg-[#eaf3f1] border border-[#dce2e2] rounded flex items-start gap-2.5'>
              <Info className='w-4 h-4 text-[#126b70] shrink-0 mt-0.5' />
              <div className='text-xs text-[#173744] leading-relaxed'>
                <span className='font-bold sm:hidden block mb-0.5'>
                  Utamakan keselamatan
                </span>
                <span>
                  Laporkan dari tempat aman. Jangan menerobos genangan atau
                  mengambil foto sambil berkendara.
                </span>
              </div>
            </div>

            {/* Desktop 2-Column / Mobile 1-Column Layout */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 items-start'>
              {/* LEFT COLUMN: Lokasi & Kondisi Lapangan */}
              <div className='space-y-6'>
                {/* Section 1: Lokasi Kejadian */}
                <div className='space-y-3.5'>
                  <div className='flex items-center gap-2 text-[#172d3b] font-bold text-sm'>
                    <MapPin className='w-4 h-4 text-[#126b70]' />
                    <span>Lokasi kejadian</span>
                  </div>

                  {/* Kecamatan Select */}
                  <div>
                    <label className='text-xs font-semibold text-[#172d3b] block mb-1.5'>
                      Kawasan / Kecamatan{' '}
                      <span className='text-[#b33e35]'>*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className='w-full h-11 bg-white border border-[#dce2e2] rounded px-3 text-xs sm:text-sm text-[#172d3b] font-medium focus:outline-none focus:border-[#126b70] cursor-pointer'
                    >
                      <optgroup label='📍 Titik Langganan Banjir & Koridor Arteri'>
                        {PRIMARY_HOTSPOT_ZONES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label='🏛 Seluruh 31 Kecamatan Kab. Bandung'>
                        {KAB_BANDUNG_31_KECAMATAN.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* GPS Lock */}
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='font-semibold text-[#172d3b]'>
                        Titik GPS <span className='text-[#b33e35]'>*</span>
                      </span>
                      <span
                        className={
                          gpsLocked
                            ? 'text-[#497665] font-semibold flex items-center gap-1'
                            : 'text-[#66757c]'
                        }
                      >
                        {gpsLocked ? (
                          <>
                            <CheckCircle2 className='w-3.5 h-3.5 text-[#497665]' />
                            <span>Terkunci</span>
                          </>
                        ) : (
                          'Belum diambil'
                        )}
                      </span>
                    </div>

                    <button
                      type='button'
                      onClick={handleLockGPS}
                      disabled={isGpsLoading}
                      className={`w-full h-11 px-4 rounded border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        gpsLocked
                          ? 'bg-[#eaf3f1] border-[#126b70] text-[#126b70]'
                          : 'bg-white hover:bg-[#f5f6f5] border-[#dce2e2] text-[#126b70]'
                      }`}
                    >
                      {isGpsLoading ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin text-[#126b70]' />
                          <span>Mendeteksi Satelit GPS...</span>
                        </>
                      ) : (
                        <>
                          <LocateFixed className='w-4 h-4' />
                          <span>
                            {gpsLocked
                              ? 'Kunci Ulang Titik GPS'
                              : 'Kunci Titik GPS'}
                          </span>
                        </>
                      )}
                    </button>

                    <p className='text-[11px] text-[#66757c] leading-relaxed'>
                      Izinkan akses lokasi untuk mengambil titik Anda. Pilihan
                      kecamatan tidak menggantikan GPS.
                    </p>
                    {gpsError && (
                      <p className='text-[11px] text-[#b33e35] font-medium leading-relaxed'>
                        {gpsError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className='border-b border-[#dce2e2]' />

                {/* Section 2: Kondisi Lapangan */}
                <div className='space-y-3.5'>
                  <div className='flex items-center gap-2 text-[#172d3b] font-bold text-sm'>
                    <Waves className='w-4 h-4 text-[#126b70]' />
                    <span>Kondisi lapangan</span>
                  </div>

                  {/* Caption Textarea */}
                  <div>
                    <label className='text-xs font-semibold text-[#172d3b] block mb-1.5'>
                      Kondisi Lapangan &amp; Akses Jalan{' '}
                      <span className='text-[#b33e35]'>*</span>
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder='Contoh: Depan pabrik Kopo air mencapai knalpot motor, roda 2 putar balik...'
                      maxLength={280}
                      rows={3}
                      className='w-full bg-white border border-[#dce2e2] rounded p-3 text-xs sm:text-sm text-[#172d3b] placeholder-[#8a969a] focus:outline-none focus:border-[#126b70] resize-none leading-relaxed'
                    />
                    <div className='flex items-center justify-between mt-1 text-[11px] text-[#66757c]'>
                      <span>Minimal 5 karakter</span>
                      <span>{caption.length} / 280</span>
                    </div>
                  </div>

                  {/* Water Depth Selector */}
                  <div>
                    <label className='text-xs font-semibold text-[#172d3b] block mb-1.5'>
                      Perkiraan ketinggian{' '}
                      <span className='text-[#b33e35]'>*</span>
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      {(
                        [
                          'Mata Kaki (<20cm)',
                          'Selutut (20-50cm)',
                          'Sepaha (50-80cm)',
                          'Diatas 1 Meter',
                        ] as WaterDepthCategory[]
                      ).map((category) => (
                        <button
                          type='button'
                          key={category}
                          onClick={() => setDepthCategory(category)}
                          className={`p-2.5 rounded border text-left text-xs font-medium transition cursor-pointer ${
                            depthCategory === category
                              ? 'bg-[#eaf3f1] border-[#126b70] text-[#126b70] font-bold'
                              : 'bg-white border-[#dce2e2] text-[#66757c] hover:text-[#172d3b]'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <p className='text-[11px] text-[#66757c] mt-1.5 leading-relaxed'>
                      Perkirakan dari tempat aman; jangan masuk ke genangan
                      untuk mengukur.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Bukti & Identitas */}
              <div className='space-y-6'>
                {/* Section 3: Bukti Lapangan */}
                <div className='space-y-3.5'>
                  <div className='flex items-center gap-2 text-[#172d3b] font-bold text-sm'>
                    <Camera className='w-4 h-4 text-[#126b70]' />
                    <span>Bukti lapangan</span>
                  </div>

                  <p className='text-xs text-[#172d3b] leading-relaxed'>
                    Tambahkan minimal satu bukti: foto atau URL Live TikTok.
                    Tidak harus keduanya
                    <span className='text-[#b33e35]'>*</span>
                  </p>

                  {/* Tab Selector */}
                  <div className='grid grid-cols-2 rounded border border-[#dce2e2] p-0.5 bg-white'>
                    <button
                      type='button'
                      onClick={() => setEvidenceType('photo')}
                      className={`py-2 text-xs font-semibold rounded transition cursor-pointer ${
                        evidenceType === 'photo'
                          ? 'bg-[#eaf3f1] text-[#126b70]'
                          : 'text-[#66757c] hover:text-[#172d3b]'
                      }`}
                    >
                      Foto Lapangan
                    </button>
                    <button
                      type='button'
                      onClick={() => setEvidenceType('tiktok')}
                      className={`py-2 text-xs font-semibold rounded transition cursor-pointer ${
                        evidenceType === 'tiktok'
                          ? 'bg-[#eaf3f1] text-[#126b70]'
                          : 'text-[#66757c] hover:text-[#172d3b]'
                      }`}
                    >
                      URL Live TikTok
                    </button>
                  </div>

                  {/* Tab Content: Photo Upload */}
                  {evidenceType === 'photo' && (
                    <div className='space-y-2'>
                      {previewUrl ? (
                        <div className='relative border border-[#dce2e2] rounded overflow-hidden bg-[#f8faf9] p-2 flex items-center gap-3'>
                          <img
                            src={previewUrl}
                            alt='Bukti foto genangan'
                            className='w-16 h-16 object-cover rounded border border-[#dce2e2]'
                          />
                          <div className='flex-1 min-w-0 text-xs'>
                            <div className='font-semibold text-[#172d3b] truncate'>
                              {file?.name}
                            </div>
                            <div className='text-[11px] text-[#66757c]'>
                              {((file?.size || 0) / (1024 * 1024)).toFixed(2)}{' '}
                              MB • Siap diunggah
                            </div>
                            <button
                              type='button'
                              onClick={handleRemovePhoto}
                              className='text-[11px] font-semibold text-[#b33e35] hover:underline mt-1 block cursor-pointer'
                            >
                              Ganti Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className='border-2 border-dashed border-[#dce2e2] hover:border-[#126b70] rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#fbfcfb] transition'>
                          <input
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            onChange={handleFileChange}
                            className='hidden'
                          />
                          <ImagePlus className='w-7 h-7 text-[#126b70] mb-2' />
                          <span className='h-9 px-4 rounded bg-white border border-[#dce2e2] text-xs font-semibold text-[#126b70] flex items-center justify-center mb-1.5 shadow-2xs'>
                            Pilih foto
                          </span>
                          <span className='text-[11px] text-[#66757c]'>
                            Belum ada foto • file gambar maks. 5 MB
                          </span>
                        </label>
                      )}

                      <p className='text-[11px] text-[#66757c] leading-relaxed'>
                        Foto dapat dianalisis otomatis oleh AI. Hasilnya bukan
                        verifikasi resmi BPBD.
                      </p>
                    </div>
                  )}

                  {/* Tab Content: TikTok Live */}
                  {evidenceType === 'tiktok' && (
                    <div className='space-y-2'>
                      <div className='relative'>
                        <input
                          type='url'
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          placeholder='https://www.tiktok.com/@username/live/...'
                          className='w-full h-11 bg-white border border-[#dce2e2] rounded px-3 text-xs sm:text-sm text-[#172d3b] placeholder-[#8a969a] focus:outline-none focus:border-[#126b70]'
                        />
                      </div>
                      <p className='text-[11px] text-[#66757c] leading-relaxed'>
                        Tempel tautan siaran langsung TikTok warga saat ini di
                        lokasi genangan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className='border-b border-[#dce2e2]' />

                {/* Section 4: Identitas Pelapor */}
                <div className='space-y-3.5'>
                  <div className='flex items-center gap-2 text-[#172d3b] font-bold text-sm'>
                    <UserRound className='w-4 h-4 text-[#126b70]' />
                    <span>Identitas pelapor</span>
                  </div>

                  <div>
                    <label className='text-xs font-semibold text-[#172d3b] block mb-1.5'>
                      Nama Pelapor (opsional)
                    </label>
                    <input
                      type='text'
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder='Nama Anda'
                      maxLength={60}
                      className='w-full h-11 bg-white border border-[#dce2e2] rounded px-3 text-xs sm:text-sm text-[#172d3b] placeholder-[#8a969a] focus:outline-none focus:border-[#126b70]'
                    />
                    <p className='text-[11px] text-[#66757c] mt-1'>
                      Maks. 60 karakter. Jika kosong, tampil sebagai Warga
                      Anonim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTION (Frame 3:10759 / 3:11142 Pengiriman laporan) */}
          <div className='p-4 sm:px-7 sm:py-5 border-t border-[#dce2e2] bg-[#f5f6f5] space-y-3.5 shrink-0'>
            {/* Status / Incomplete Notice */}
            {!isFormValid && (
              <div className='flex items-center gap-2 text-xs text-[#66757c]'>
                <Info className='w-4 h-4 text-[#66757c] shrink-0' />
                <span className='leading-snug'>
                  Belum bisa dikirim. Kunci GPS, isi deskripsi (min. 5
                  karakter), dan tambahkan foto atau URL Live TikTok.
                </span>
              </div>
            )}

            {submitError && (
              <div className='flex items-center gap-2 text-xs text-[#b33e35] bg-[#fbeeeb] p-2.5 rounded border border-[#f5c6cb]'>
                <AlertTriangle className='w-4 h-4 shrink-0 text-[#b33e35]' />
                <span className='leading-snug font-medium'>{submitError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='h-11 px-5 rounded bg-white hover:bg-[#edf0e9] border border-[#dce2e2] text-xs sm:text-sm font-semibold text-[#126b70] transition-colors cursor-pointer'
              >
                Batal
              </button>

              <button
                type='submit'
                disabled={!isFormValid || isSubmitting}
                className={`h-11 px-6 rounded font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs ${
                  isFormValid && !isSubmitting
                    ? 'bg-[#126b70] hover:bg-[#0e5458] text-white'
                    : 'bg-[#e4e9e9] text-[#718087] cursor-not-allowed opacity-80'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
