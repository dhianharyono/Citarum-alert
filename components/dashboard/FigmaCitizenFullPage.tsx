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
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <span className='text-xs font-bold tracking-wider text-[#126b70] uppercase block'>
            PARTISIPASI WARGA
          </span>
          <h1 className='text-[28px] sm:text-[36px] font-bold text-[#172d3b] tracking-tight mt-1 leading-tight'>
            Laporan warga
          </h1>
          <p className='text-sm text-[#66757c] mt-1'>
            Informasi genangan dari warga, untuk membantu sesama memahami
            kondisi lapangan.
          </p>
        </div>
      </div>

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
                      className={`w-3.5 h-3.5 ${
                        isRefreshing ? 'animate-spin text-[#126b70]' : ''
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
                          <span className='font-bold text-[#172d3b] group-hover:text-[#126b70] transition-colors'>
                            {report.author || 'Warga Anonim'}
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
                            className={`px-3 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              voteState === 'upvote'
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
                            className={`px-3 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              voteState === 'downvote'
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

        {/* RIGHT COLUMN: Panduan Partisipasi (4 or 3.5 cols, Frame 3:11612 360x424) */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-white border border-[#dce2e2] rounded-md p-5 sm:p-6 space-y-5 shadow-xs min-h-[424px] flex flex-col justify-between'>
            <h3 className='font-bold text-base text-[#172d3b]'>
              Tips membaca laporan warga
            </h3>

            {/* Guideline 1 */}
            <div className='space-y-1'>
              <div className='flex items-center gap-2 text-xs font-bold text-[#172d3b]'>
                <MapPin className='w-4 h-4 text-[#126b70] shrink-0' />
                <span>Periksa lokasi &amp; bukti</span>
              </div>
              <p className='text-xs text-[#66757c] leading-relaxed'>
                Filter kecamatan untuk mempersempit wilayah. Laporan dapat
                memuat foto lapangan atau tautan Live TikTok.
              </p>
            </div>

            {/* Guideline 2 */}
            <div className='space-y-1'>
              <div className='flex items-center gap-2 text-xs font-bold text-[#172d3b]'>
                <Users className='w-4 h-4 text-[#126b70] shrink-0' />
                <span>Baca konfirmasi komunitas</span>
              </div>
              <p className='text-xs text-[#66757c] leading-relaxed'>
                “Masih banjir” dan “surut” adalah tanggapan warga. Kondisi dapat
                berubah dan perlu dibandingkan dengan waktu laporan.
              </p>
            </div>

            {/* Guideline 3 */}
            <div className='space-y-1'>
              <div className='flex items-center gap-2 text-xs font-bold text-[#172d3b]'>
                <Info className='w-4 h-4 text-[#126b70] shrink-0' />
                <span>Pisahkan dari informasi resmi</span>
              </div>
              <p className='text-xs text-[#66757c] leading-relaxed'>
                Label komunitas, konfirmasi warga, dan analisis foto otomatis
                bukan verifikasi BPBD. Pantau juga sensor dan buletin wilayah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RANGKUMAN KONDISI TERKINI OLEH AI (Dipindahkan di bawah section laporan warga) */}
      <div className='w-full bg-[#fbfdfd] border border-[#d2dedb] rounded-md p-4 sm:p-5 shadow-xs space-y-4'>
        {/* Top Header with improved responsive layout */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeec]'>
          <div className='flex items-start gap-2.5'>
            <div className='w-8 h-8 rounded bg-[#126b70] text-white flex items-center justify-center shadow-2xs shrink-0 mt-0.5 sm:mt-0'>
              <Sparkles className='w-4 h-4' />
            </div>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h2 className='text-sm sm:text-base font-bold text-[#172d3b]'>
                  Rangkuman Situasi Warga Terkini
                </h2>
                <span className='inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#eaf3f1] text-[#126b70] border border-[#c3e6cb]'>
                  Rangkuman Otomatis
                </span>
              </div>
              <p className='text-xs text-[#66757c]'>
                Sintesis real-time dari {reports.length} laporan lapangan warga
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto pt-1 sm:pt-0'>
            {currentSummary?.generatedAt && (
              <span className='text-[11px] text-[#8a969a] shrink-0'>
                {currentSummary.generatedAt}
              </span>
            )}
            <button
              type='button'
              onClick={handleRegenerateSummary}
              disabled={isLoadingSummary}
              className='h-8 px-3 rounded bg-white hover:bg-[#f5f6f5] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs ml-auto sm:ml-0'
              title='Perbarui rangkuman kondisi terkini dari laporan warga'
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-[#126b70] ${
                  isLoadingSummary ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isLoadingSummary ? 'Memperbarui...' : 'Perbarui Rangkuman'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoadingSummary ? (
          <div className='py-6 flex flex-col items-center justify-center space-y-2 text-center'>
            <Sparkles className='w-6 h-6 text-[#126b70] animate-pulse' />
            <p className='text-xs font-medium text-[#172d3b]'>
              Sedang membaca dan merangkum laporan warga...
            </p>
            <p className='text-[11px] text-[#66757c]'>
              Menganalisis titik terdampak, kedalaman air, dan peringatan
              komuter
            </p>
          </div>
        ) : currentSummary ? (
          <div className='space-y-3.5'>
            {/* Headline & Narrative Summary */}
            <div className='space-y-1.5'>
              <h3 className='text-sm sm:text-[15px] font-bold text-[#172d3b]'>
                {currentSummary.headline}
              </h3>
              <p className='text-xs sm:text-sm text-[#3b525d] leading-relaxed'>
                {currentSummary.summary}
              </p>
            </div>

            {/* Key Hotspots / Reported Locations */}
            {currentSummary.keyHotspots &&
              currentSummary.keyHotspots.length > 0 && (
                <div className='space-y-2 pt-1'>
                  <span className='text-[11px] font-bold uppercase tracking-wider text-[#66757c] block'>
                    Titik Pantau Lapangan:
                  </span>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5'>
                    {currentSummary.keyHotspots.map((spot, idx) => (
                      <div
                        key={idx}
                        className='bg-white border border-[#dce2e2] rounded p-2.5 space-y-1 text-xs shadow-2xs'
                      >
                        <div className='flex items-center justify-between gap-1.5'>
                          <span className='font-bold text-[#172d3b] flex items-center gap-1 truncate'>
                            <MapPin className='w-3 h-3 text-[#126b70] shrink-0' />
                            {spot.district}
                          </span>
                          {spot.depthLevel && (
                            <span className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f5f6f5] border border-[#dce2e2] text-[#172d3b] shrink-0'>
                              {spot.depthLevel}
                            </span>
                          )}
                        </div>
                        <p className='text-[11px] text-[#66757c] line-clamp-2 leading-relaxed'>
                          {spot.condition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Urgent Note / Commuter Recommendation */}
            {currentSummary.urgentNote && (
              <div className='p-2.5 rounded bg-[#eaf3f1] border border-[#c3e6cb] flex items-start gap-2 text-xs text-[#173744]'>
                <AlertCircle className='w-4 h-4 text-[#126b70] shrink-0 mt-0.5' />
                <div className='leading-relaxed'>
                  <span className='font-semibold text-[#126b70]'>
                    Catatan Akses &amp; Keselamatan:{' '}
                  </span>
                  <span>{currentSummary.urgentNote}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='py-4 text-center text-xs text-[#66757c]'>
            Belum ada rangkuman. Klik Perbarui Rangkuman untuk menganalisis
            laporan.
          </div>
        )}
      </div>

      {/* 4. SAFETY ALERT CARD (Frame 3:11612 Catatan informasi 1360x78) */}
      <div className='p-4 sm:p-5 bg-[#fcf2e4] border border-[#ffeeba] rounded-md flex items-start gap-3'>
        <AlertTriangle className='w-5 h-5 text-[#a9621d] shrink-0 mt-0.5' />
        <div className='text-xs sm:text-sm text-[#173744] space-y-0.5'>
          <div className='font-bold text-[#172d3b]'>Keselamatan lebih dulu</div>
          <div className='text-xs text-[#66757c] leading-relaxed'>
            Jangan menerobos genangan untuk memastikan laporan. Ambil foto hanya
            dari tempat aman dan ikuti arahan petugas di lapangan.
          </div>
        </div>
      </div>
    </div>
  );
}
