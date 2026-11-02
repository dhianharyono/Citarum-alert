'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface FigmaNavbarProps {
  activeTab: 'pemantauan' | 'buletin' | 'laporan';
  onTabChange: (tab: 'pemantauan' | 'buletin' | 'laporan') => void;
  onOpenReportModal: () => void;
}

export function FigmaNavbar({
  activeTab,
  onTabChange,
  onOpenReportModal,
}: FigmaNavbarProps) {
  return (
    <nav className='w-full bg-white border-b border-[#dce2e2] sticky top-0 z-50'>
      {/* DESKTOP NAVBAR (Height 80px) */}
      <div className='hidden md:flex max-w-[1440px] mx-auto h-20 px-6 lg:px-10 items-center justify-between'>
        {/* Brand Identity */}
        <Link href='/' className='flex items-center gap-3 group'>
          <div className='w-[38px] h-[38px] rounded bg-[#173744] flex items-center justify-center text-white shrink-0 shadow-xs'>
            {/* Wave SVG matching Figma */}
            <svg
              className='w-5 h-4'
              viewBox='0 0 20 14'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M1 4.5C3.5 2 6.5 2 9 4.5C11.5 7 14.5 7 17 4.5C18.2 3.3 19.1 3 19.5 3M1 9.5C3.5 7 6.5 7 9 9.5C11.5 12 14.5 12 17 9.5C18.2 8.3 19.1 8 19.5 8'
                stroke='currentColor'
                strokeWidth='2.2'
                strokeLinecap='round'
              />
            </svg>
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-[22px] leading-tight text-[#173744] tracking-tight'>
              Citarum Alert
            </span>
            <span className='text-[10px] tracking-wider text-[#66757c] font-semibold uppercase mt-0.5'>
              KABUPATEN BANDUNG
            </span>
          </div>
        </Link>

        {/* Center Tabs */}
        <div className='flex items-center gap-8 h-full'>
          <button
            onClick={() => onTabChange('pemantauan')}
            className={`h-full flex items-center text-[15px] font-medium transition-colors relative cursor-pointer ${
              activeTab === 'pemantauan'
                ? 'text-[#126b70] font-semibold'
                : 'text-[#66757c] hover:text-[#173744]'
            }`}
          >
            Pemantauan
            {activeTab === 'pemantauan' && (
              <span className='absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#126b70]' />
            )}
          </button>

          <button
            onClick={() => onTabChange('buletin')}
            className={`h-full flex items-center text-[15px] font-medium transition-colors relative cursor-pointer ${
              activeTab === 'buletin'
                ? 'text-[#126b70] font-semibold'
                : 'text-[#66757c] hover:text-[#173744]'
            }`}
          >
            Buletin wilayah
            {activeTab === 'buletin' && (
              <span className='absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#126b70]' />
            )}
          </button>

          <button
            onClick={() => onTabChange('laporan')}
            className={`h-full flex items-center text-[15px] font-medium transition-colors relative cursor-pointer ${
              activeTab === 'laporan'
                ? 'text-[#126b70] font-semibold'
                : 'text-[#66757c] hover:text-[#173744]'
            }`}
          >
            Laporan warga
            {activeTab === 'laporan' && (
              <span className='absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#126b70]' />
            )}
          </button>
        </div>

        {/* Right CTA Button */}
        <button
          onClick={onOpenReportModal}
          className='h-10 px-4 rounded bg-[#126b70] hover:bg-[#0e5458] text-white font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer'
        >
          <Plus className='w-4 h-4 stroke-[2.5]' />
          <span>Laporkan Banjir</span>
        </button>
      </div>

      {/* MOBILE NAVBAR (Height 126px: Row 1 = 76px, Row 2 = 50px) */}
      <div className='flex md:hidden flex-col'>
        {/* Row 1: Brand & Lapor Action */}
        <div className='h-[74px] px-4 flex items-center justify-between border-b border-[#edf0f0]'>
          <Link href='/' className='flex items-center gap-2.5'>
            <div className='w-[36px] h-[36px] rounded bg-[#173744] flex items-center justify-center text-white shrink-0 shadow-xs'>
              <svg
                className='w-5 h-4'
                viewBox='0 0 20 14'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M1 4.5C3.5 2 6.5 2 9 4.5C11.5 7 14.5 7 17 4.5C18.2 3.3 19.1 3 19.5 3M1 9.5C3.5 7 6.5 7 9 9.5C11.5 12 14.5 12 17 9.5C18.2 8.3 19.1 8 19.5 8'
                  stroke='currentColor'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                />
              </svg>
            </div>
            <div className='flex flex-col'>
              <span className='font-bold text-lg leading-tight text-[#173744]'>
                Citarum Alert
              </span>
              <span className='text-[9px] tracking-wider text-[#66757c] font-semibold uppercase'>
                KABUPATEN BANDUNG
              </span>
            </div>
          </Link>

          <button
            onClick={onOpenReportModal}
            className='h-10 px-3.5 rounded bg-[#126b70] hover:bg-[#0e5458] text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer'
          >
            <Plus className='w-3.5 h-3.5 stroke-[2.5]' />
            <span>Lapor</span>
          </button>
        </div>

        {/* Row 2: Mobile Navigation Tabs (50px) */}
        <div className='h-[48px] px-2 grid grid-cols-3 bg-white'>
          <button
            onClick={() => onTabChange('pemantauan')}
            className={`h-full flex items-center justify-center text-xs transition-colors relative cursor-pointer ${
              activeTab === 'pemantauan'
                ? 'text-[#126b70] font-bold'
                : 'text-[#66757c]'
            }`}
          >
            Pemantauan
            {activeTab === 'pemantauan' && (
              <span className='absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#126b70]' />
            )}
          </button>

          <button
            onClick={() => onTabChange('buletin')}
            className={`h-full flex items-center justify-center text-xs transition-colors relative cursor-pointer ${
              activeTab === 'buletin'
                ? 'text-[#126b70] font-bold'
                : 'text-[#66757c]'
            }`}
          >
            Buletin wilayah
            {activeTab === 'buletin' && (
              <span className='absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#126b70]' />
            )}
          </button>

          <button
            onClick={() => onTabChange('laporan')}
            className={`h-full flex items-center justify-center text-xs transition-colors relative cursor-pointer ${
              activeTab === 'laporan'
                ? 'text-[#126b70] font-bold'
                : 'text-[#66757c]'
            }`}
          >
            Laporan warga
            {activeTab === 'laporan' && (
              <span className='absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#126b70]' />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
