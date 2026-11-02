'use client';

import React from 'react';
import { Info } from 'lucide-react';

export function FigmaFooter() {
  return (
    <footer className="w-full bg-white border-t border-[#dce2e2] mt-8">
      {/* DESKTOP FOOTER */}
      <div className="hidden md:flex max-w-[1440px] mx-auto py-6 px-6 lg:px-10 items-center justify-between">
        <div>
          <div className="font-bold text-sm text-[#173744]">
            Citarum Alert • Kab. Bandung
          </div>
          <div className="text-xs text-[#66757c] mt-0.5">
            Integrasi data hidrologi resmi{' '}
            <a
              href="https://sda.pu.go.id/balai/bbwscitarum/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#126b70] hover:underline font-semibold"
            >
              BBWS Citarum (Kementerian PU) ↗
            </a>
            ,{' '}
            <a
              href="https://bpbd.bandungkab.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#126b70] hover:underline font-semibold"
            >
              BPBD Kab. Bandung ↗
            </a>{' '}
            dan partisipasi warga.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#66757c]">
          <Info className="w-4 h-4 text-[#126b70] shrink-0" />
          <span>Pratinjau informasi, bukan panduan rute atau evakuasi.</span>
        </div>
      </div>

      {/* MOBILE FOOTER */}
      <div className="flex md:hidden flex-col p-5 space-y-2 text-xs text-[#66757c]">
        <div className="font-bold text-sm text-[#173744]">
          Citarum Alert • Kabupaten Bandung
        </div>
        <p className="leading-relaxed">
          Rujukan sensor pada website:{' '}
          <a
            href="https://sda.pu.go.id/balai/bbwscitarum/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#126b70] hover:underline font-semibold"
          >
            BBWS Citarum ↗
          </a>{' '}
          /{' '}
          <a
            href="https://bpbd.bandungkab.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#126b70] hover:underline font-semibold"
          >
            BPBD ↗
          </a>
          . Partisipasi warga terpisah dari data sensor.
        </p>
        <p className="leading-relaxed">
          Informasi pendukung, bukan panduan rute atau evakuasi. Utamakan kondisi lapangan dan arahan petugas.
        </p>
      </div>
    </footer>
  );
}

