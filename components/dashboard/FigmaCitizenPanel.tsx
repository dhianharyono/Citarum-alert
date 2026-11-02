'use client';

import React, { useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  Video,
  Filter,
  RotateCw,
  Camera,
  X,
} from 'lucide-react';
import { FloodReport } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';
import { formatAuthorName } from '@/lib/reports-store';

interface FigmaCitizenPanelProps {
  reports: FloodReport[];
  userVotes: Record<string, 'upvote' | 'downvote'>;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onOpenReportModal?: () => void;
  onSelectReport?: (report: FloodReport) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

export function FigmaCitizenPanel({
  reports,
  userVotes,
  onUpvote,
  onDownvote,
  onOpenReportModal,
  onSelectReport,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}: FigmaCitizenPanelProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const districts = Array.from(new Set(reports.map((r) => r.district))).filter(
    Boolean,
  );

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
    <div className='w-full h-full flex flex-col min-h-0'>
      {/* CARD 2: LAPORAN LAPANGAN WARGA (Figma White Feed Card) */}
      <div className='w-full bg-white border border-[#dce2e2] rounded-md p-4 sm:p-5 space-y-4 shadow-xs flex flex-col flex-1 min-h-0 max-h-[640px]'>
        {/* Header and Filter */}
        <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-[#edf0f0] shrink-0'>
          <h3 className='text-sm sm:text-base font-bold text-[#173744] shrink-0'>
            Laporan Warga
          </h3>

          <div className='flex items-center gap-1.5'>
            {/* District Filter Dropdown (compact & small) */}
            <div className='w-32 sm:w-40'>
              <Dropdown
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                options={[
                  { value: 'all', label: `Semua (${reports.length})` },
                  ...districts.map((d) => ({
                    value: d,
                    label: `${d}`,
                  })),
                ]}
                variant='subtle'
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

        {/* Reports Content: Loading State vs Empty State vs Live List */}
        {isLoading || (isRefreshing && reports.length === 0) ? (
          <div className='flex-1 min-h-[300px] py-12 px-4 flex flex-col items-center justify-center text-center space-y-3'>
            <div className='w-5 h-5 border-2 border-[#126b70]/20 border-t-[#126b70] rounded-full animate-spin' />
            <span className='text-xs font-medium text-[#66757c]'>
              Memuat laporan warga terkini...
            </span>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty State matching Figma 1:1 */
          <div className='flex-1 min-h-[300px] py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-[#dce2e2] rounded bg-[#fbfcfb]'>
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
          /* Live Thread List (Maksimal tinggi card sejajar dengan card Buletin) */
          <div className='divide-y divide-[#edf0f0] overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0 max-h-[540px]'>
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
                  className='py-3 first:pt-0 space-y-2 cursor-pointer group'
                >
                  {/* Header: Author, District & Depth */}
                  <div className='flex items-center justify-between gap-1.5 flex-wrap'>
                    <div className='text-xs font-bold text-[#173744] group-hover:text-[#126b70] transition-colors truncate'>
                      <span className='capitalize'>{formatAuthorName(report.author)}</span>
                      <span className='text-[#66757c] font-normal text-[11px] ml-1.5'>
                        • {report.district}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${depthColor}`}
                    >
                      {report.depthCategory}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className='text-xs text-[#173744] leading-relaxed'>
                    {report.caption}
                  </p>

                  {/* Direct Photo Preview & Attachments */}
                  {report.imageUrl && (
                    <div
                      className='mt-1.5 overflow-hidden rounded border border-[#dce2e2] bg-[#f5f6f5] max-w-[220px] group/img relative cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(report.imageUrl || null);
                      }}
                      title='Klik untuk melihat foto lebih besar'
                    >
                      <img
                        src={report.imageUrl}
                        alt={`Bukti genangan ${report.district}`}
                        className='w-full h-28 object-cover group-hover/img:scale-105 transition-transform duration-200'
                      />
                      <div className='absolute bottom-1 right-1 bg-[#172d3b]/80 hover:bg-[#126b70] text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs'>
                        <Camera className='w-2.5 h-2.5' />
                        <span>Lihat Penuh</span>
                      </div>
                    </div>
                  )}

                  {report.tiktokLiveUrl && (
                    <div className='pt-0.5'>
                      <a
                        href={report.tiktokLiveUrl}
                        target='_blank'
                        rel='noreferrer'
                        onClick={(e) => e.stopPropagation()}
                        className='inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs'
                      >
                        <Video className='w-3 h-3 text-rose-600' />
                        <span>Live Tiktok</span>
                      </a>
                    </div>
                  )}

                  {/* Bottom Voting Row */}
                  <div className='flex items-center justify-between text-[11px] text-[#66757c] pt-1'>
                    <span>{report.createdAt || 'Hari ini'}</span>

                    <div className='flex items-center gap-1.5'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvote(report.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                          userVote === 'upvote'
                            ? 'bg-[#126b70] text-white shadow-2xs'
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
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                          userVote === 'downvote'
                            ? 'bg-rose-700 text-white shadow-2xs'
                            : 'bg-[#f8faf9] text-[#66757c] hover:text-[#173744] border border-[#dce2e2]'
                        }`}
                        title='Kondisi sudah surut'
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

      {/* Modal Image Preview (Clean, borderless, frameless) */}
      {previewImage && (
        <div
          className='fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 cursor-zoom-out'
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
            alt='Bukti Genangan'
            className='max-w-full max-h-[92vh] object-contain cursor-default select-none shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
