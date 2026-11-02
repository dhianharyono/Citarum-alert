'use client';

import React, { useState, useEffect } from 'react';
import {
  Info,
  Plus,
  MapPin,
  Users,
  AlertTriangle,
  ThumbsUp,
  Video,
  ExternalLink,
  Camera,
  X,
  Filter,
  Sparkles,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { FloodReport, CitizenReportsAiSummary } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';
import { formatAuthorName } from '@/lib/reports-store';

interface FigmaCitizenFullPageProps {
  reports: FloodReport[];
  userVotes: Record<string, 'upvote' | 'downvote'>;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onOpenReportModal: () => void;
  onSelectReport?: (report: FloodReport) => void;
  lastUpdated?: string;
  aiSummary?: CitizenReportsAiSummary | null;
  onRefreshSummary?: () => void;
  isGeneratingSummary?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

export function FigmaCitizenFullPage({
  reports,
  userVotes,
  onUpvote,
  onDownvote,
  onOpenReportModal,
  onSelectReport,
  aiSummary,
  onRefreshSummary,
  isGeneratingSummary,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}: FigmaCitizenFullPageProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [standaloneSummary, setStandaloneSummary] =
    useState<CitizenReportsAiSummary | null>(null);
  const [standaloneLoading, setStandaloneLoading] = useState<boolean>(false);

  // Fetch only if parent did not provide aiSummary or a refresh handler
  useEffect(() => {
    if (aiSummary || onRefreshSummary) return;

    let ignore = false;
    fetch('/api/reports/summary')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && data.data) {
          setStandaloneSummary(data.data);
        }
      })
      .catch((e) => {
        console.warn('Failed to load reports summary:', e);
      });

    return () => {
      ignore = true;
    };
  }, [aiSummary, onRefreshSummary]);

  const handleRegenerateSummary = async () => {
    if (onRefreshSummary) {
      onRefreshSummary();
      return;
    }
    setStandaloneLoading(true);
    try {
      const res = await fetch('/api/reports/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStandaloneSummary(data.data);
      }
    } catch (e) {
      console.warn('Failed to re-generate summary:', e);
    } finally {
      setStandaloneLoading(false);
    }
  };

  // Derive current summary directly during render
  const currentSummary = aiSummary ?? standaloneSummary;
  const isLoadingSummary = Boolean(isGeneratingSummary || standaloneLoading);

  const districts = Array.from(new Set(reports.map((r) => r.district))).filter(
    Boolean,
  );

  // Strictly sort newest first
  const filteredReports = (
    selectedDistrict === 'all'
      ? reports
      : reports.filter((r) => r.district === selectedDistrict)
  )
    .slice()
    .sort((a, b) => {
      const timeA = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
      const timeB = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });

  return (
    <div className='w-full space-y-6'>
      {/* Lightbox Photo Preview Modal (Clean, borderless, frameless) */}
      {previewImage && (
        <div
          className='fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 cursor-zoom-out'
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className='absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer'
            title='Tutup (Esc)'
          >
            <X className='w-5 h-5' />
          </button>
          <img
            src={previewImage}
            alt='Bukti foto banjir'
            className='max-w-full max-h-[92vh] object-contain cursor-default select-none shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 1. HEADER SECTION (Frame 3:11612 Judul halaman 1360x98) */}
      {/* <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <span className='text-[10px] sm:text-xs font-bold tracking-wider text-[#126b70] uppercase block'>
            PARTISIPASI WARGA
          </span>
          <h1 className='text-xl sm:text-2xl md:text-[32px] font-bold text-[#172d3b] tracking-tight mt-0.5 leading-tight'>
            Laporan warga
          </h1>
          <p className='text-xs sm:text-sm text-[#66757c] mt-0.5'>
            Informasi genangan dari warga, untuk membantu sesama memahami
            kondisi lapangan.
          </p>
        </div>
      </div> */}

      {/* 2. MAIN CONTENT 2-COLUMN (Frame 3:11612 Laporan dan panduan 1360x501) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* LEFT COLUMN: Daftar Laporan (8 or 8.5 cols) */}
        <div className='lg:col-span-8 space-y-4'>
          <div className='bg-white border border-[#dce2e2] rounded-md shadow-xs overflow-hidden flex flex-col min-h-[424px]'>
            {/* Header: Count, Filter & Refresh Button */}
            <div className='px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#dce2e2] flex items-center justify-between gap-2.5 bg-white shrink-0'>
              <div className='flex items-baseline gap-2'>
                <span className='text-sm sm:text-base font-bold text-[#172d3b]'>
                  {filteredReports.length} laporan
                </span>
                <span className='text-xs text-[#66757c] font-normal hidden sm:inline'>
                  •{' '}
                  {selectedDistrict === 'all'
                    ? 'Semua kecamatan'
                    : `Kecamatan ${selectedDistrict}`}
                </span>
              </div>

              <div className='flex items-center gap-1.5'>
                <div className='w-32 sm:w-44'>
                  <Dropdown
                    value={selectedDistrict}
                    onChange={setSelectedDistrict}
                    options={[
                      {
                        value: 'all',
                        label: `Semua (${reports.length})`,
                      },
                      ...districts.map((d) => ({
                        value: d,
                        label: `${d} (${reports.filter((r) => r.district === d).length})`,
                      })),
                    ]}
                    fullWidth
                    size='sm'
                    icon={<Filter className='w-3 h-3 text-[#126b70]' />}
                  />
                </div>

                {onRefresh && (
                  <button
                    type='button'
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title='Segarkan Laporan Warga'
                    className='h-8 w-8 rounded border border-[#dce2e2] bg-white hover:bg-[#f5f6f5] flex items-center justify-center text-[#66757c] hover:text-[#172d3b] transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs'
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#126b70]' : ''
                        }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Empty State vs Loading State vs Live List */}
            {isLoading || (isRefreshing && reports.length === 0) ? (
              <div className='flex-1 min-h-[360px] px-4 flex flex-col items-center justify-center text-center space-y-3'>
                <div className='w-6 h-6 border-2 border-[#126b70]/20 border-t-[#126b70] rounded-full animate-spin' />
                <span className='text-xs sm:text-sm font-medium text-[#66757c]'>
                  Memuat laporan warga terkini...
                </span>
              </div>
            ) : filteredReports.length === 0 ? (
              /* Frame 3:11612 Belum ada laporan genangan 968x327 */
              <div className='flex-1 min-h-[360px] p-8 sm:p-14 text-center flex flex-col items-center justify-center space-y-4'>
                <div className='w-14 h-14 rounded-md bg-[#f5f6f5] border border-[#dce2e2] flex items-center justify-center text-[#66757c]'>
                  <MapPin className='w-7 h-7' />
                </div>
                <div className='space-y-1 max-w-md'>
                  <h3 className='text-lg font-bold text-[#172d3b]'>
                    Belum ada laporan genangan
                  </h3>
                  <p className='text-xs text-[#66757c] leading-relaxed'>
                    Belum ada laporan warga yang ditampilkan. Tidak berarti
                    seluruh wilayah aman atau bebas genangan.
                  </p>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className='h-11 px-5 rounded bg-[#126b70] hover:bg-[#0e5458] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer'
                >
                  <Plus className='w-4 h-4 stroke-[2.5]' />
                  <span>Laporkan Banjir</span>
                </button>
                <p className='text-[11px] text-[#66757c]'>
                  Melihat genangan? Bagikan kondisi dari tempat yang aman.
                </p>
              </div>
            ) : (
              <div className='divide-y divide-[#edf0f0] flex-1'>
                {filteredReports.map((report) => {
                  const voteState = userVotes[report.id];
                  const depthBadge =
                    report.depthCategory === 'Diatas 1 Meter'
                      ? 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]'
                      : report.depthCategory === 'Sepaha (50-80cm)'
                        ? 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]'
                        : 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]';

                  return (
                    <div
                      key={report.id}
                      className='p-4 sm:p-5 hover:bg-[#fafbfa] transition-colors space-y-2.5 group cursor-pointer'
                      onClick={() => onSelectReport?.(report)}
                    >
                      {/* Header: Author Name, District, Time & Depth Badge */}
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-baseline gap-1.5 flex-wrap text-xs'>
                          <span className='font-bold text-[#172d3b] group-hover:text-[#126b70] transition-colors capitalize'>
                            {formatAuthorName(report.author)}
                          </span>
                          <span className='text-[11px] text-[#66757c]'>
                            • {report.district}
                          </span>
                          {report.createdAt && (
                            <span className='text-[11px] text-[#8a969a]'>
                              • {report.createdAt}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${depthBadge}`}
                        >
                          {report.depthCategory}
                        </span>
                      </div>

                      {/* Message Body */}
                      <p className='text-xs sm:text-sm text-[#172d3b] leading-relaxed whitespace-pre-line'>
                        {report.caption}
                      </p>

                      {/* Direct Photo Display & TikTok Evidence */}
                      {report.imageUrl && (
                        <div
                          className='mt-1 overflow-hidden rounded-md border border-[#dce2e2] bg-[#f5f6f5] max-w-xs sm:max-w-sm group/img relative cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(report.imageUrl || null);
                          }}
                          title='Klik untuk melihat foto lebih besar'
                        >
                          <img
                            src={report.imageUrl}
                            alt={`Bukti foto ${report.district}`}
                            className='w-full h-36 sm:h-44 object-cover group-hover/img:scale-[1.02] transition-transform duration-200'
                          />
                          <div className='absolute bottom-1.5 right-1.5 bg-[#172d3b]/80 hover:bg-[#126b70] text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 transition'>
                            <Camera className='w-3 h-3' />
                            <span>Lihat Penuh</span>
                          </div>
                        </div>
                      )}

                      {report.tiktokLiveUrl && (
                        <div className='pt-0.5'>
                          <a
                            href={report.tiktokLiveUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fbeeeb] hover:bg-[#fadad7] border border-[#f5c6cb] text-xs font-semibold text-[#b33e35] transition cursor-pointer shadow-2xs'
                          >
                            <Video className='w-3.5 h-3.5' />
                            <span>Live TikTok</span>
                          </a>
                        </div>
                      )}

                      {/* Footer: Voting Pills */}
                      <div className='flex items-center justify-end pt-1.5 border-t border-[#edf0f0] text-xs'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpvote(report.id);
                            }}
                            className={`px-3 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${voteState === 'upvote'
                              ? 'bg-[#eaf3f1] border-[#126b70] text-[#126b70]'
                              : 'bg-white border-[#dce2e2] text-[#66757c] hover:text-[#172d3b] hover:bg-[#f8faf9]'
                              }`}
                          >
                            <ThumbsUp className='w-3.5 h-3.5' />
                            <span>Masih Banjir ({report.upvotes})</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownvote(report.id);
                            }}
                            className={`px-3 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${voteState === 'downvote'
                              ? 'bg-[#fbeeeb] border-[#b33e35] text-[#b33e35]'
                              : 'bg-white border-[#dce2e2] text-[#66757c] hover:text-[#172d3b] hover:bg-[#f8faf9]'
                              }`}
                          >
                            <span>Surut ({report.downvotes || 0})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Panduan Partisipasi & Rangkuman AI (4 cols) */}
        <div className='lg:col-span-4 space-y-4'>
          {/* Card Tips membaca laporan warga (Natural spacing, tanpa gap berlebih) */}
          <div className='bg-white border border-[#dce2e2] rounded-md p-4 sm:p-5 space-y-3.5 shadow-xs'>
            <h3 className='font-bold text-sm sm:text-base text-[#172d3b]'>
              Tips membaca laporan warga
            </h3>

            <div className='space-y-3'>
              {/* Guideline 1 */}
              <div className='space-y-0.5'>
                <div className='flex items-center gap-1.5 text-xs font-bold text-[#172d3b]'>
                  <MapPin className='w-3.5 h-3.5 text-[#126b70] shrink-0' />
                  <span>Periksa lokasi &amp; bukti</span>
                </div>
                <p className='text-xs text-[#66757c] leading-relaxed'>
                  Filter kecamatan untuk mempersempit wilayah. Laporan dapat
                  memuat foto lapangan atau tautan Live TikTok.
                </p>
              </div>

              {/* Guideline 2 */}
              <div className='space-y-0.5'>
                <div className='flex items-center gap-1.5 text-xs font-bold text-[#172d3b]'>
                  <Users className='w-3.5 h-3.5 text-[#126b70] shrink-0' />
                  <span>Baca konfirmasi komunitas</span>
                </div>
                <p className='text-xs text-[#66757c] leading-relaxed'>
                  “Masih banjir” dan “surut” adalah tanggapan warga. Kondisi dapat
                  berubah dan perlu dibandingkan dengan waktu laporan.
                </p>
              </div>

              {/* Guideline 3 */}
              <div className='space-y-0.5'>
                <div className='flex items-center gap-1.5 text-xs font-bold text-[#172d3b]'>
                  <Info className='w-3.5 h-3.5 text-[#126b70] shrink-0' />
                  <span>Pisahkan dari informasi resmi</span>
                </div>
                <p className='text-xs text-[#66757c] leading-relaxed'>
                  Label komunitas, konfirmasi warga, dan analisis foto otomatis
                  bukan verifikasi BPBD. Pantau juga sensor dan buletin wilayah.
                </p>
              </div>
            </div>
          </div>

          {/* RANGKUMAN KONDISI TERKINI OLEH AI (Dipindahkan di bawah Tips) */}
          <div className='bg-[#fbfdfd] border border-[#d2dedb] rounded-md p-4 sm:p-5 shadow-xs space-y-3'>
            {/* Header: Judul sejajar dengan icon refresh di pojok kanan atas */}
            <div className='flex items-start justify-between gap-2 pb-2.5 border-b border-[#e5eeec]'>
              <div className='flex items-start gap-2'>
                <div className='w-7 h-7 rounded bg-[#126b70] text-white flex items-center justify-center shadow-2xs shrink-0 mt-0.5'>
                  <Sparkles className='w-3.5 h-3.5' />
                </div>
                <div>
                  <h3 className='text-sm font-bold text-[#172d3b] leading-tight'>
                    Rangkuman Situasi Terkini
                  </h3>
                  <p className='text-[11px] text-[#66757c] mt-0.5'>
                    Sintesis real-time dari {reports.length} laporan warga
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1.5 shrink-0'>
                {currentSummary?.generatedAt && (
                  <span className='text-[10px] text-[#8a969a] shrink-0'>
                    {currentSummary.generatedAt}
                  </span>
                )}
                <button
                  type='button'
                  onClick={handleRegenerateSummary}
                  disabled={isLoadingSummary}
                  className='h-7 w-7 rounded border border-[#dce2e2] bg-white hover:bg-[#f5f6f5] flex items-center justify-center text-[#66757c] hover:text-[#172d3b] transition cursor-pointer disabled:opacity-50 shadow-2xs shrink-0'
                  title='Segarkan Rangkuman'
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 text-[#126b70] ${isLoadingSummary ? 'animate-spin' : ''
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Content Body */}
            {isLoadingSummary ? (
              <div className='py-5 flex flex-col items-center justify-center space-y-2 text-center'>
                <Sparkles className='w-5 h-5 text-[#126b70] animate-pulse' />
                <p className='text-xs font-medium text-[#172d3b]'>
                  Menganalisis laporan warga...
                </p>
              </div>
            ) : currentSummary ? (
              <div className='space-y-2.5'>
                {/* Headline & Narrative Summary */}
                <div className='space-y-1'>
                  <h4 className='text-xs sm:text-[13px] font-bold text-[#172d3b] leading-snug'>
                    {currentSummary.headline}
                  </h4>
                  <p className='text-xs text-[#3b525d] leading-relaxed'>
                    {currentSummary.summary}
                  </p>
                </div>

                {/* Urgent Note / Commuter Recommendation */}
                {currentSummary.urgentNote && (
                  <div className='p-2.5 rounded bg-[#eaf3f1] border border-[#c3e6cb] flex items-start gap-2 text-xs text-[#173744]'>
                    <AlertCircle className='w-4 h-4 text-[#126b70] shrink-0 mt-0.5' />
                    <div className='leading-relaxed text-[11px] sm:text-xs'>
                      <span className='font-semibold text-[#126b70]'>
                        Catatan Akses &amp; Keselamatan:{' '}
                      </span>
                      <span>{currentSummary.urgentNote}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='py-3 text-center text-xs text-[#66757c]'>
                Belum ada rangkuman. Klik ikon refresh untuk menganalisis laporan.
              </div>
            )}
          </div>

          {/* 4. SAFETY ALERT CARD (Frame 3:11612 Catatan informasi 1360x78) */}
          <div className='p-4 sm:p-5 bg-[#fcf2e4] border border-[#ffeeba] rounded-md flex items-start gap-3'>
            <div className='text-xs sm:text-sm text-[#173744] space-y-0.5'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-[#a9621d] shrink-0 mt-0.5' />
                <div className='font-bold text-[#172d3b]'>Keselamatan lebih dulu</div>
              </div>
              <div className='text-xs text-[#66757c] leading-relaxed'>
                Jangan menerobos genangan untuk memastikan laporan. Ambil foto hanya
                dari tempat aman dan ikuti arahan petugas di lapangan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
