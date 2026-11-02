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
        'Tinggi Muka Air (TMA) Sungai Citarum di Stasiun Dayeuhkolot terpantau pada level normal (388 cm / 3.88 m). Akses Jembatan Dayeuhkolot dan ruas Jl. Raya Andir-Baleendah saat ini terpantau lancar dan terkendali.',
      status: 'Bisa Dilewati',
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
