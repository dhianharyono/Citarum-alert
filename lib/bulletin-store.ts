export interface RegionSituation {
  region: string;
  location: string;
  condition: string;
  status: string;
}

export interface SituationalBulletinData {
  title: string;
  period: string;
  leadSummary: string;
  regions: RegionSituation[];
  mitigationNotice: string;
  sources: string;
  lastUpdated: string;
}

export const DEFAULT_BULLETIN: SituationalBulletinData = {
  title: 'Buletin Informasi Terkini Kabupaten Bandung',
  period: 'Awal November 2026',
  leadSummary:
    'Memasuki puncak musim penghujan awal November 2026, Badan Penanggulangan Bencana Daerah (BPBD) Kabupaten Bandung menetapkan 25 kecamatan dalam status waspada potensi bencana hidrometeorologi. Pantauan lapangan menunjukkan beberapa titik arteri komuter dan bantaran sungai utama mengalami perlambatan arus akibat genangan air serta limpasan drainase.',
  regions: [
    {
      region: 'Bandung Selatan (Bantaran Citarum)',
      location: 'Dayeuhkolot, Baleendah & Bojongsoang',
      condition:
        'Tinggi Muka Air (TMA) Sungai Citarum di Stasiun Dayeuhkolot berada pada level siaga (685 cm). Akses Jembatan Lama Dayeuhkolot dan ruas Jl. Raya Andir-Baleendah tergenang 20-50 cm saat hujan deras, kendaraan dialihkan melalui Jembatan Baru Dayeuhkolot.',
      status: 'Siaga Genangan',
    },
    {
      region: 'Koridor Arteri Barat',
      location: 'Kopo Sayati, Cibaduyut & Katapang',
      condition:
        'Ruas Jl. Kopo-Sayati dan akses terusan Cibaduyut masih menjadi titik rawan antrean. Genangan 30-50 cm terjadi saat intensitas hujan lebih dari 1 jam. Roda dua dianjurkan memanfaatkan jalur alternatif Tol Soroja atau jalur Sukamenak.',
      status: 'Roda 2 Waspada',
    },
    {
      region: 'Bandung Timur',
      location: 'Rancaekek & Majalaya',
      condition:
        'Jalur Nasional Bandung-Garut (kawasan PT Kahatex Rancaekek) terpantau basah dengan sisa genangan lajur kiri setinggi 10-20 cm, kendaraan masih dapat melintas normal dengan kurangi kecepatan. Sungai Cikeruh dalam pengawasan intensif.',
      status: 'Bisa Dilewati',
    },
    {
      region: 'Wilayah Lereng & Dataran Tinggi',
      location: 'Pangalengan, Ciwidey, Ibun & Pasirjambu',
      condition:
        'BPBD menghimbau kewaspadaan ekstra terhadap potensi longsor dan pergerakan tanah di jalur perbukitan wisata dan penghubung antar-kecamatan terutama pada sore hingga malam hari.',
      status: 'Waspada Longsor',
    },
  ],
  mitigationNotice:
    'Masyarakat dan komuter yang melintasi wilayah cekungan Bandung Selatan dihimbau memantau sensor debit sungai real-time, menghindari berteduh di bawah lereng curam, serta memilih jalur bebas genangan saat curah hujan meningkat.',
  sources: 'Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung & TMC Polresta Bandung',
  lastUpdated: '1 November 2026, 21:45 WIB',
};

// Safe Node.js modules resolver (avoids breaking client-side webpack builds)
function getFs() {
  if (typeof window === 'undefined') {
    try {
      return require('fs');
    } catch {
      return null;
    }
  }
  return null;
}

function getPath() {
  if (typeof window === 'undefined') {
    try {
      return require('path');
    } catch {
      return null;
    }
  }
  return null;
}

// Preserve bulletin in globalThis across Next.js API routes & dev module reloads
const globalForBulletin = globalThis as unknown as {
  currentBulletin?: SituationalBulletinData;
};

export function getCurrentBulletin(): SituationalBulletinData {
  if (globalForBulletin.currentBulletin) {
    return globalForBulletin.currentBulletin;
  }

  // Try reading from persisted cache file on disk
  const fs = getFs();
  const path = getPath();
  if (fs && path) {
    try {
      const cachePath = path.join(process.cwd(), '.bulletin-cache.json');
      if (fs.existsSync(cachePath)) {
        const fileContent = fs.readFileSync(cachePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && parsed.title && Array.isArray(parsed.regions)) {
          globalForBulletin.currentBulletin = parsed;
          return parsed;
        }
      }
    } catch {
      // Fallback to default
    }
  }

  globalForBulletin.currentBulletin = { ...DEFAULT_BULLETIN };
  return globalForBulletin.currentBulletin;
}

export function updateCurrentBulletin(newBulletin: SituationalBulletinData): void {
  globalForBulletin.currentBulletin = newBulletin;

  // Persist to disk cache
  const fs = getFs();
  const path = getPath();
  if (fs && path) {
    try {
      const cachePath = path.join(process.cwd(), '.bulletin-cache.json');
      fs.writeFileSync(cachePath, JSON.stringify(newBulletin, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in read-only serverless filesystems
    }
  }
}
