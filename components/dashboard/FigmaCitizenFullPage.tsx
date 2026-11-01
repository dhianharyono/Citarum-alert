'use client';

import React, { useState } from 'react';
import {
  Info,
  ChevronDown,
  Plus,
  MapPin,
  Users,
  AlertTriangle,
  Database,
  ThumbsUp,
  ThumbsDown,
  Video,
  ExternalLink,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';
import { FloodReport } from '@/types';

interface FigmaCitizenFullPageProps {
  reports: FloodReport[];
  userVotes: Record<string, 'upvote' | 'downvote'>;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onOpenReportModal: () => void;
  onSelectReport?: (report: FloodReport) => void;
  lastUpdated?: string;
}

export function FigmaCitizenFullPage({
  reports,
  userVotes,
  onUpvote,
  onDownvote,
  onOpenReportModal,
  onSelectReport,
  lastUpdated,
}: FigmaCitizenFullPageProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const districts = Array.from(new Set(reports.map((r) => r.district))).filter(
    Boolean,
  );

  const filteredReports =
    selectedDistrict === 'all'
      ? reports
      : reports.filter((r) => r.district === selectedDistrict);

  const displayDate = lastUpdated || '1 Nov 2026';

  return (
    <div className='w-full space-y-6'>
      {/* Lightbox Photo Preview Modal */}
      {previewImage && (
        <div
          className='fixed inset-0 z-50 bg-[#102530]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in'
          onClick={() => setPreviewImage(null)}
        >
          <div
            className='relative max-w-2xl w-full bg-white rounded-lg overflow-hidden shadow-2xl border border-[#dce2e2]'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-3 bg-[#f8faf9] border-b border-[#dce2e2] flex items-center justify-between'>
              <span className='text-xs font-semibold text-[#172d3b]'>
                Bukti Foto Lapangan Warga
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className='p-1 rounded text-[#66757c] hover:text-[#172d3b] hover:bg-slate-200/60'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
            <div className='p-2 bg-[#f5f6f5]'>
              <img
                src={previewImage}
                alt='Bukti foto banjir'
                className='w-full h-auto max-h-[75vh] object-contain rounded'
              />
            </div>
          </div>
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

        <button
          onClick={onOpenReportModal}
          className='self-start md:self-auto h-11 px-5 rounded bg-[#126b70] hover:bg-[#0e5458] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer'
        >
          <Plus className='w-4 h-4 stroke-[2.5]' />
          <span>Laporkan Banjir</span>
        </button>
      </div>

      {/* 2. NOTICE CARD (Frame 3:11612 / 3:11691 Catatan informasi) */}
      <div className='p-4 sm:p-5 bg-[#eaf3f1] border border-[#dce2e2] rounded-md flex items-start gap-3'>
        <Info className='w-5 h-5 text-[#126b70] shrink-0 mt-0.5' />
        <div className='text-xs sm:text-sm text-[#173744] space-y-0.5'>
          <div className='font-bold'>
            Informasi komunitas, bukan keterangan resmi
          </div>
          <div className='text-xs text-[#66757c] leading-relaxed'>
            Laporan warga melengkapi pemantauan, bukan menggantikan informasi
            BPBD. Kondisi dapat berubah; jangan gunakan laporan sebagai jaminan
            rute aman.
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT 2-COLUMN (Frame 3:11612 Laporan dan panduan 1360x501) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* LEFT COLUMN: Daftar Laporan (8 or 8.5 cols) */}
        <div className='lg:col-span-8 space-y-4'>
          <div className='bg-white border border-[#dce2e2] rounded-md shadow-xs overflow-hidden'>
            {/* Header: Count & Filter */}
            <div className='p-4 sm:p-6 border-b border-[#dce2e2] flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
              <div>
                <div className='text-lg sm:text-xl font-bold text-[#172d3b]'>
                  {filteredReports.length} laporan
                </div>
                <div className='text-xs text-[#66757c] mt-0.5'>
                  {selectedDistrict === 'all'
                    ? 'Semua kecamatan'
                    : `Kecamatan ${selectedDistrict}`}
                </div>
              </div>

              <div className='w-full sm:w-56 space-y-1'>
                <label className='text-[11px] font-semibold text-[#172d3b] block'>
                  Filter kecamatan
                </label>
                <div className='relative'>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className='w-full h-10 appearance-none bg-white border border-[#dce2e2] rounded px-3 pr-8 text-xs font-semibold text-[#172d3b] focus:outline-none focus:border-[#126b70] cursor-pointer'
                  >
                    <option value='all'>
                      Semua Wilayah ({reports.length})
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d} ({reports.filter((r) => r.district === d).length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className='w-3.5 h-3.5 text-[#66757c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
                </div>
              </div>
            </div>

            {/* Empty State vs Live List */}
            {filteredReports.length === 0 ? (
              /* Frame 3:11612 Belum ada laporan genangan 968x327 */
              <div className='p-8 sm:p-14 text-center flex flex-col items-center justify-center space-y-4'>
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
              /* Live Report Cards */
              <div className='divide-y divide-[#dce2e2]'>
                {filteredReports.map((report) => {
                  const voteState = userVotes[report.id];
                  return (
                    <div
                      key={report.id}
                      className='p-4 sm:p-5 hover:bg-[#fbfcfb] transition-colors space-y-3 cursor-pointer'
                      onClick={() => onSelectReport?.(report)}
                    >
                      {/* Top Row: Author & Badges */}
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold text-xs sm:text-sm text-[#172d3b]'>
                            {report.author}
                          </span>
                          <span className='text-[11px] text-[#66757c]'>•</span>
                          <span className='text-[11px] font-semibold text-[#126b70]'>
                            {report.district}
                          </span>
                        </div>

                        <div className='flex items-center gap-1.5 flex-wrap'>
                          <span className='text-[10px] font-bold px-2 py-0.5 rounded bg-[#fcf2e4] text-[#a9621d] border border-[#ffeeba]'>
                            {report.depthCategory}
                          </span>
                          {report.isAiVerified && (
                            <span className='text-[10px] font-bold px-2 py-0.5 rounded bg-[#eaf3f1] text-[#126b70] border border-[#dce2e2] flex items-center gap-1'>
                              <Sparkles className='w-3 h-3 text-[#126b70]' />
                              <span>AI Verified</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Caption */}
                      <p className='text-xs sm:text-sm text-[#172d3b] leading-relaxed'>
                        {report.caption}
                      </p>

                      {/* Photo / TikTok Evidence */}
                      <div className='flex items-center gap-2 flex-wrap'>
                        {report.imageUrl && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(report.imageUrl || null);
                            }}
                            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f5f6f5] hover:bg-[#edf0e9] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] transition cursor-pointer'
                          >
                            <Camera className='w-3.5 h-3.5 text-[#126b70]' />
                            <span>Lihat Foto Lapangan</span>
                          </button>
                        )}

                        {report.tiktokLiveUrl && (
                          <a
                            href={report.tiktokLiveUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f5f6f5] hover:bg-[#edf0e9] border border-[#dce2e2] text-xs font-semibold text-[#172d3b] transition cursor-pointer'
                          >
                            <Video className='w-3.5 h-3.5 text-[#b33e35]' />
                            <span>Pantau Live TikTok</span>
                            <ExternalLink className='w-3 h-3 text-[#66757c]' />
                          </a>
                        )}
                      </div>

                      {/* Footer: GPS + Upvote / Downvote */}
                      <div className='flex items-center justify-between pt-1 border-t border-[#edf0f0] text-xs'>
                        <span className='text-[11px] text-[#66757c] flex items-center gap-1'>
                          <MapPin className='w-3 h-3 text-[#126b70]' />
                          <span>GPS Terkunci</span>
                        </span>

                        <div className='flex items-center gap-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpvote(report.id);
                            }}
                            className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              voteState === 'upvote'
                                ? 'bg-[#eaf3f1] border-[#126b70] text-[#126b70]'
                                : 'bg-white border-[#dce2e2] text-[#66757c] hover:text-[#172d3b]'
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
                            className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                              voteState === 'downvote'
                                ? 'bg-[#fbeeeb] border-[#b33e35] text-[#b33e35]'
                                : 'bg-white border-[#dce2e2] text-[#66757c] hover:text-[#172d3b]'
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

            {/* Asal data laporan footnote (Frame 3:11612 968x52) */}
            <div className='p-3.5 sm:px-6 bg-[#f5f6f5] border-t border-[#dce2e2] flex items-center gap-2 text-[11px] text-[#66757c]'>
              <Database className='w-3.5 h-3.5 text-[#66757c] shrink-0' />
              <span>
                API laporan website: {reports.length} entri saat diperiksa pada{' '}
                {displayDate}.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Panduan Partisipasi (4 or 3.5 cols, Frame 3:11612 360x424) */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-white border border-[#dce2e2] rounded-md p-5 sm:p-6 space-y-5 shadow-xs'>
            <h3 className='font-bold text-base text-[#172d3b]'>
              Membaca laporan warga
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
