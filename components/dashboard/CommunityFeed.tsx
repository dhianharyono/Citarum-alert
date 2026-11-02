'use client';

import React, { useState } from 'react';
import { FloodReport } from '@/types';
import {
  MapPin,
  ThumbsUp,
  Clock,
  Filter,
  CheckCheck,
  Sparkles,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { formatAuthorName } from '@/lib/reports-store';

interface CommunityFeedProps {
  reports: FloodReport[];
  userVotes?: Record<string, 'upvote' | 'downvote'>;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onSelectReport?: (report: FloodReport) => void;
}

export function CommunityFeed({
  reports,
  userVotes = {},
  onUpvote,
  onDownvote,
  onSelectReport,
}: CommunityFeedProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const districts = ['all', ...Array.from(new Set(reports.map((r) => r.district)))];

  const filtered = reports
    .filter((r) => {
      if (selectedDistrict === 'all') return true;
      return r.district === selectedDistrict;
    })
    .sort((a, b) => {
      const timeA = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
      const timeB = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });

  const getDepthBadgeVariant = (depth: string) => {
    if (depth.includes('>1 Meter') || depth.includes('Diatas 1')) return 'awas';
    if (depth.includes('Sepaha')) return 'siaga';
    if (depth.includes('Selutut')) return 'waspada';
    return 'blue';
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Laporan Lapangan Warga
          </h3>
          <p className="text-[11px] text-slate-500">Crowdsourced real-time stream</p>
        </div>

        {/* District Filter Dropdown */}
        <Dropdown
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          options={[
            { value: 'all', label: `Semua Wilayah (${reports.length})` },
            ...districts
              .filter((d) => d !== 'all')
              .map((d) => ({
                value: d,
                label: d,
              })),
          ]}
          size="sm"
          align="right"
          icon={<Filter className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Belum Ada Laporan Genangan</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Feed masih kosong. Klik tombol <strong>Laporkan Banjir</strong> untuk mengirim laporan lapangan manual Anda!
              </p>
            </div>
          </div>
        ) : (
          filtered.map((report) => {
            const isCommunityVerified = report.upvotes >= 5;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport && onSelectReport(report)}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl space-y-2.5 transition duration-150 cursor-pointer shadow-sm"
              >
                {/* Author & Badges (Clean Responsive Layout) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-100 break-words capitalize">
                        {formatAuthorName(report.author)}
                      </span>
                      {report.tiktokLiveUrl && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-400 bg-rose-500/15 border border-rose-500/40 px-1.5 py-0.5 rounded-md whitespace-nowrap animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block"></span>
                          LIVE TIKTOK
                        </span>
                      )}
                      {isCommunityVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          <CheckCheck className="w-3 h-3 text-teal-400 shrink-0" />
                          Terverifikasi Komunitas
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" /> {report.district}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1 whitespace-nowrap pt-0.5">
                    <Clock className="w-3 h-3 shrink-0" /> {report.createdAt}
                  </span>
                </div>

                {/* Caption */}
                <p className="text-xs text-slate-300 leading-relaxed break-words">{report.caption}</p>

                {/* Photo (if uploaded) */}
                {report.imageUrl && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage(report.imageUrl || null);
                    }}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 max-h-44 bg-slate-950"
                  >
                    <img
                      src={report.imageUrl}
                      alt="Bukti foto banjir"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition" />
                  </div>
                )}

                {/* AI Vision Verdict Callout (if verified) */}
                {report.isAiVerified && (
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-2 text-[11px] flex items-start gap-2 text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="leading-tight">
                      <span className="font-bold text-blue-300">Gemini Vision AI: </span>
                      <span className="text-slate-300">
                        {report.aiVerdict || 'Citra terverifikasi memperlihatkan genangan banjir aktif.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* TikTok Live Stream Action Banner (if attached) */}
                {report.tiktokLiveUrl && (
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={report.tiktokLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-pink-950/40 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white transition shadow-sm group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-xs font-bold text-rose-200 group-hover:text-white truncate">
                          Live TikTok Lapangan
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-300 group-hover:text-white shrink-0 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 whitespace-nowrap">
                        Tonton <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  </div>
                )}

                {/* Footer Depth & Community Votes (Responsive Wrap) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <Badge
                    variant={getDepthBadgeVariant(report.depthCategory)}
                    size="sm"
                    className="whitespace-nowrap shrink-0"
                  >
                    {report.depthCategory}
                  </Badge>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Konfirmasi Masih Banjir (Upvote) */}
                    <button
                      onClick={() => onUpvote(report.id)}
                      title={
                        userVotes[report.id] === 'upvote'
                          ? 'Klik untuk membatalkan konfirmasi Anda'
                          : 'Konfirmasi kondisi ini masih banjir'
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer ${
                        userVotes[report.id] === 'upvote'
                          ? 'bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-600/30 font-bold'
                          : 'bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700/60'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 shrink-0 ${
                          userVotes[report.id] === 'upvote' ? 'fill-white text-white' : ''
                        }`}
                      />
                      <span>
                        {report.upvotes}{' '}
                        {userVotes[report.id] === 'upvote' ? 'Dikonfirmasi' : 'Konfirmasi'}
                      </span>
                    </button>

                    {/* Konfirmasi Sudah Surut (Downvote) */}
                    <button
                      onClick={() => onDownvote(report.id)}
                      title={
                        userVotes[report.id] === 'downvote'
                          ? 'Klik untuk membatalkan status surut'
                          : 'Konfirmasi air sudah mulai surut'
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer ${
                        userVotes[report.id] === 'downvote'
                          ? 'bg-rose-600 text-white border border-rose-500 shadow-md shadow-rose-600/30 font-bold'
                          : 'bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700/60'
                      }`}
                    >
                      <span>Surut</span>
                      {report.downvotes && report.downvotes > 0 ? (
                        <span
                          className={`text-[10px] ${
                            userVotes[report.id] === 'downvote'
                              ? 'text-white/90 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          ({report.downvotes})
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <img src={expandedImage} alt="Foto detail" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
