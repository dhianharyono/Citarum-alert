'use client';

import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  AlertTriangle,
  Bike,
  Car,
  Mountain,
} from 'lucide-react';
import { SituationalBulletinData, DEFAULT_BULLETIN } from '@/lib/bulletin-store';

interface FigmaBulletinProps {
  bulletin?: SituationalBulletinData | null;
  lastUpdated?: string;
}

function getRegionIconAndStyle(reg: { region?: string; location?: string; status?: string }) {
  const text = `${reg.region || ''} ${reg.location || ''}`.toLowerCase();
  const lowerStatus = (reg.status || '').toLowerCase();

  let Icon = AlertTriangle;
  if (
    text.includes('kopo') ||
    text.includes('sayati') ||
    text.includes('cibaduyut') ||
    text.includes('roda 2') ||
    text.includes('motor')
  ) {
    Icon = Bike;
  } else if (
    text.includes('rancaekek') ||
    text.includes('jalan') ||
    text.includes('majalaya') ||
    text.includes('kahatex') ||
    text.includes('mobil')
  ) {
    Icon = Car;
  } else if (
    text.includes('pangalengan') ||
    text.includes('ciwidey') ||
    text.includes('ibun') ||
    text.includes('lereng') ||
    text.includes('longsor') ||
    text.includes('pasirjambu')
  ) {
    Icon = Mountain;
  }

  let iconBg = 'bg-[#fcf2e4]';
  let iconColor = 'text-[#a9621d]';
  let badgeClass = 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]';

  if (lowerStatus.includes('awas') || lowerStatus.includes('bahaya') || lowerStatus.includes('tergenang parah')) {
    iconBg = 'bg-[#fbeeeb]';
    iconColor = 'text-[#b33e35]';
    badgeClass = 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]';
  } else if (lowerStatus.includes('siaga') || lowerStatus.includes('waspada')) {
    iconBg = 'bg-[#fcf2e4]';
    iconColor = 'text-[#a9621d]';
    badgeClass = 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]';
  } else if (
    lowerStatus.includes('lancar') ||
    lowerStatus.includes('bisa dilewati') ||
    lowerStatus.includes('normal') ||
    lowerStatus.includes('aman')
  ) {
    iconBg = 'bg-[#eaf3f1]';
    iconColor = 'text-[#497665]';
    badgeClass = 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]';
  }

  return { Icon, iconBg, iconColor, badgeClass };
}

export function FigmaBulletin({ bulletin, lastUpdated }: FigmaBulletinProps) {
  const [data, setData] = useState<SituationalBulletinData>(bulletin || DEFAULT_BULLETIN);

  // Sync if props update, or fetch from API if not supplied
  useEffect(() => {
    if (bulletin) {
      setData(bulletin);
      return;
    }
    let isCancelled = false;
    fetch('/api/bulletin')
      .then((r) => r.json())
      .then((res) => {
        if (!isCancelled && res.success && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [bulletin]);

  const displayTime = data.lastUpdated || lastUpdated || '1 November 2026, 21:45 WIB';
  const regionsList = Array.isArray(data.regions) && data.regions.length > 0 ? data.regions : DEFAULT_BULLETIN.regions;

  return (
    <div className="w-full bg-white border border-[#dce2e2] rounded-md overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#dce2e2] flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-bold text-[#173744]">
            {data.title || 'Buletin Informasi Terkini Kabupaten Bandung'}
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
        {regionsList.map((item, idx) => {
          const { Icon, iconBg, iconColor, badgeClass } = getRegionIconAndStyle(item);
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-[#fbfcfb] transition-colors"
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${iconBg} ${iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm text-[#173744]">
                    {item.location || item.region}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border tracking-wide uppercase shrink-0 ${badgeClass}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-[#173744] leading-relaxed">
                  {item.condition}
                </p>
                {item.region && item.region !== item.location && (
                  <p className="text-[11px] text-[#66757c] mt-0.5 font-medium">
                    Kawasan: {item.region}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes */}
      <div className="p-4 sm:px-5 bg-[#f8faf9] border-t border-[#dce2e2] space-y-0.5 text-[11px] text-[#66757c]">
        <div>
          Rujukan pada website: {data.sources || 'Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung & TMC Polresta Bandung.'}
        </div>
        <div>
          {data.period || 'Ringkasan November 2026'}. {data.mitigationNotice || 'Bukan verifikasi kondisi lapangan terbaru.'}
        </div>
      </div>
    </div>
  );
}
