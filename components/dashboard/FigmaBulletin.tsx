'use client';

import React from 'react';
import {
  Newspaper,
  AlertTriangle,
  Bike,
  Car,
  Mountain,
} from 'lucide-react';

interface FigmaBulletinProps {
  lastUpdated?: string;
}

export function FigmaBulletin({ lastUpdated }: FigmaBulletinProps) {
  const displayTime = lastUpdated || '1 November 2026, 21:45 WIB';

  const bulletinItems = [
    {
      id: 'dayeuhkolot',
      icon: AlertTriangle,
      iconColor: 'text-[#a9621d]',
      iconBg: 'bg-[#fcf2e4]',
      title: 'Dayeuhkolot, Baleendah & Bojongsoang',
      badge: 'Siaga genangan',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      desc: 'Genangan 20–50 cm saat hujan deras di akses Jembatan Lama Dayeuhkolot / Jl. Raya Andir–Baleendah.',
      action: 'Pengalihan: melalui Jembatan Baru Dayeuhkolot.',
    },
    {
      id: 'kopo',
      icon: Bike,
      iconColor: 'text-[#a9621d]',
      iconBg: 'bg-[#fcf2e4]',
      title: 'Kopo Sayati, Cibaduyut & Katapang',
      badge: 'Roda 2 waspada',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      desc: 'Genangan 30–50 cm saat hujan lebih dari 1 jam.',
      action: 'Pengendara roda dua perlu meningkatkan kewaspadaan.',
    },
    {
      id: 'rancaekek',
      icon: Car,
      iconColor: 'text-[#497665]',
      iconBg: 'bg-[#eaf3f1]',
      title: 'Rancaekek & Majalaya',
      badge: 'Bisa dilewati',
      badgeClass: 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]',
      desc: 'Sisa genangan 10–20 cm di lajur kiri kawasan Kahatex.',
      action: 'Kurangi kecepatan saat melintas.',
    },
    {
      id: 'pangalengan',
      icon: Mountain,
      iconColor: 'text-[#a9621d]',
      iconBg: 'bg-[#fcf2e4]',
      title: 'Pangalengan, Ciwidey, Ibun & Pasirjambu',
      badge: 'Waspada longsor',
      badgeClass: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]',
      desc: 'Potensi longsor di wilayah perbukitan.',
      action: 'Tingkatkan kewaspadaan terutama sore hingga malam.',
    },
  ];

  return (
    <div className="w-full bg-white border border-[#dce2e2] rounded-md overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#dce2e2] flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-bold text-[#173744]">
            Buletin Informasi Terkini Kabupaten Bandung
          </h2>
          <p className="text-xs text-[#66757c] mt-0.5">
            Pembaruan website • {displayTime}
          </p>
        </div>
        <div className="w-8 h-8 rounded bg-[#f8faf9] border border-[#dce2e2] flex items-center justify-center text-[#173744] shrink-0">
          <Newspaper className="w-4 h-4 text-[#126b70]" />
        </div>
      </div>

      {/* Corridor Rows */}
      <div className="divide-y divide-[#dce2e2]">
        {bulletinItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-[#fbfcfb] transition-colors"
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg} ${item.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm text-[#173744]">
                    {item.title}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border tracking-wide uppercase shrink-0 ${item.badgeClass}`}
                  >
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-[#173744] leading-relaxed">
                  {item.desc}
                </p>
                <p className="text-xs font-semibold text-[#173744] mt-0.5 leading-relaxed">
                  {item.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes */}
      <div className="p-4 sm:px-5 bg-[#f8faf9] border-t border-[#dce2e2] space-y-0.5 text-[11px] text-[#66757c]">
        <div>
          Rujukan pada website: Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung &amp; TMC Polresta Bandung.
        </div>
        <div>
          Ringkasan awal November 2026. Bukan verifikasi kondisi lapangan terbaru.
        </div>
      </div>
    </div>
  );
}
