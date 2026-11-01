'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { FloodReport } from '@/types';

interface FigmaCitizenPanelProps {
  reports: FloodReport[];
  userVotes: Record<string, 'upvote' | 'downvote'>;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onOpenReportModal: () => void;
  onSelectReport?: (report: FloodReport) => void;
}

export function FigmaCitizenPanel({
  reports,
  userVotes,
  onUpvote,
  onDownvote,
  onOpenReportModal,
  onSelectReport,
}: FigmaCitizenPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const districts = Array.from(new Set(reports.map((r) => r.district))).filter(
    Boolean,
  );

  const filteredReports =
    selectedDistrict === 'all'
      ? reports
      : reports.filter((r) => r.district === selectedDistrict);

  return (
    <div className='w-full space-y-5'>
      {/* CARD 1: BANTU SESAMA KOMUTER (Figma Mint Accent Card) */}
      <div className='w-full bg-[#eaf3f1] border border-[#dce2e2] rounded-md p-5 space-y-3.5 shadow-xs'>
        <div className='flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded bg-white border border-[#dce2e2] flex items-center justify-center text-[#126b70] shadow-2xs'>
            <Users className='w-4 h-4 text-[#126b70]' />
          </div>
          <h3 className='text-base font-bold text-[#173744]'>
            Bantu Sesama Warga
          </h3>
        </div>

        <p className='text-xs text-[#173744] leading-relaxed'>
          Melihat genangan di perjalanan? Bagikan lokasi dan kondisi yang Anda
          temui di lapangan.
        </p>

        <button
          onClick={onOpenReportModal}
          className='w-full py-2.5 px-4 rounded bg-[#126b70] hover:bg-[#0e5458] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer'
        >
          <Plus className='w-4 h-4 stroke-[2.5]' />
          <span>Buat Laporan Lapangan</span>
        </button>

        <div className='text-[11px] text-[#66757c]'>
          Utamakan keselamatan saat mengambil foto.
        </div>
      </div>

      {/* CARD 2: LAPORAN LAPANGAN WARGA (Figma White Feed Card) */}
      <div className='w-full bg-white border border-[#dce2e2] rounded-md p-5 space-y-4 shadow-xs'>
        {/* Header and Filter */}
        <div className='space-y-3'>
          <h3 className='text-base font-bold text-[#173744]'>
            Laporan Lapangan Warga
          </h3>

          {/* District Filter Dropdown */}
          <div className='relative'>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className='w-full appearance-none bg-[#f8faf9] border border-[#dce2e2] rounded px-3 py-2 text-xs font-semibold text-[#173744] focus:outline-none focus:border-[#126b70] cursor-pointer'
            >
              <option value='all'>Semua Wilayah ({reports.length})</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  Kecamatan {d}
                </option>
              ))}
            </select>
            <ChevronDown className='w-3.5 h-3.5 text-[#66757c] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
          </div>
        </div>

        {/* Reports Content or Empty State */}
        {filteredReports.length === 0 ? (
          /* Empty State matching Figma 1:1 */
          <div className='py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-[#dce2e2] rounded bg-[#fbfcfb]'>
            <div className='w-10 h-10 rounded-full bg-[#f0f3f2] flex items-center justify-center text-[#8a969a]'>
              <MapPin className='w-5 h-5 text-[#8a969a]' />
            </div>
            <div className='text-sm font-bold text-[#173744]'>
              Belum Ada Laporan Genangan
            </div>
            <p className='text-xs text-[#66757c] max-w-[260px] leading-relaxed'>
              Belum ada laporan warga yang ditampilkan. Tidak berarti seluruh
              wilayah bebas genangan.
            </p>
          </div>
        ) : (
          /* Live Report Cards */
          <div className='space-y-3 divide-y divide-[#dce2e2] max-h-[380px] overflow-y-auto custom-scrollbar pr-1'>
            {filteredReports.map((report) => {
              const userVote = userVotes[report.id];
              const depthColor =
                report.depthCategory === 'Diatas 1 Meter'
                  ? 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]'
                  : report.depthCategory === 'Sepaha (50-80cm)'
                    ? 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]'
                    : 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]';

              return (
                <div
                  key={report.id}
                  onClick={() => onSelectReport?.(report)}
                  className='pt-3 first:pt-0 space-y-2 cursor-pointer group'
                >
                  {/* Author, District & Depth */}
                  <div className='flex items-center justify-between gap-1.5 flex-wrap'>
                    <div className='text-xs font-bold text-[#173744] truncate'>
                      {report.author || 'Warga Anonim'}{' '}
                      <span className='text-[#66757c] font-normal'>
                        • {report.district}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${depthColor}`}
                    >
                      {report.depthCategory}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className='text-xs text-[#173744] leading-relaxed'>
                    {report.caption}
                  </p>

                  {/* Badges / Attachments */}
                  <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
                    {report.imageUrl && (
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(report.imageUrl || null);
                        }}
                        className='inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8faf9] border border-[#dce2e2] text-[10px] font-medium text-[#173744] hover:bg-[#edf0e9]'
                      >
                        <ImageIcon className='w-3 h-3 text-[#126b70]' />
                        <span>Lihat Bukti Foto</span>
                      </button>
                    )}

                    {report.tiktokLiveUrl && (
                      <a
                        href={report.tiktokLiveUrl}
                        target='_blank'
                        rel='noreferrer'
                        onClick={(e) => e.stopPropagation()}
                        className='inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 hover:bg-rose-100'
                      >
                        <Video className='w-3 h-3 text-rose-600' />
                        <span>Live Stream</span>
                      </a>
                    )}

                    {report.isAiVerified && (
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px] font-semibold text-purple-700'>
                        <Sparkles className='w-3 h-3 text-purple-600' />
                        <span>Verified AI</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Voting Row */}
                  <div className='flex items-center justify-between text-[11px] text-[#66757c] pt-1'>
                    <span>{report.createdAt || 'Hari ini'}</span>

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvote(report.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                          userVote === 'upvote'
                            ? 'bg-[#126b70] text-white'
                            : 'bg-[#f8faf9] text-[#66757c] hover:text-[#173744] border border-[#dce2e2]'
                        }`}
                        title='Konfirmasi genangan masih ada'
                      >
                        <ThumbsUp className='w-3 h-3' />
                        <span>{report.upvotes || 0}</span>
                      </button>

                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownvote(report.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                          userVote === 'downvote'
                            ? 'bg-rose-700 text-white'
                            : 'bg-[#f8faf9] text-[#66757c] hover:text-[#173744] border border-[#dce2e2]'
                        }`}
                        title='Kondisi sudah surut'
                      >
                        <span>{report.downvotes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Image Preview */}
      {previewImage && (
        <div
          className='fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs'
          onClick={() => setPreviewImage(null)}
        >
          <div
            className='max-w-lg w-full bg-white rounded-md overflow-hidden shadow-2xl p-2 relative'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt='Bukti Genangan'
              className='w-full max-h-[80vh] object-contain rounded'
            />
            <button
              onClick={() => setPreviewImage(null)}
              className='mt-2 w-full py-2 bg-[#173744] hover:bg-[#126b70] text-white text-xs font-semibold rounded cursor-pointer transition'
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
