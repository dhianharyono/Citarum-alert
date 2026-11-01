# 🌊 CitarumAlert (Pantau Banjir & Siaga Warga Kab. Bandung)

Platform *live public dashboard* & *crowdsourcing* tanggap banjir Kabupaten Bandung yang menggabungkan sensor sungai resmi (**AWLR BBWS Citarum & BPBD**) dan laporan lapangan warga terverifikasi **Google Gemini Flash Vision AI**.

---

## Fitur Utama

1. **Interactive Spatial Map (Leaflet)**
   - Visualisasi posisi stasiun AWLR dengan indikator warna dinamis:
     - 🟢 **Normal**
     - 🟡 **Waspada**
     - 🟠 **Siaga** (disertai efek gelombang radar)
     - 🔴 **Awas** (peringatan bahaya luapan)
   - Titik laporan warga berdasarkan kedalaman genangan: *Mata Kaki*, *Selutut*, *Sepaha*, atau *> 1 Meter*.
   - Filter cepat dan tombol fokus area cekungan rawan: *Dayeuhkolot & Baleendah*, *Bojongsoang*, *Kopo - Katapang*, *Rancaekek*.

2. **Telemetri Debit Air Resmi (AWLR BBWS / BPBD)**
   - Menampilkan status live TMA (Tinggi Muka Air) dan ambang batas siaga:
     - Stasiun Dayeuhkolot (Sungai Citarum)
     - Bendung Wanir (Sungai Cisangkuy)
     - Jembatan Cikeruh (Sungai Cikeruh)
     - Stasiun Majalaya (Sungai Citarum Hulu)
     - Jembatan Bojongsoang (Sungai Cikapundung - Citarum)
     - Kamasan Banjaran (Sungai Cisangkuy Hilir)
     - Curug Jompong / Nanjung (Sungai Citarum Hilir)
   - Penghitungan persentase kapasitas ambang siaga.

3. **Status Keterlintasan Jalur Arteri (Komuter Bandung Raya)**
   - Jalur Kopo Sayati - Bihbul (Katapang)
   - Jalur Dayeuhkolot - Baleendah (Jembatan Lama)
   - Jalur Jl. Moh. Toha (Palasari)
   - Jalur Rancaekek Dangdeur (Depan Kahatex)
   - Jalur Majalaya - Sapan
   - Rekomendasi jalur alternatif bagi pengendara motor dan armada logistik.

4. **Crowdsourced Citizen Reports & Community Trust Score**
   - Warga dapat melaporkan kondisi banjir langsung dari ponsel atau laptop.
   - Pilihan ketinggian air: *Mata Kaki (<20cm)*, *Selutut (20-50cm)*, *Sepaha (50-80cm)*, *Diatas 1 Meter*.
   - Deteksi otomatis koordinat GPS.
   - Sistem voting konfirmasi: **"Masih Banjir"** / **"Sudah Surut"**. Laporan dengan ≥ 5 konfirmasi otomatis memperoleh lencana **"Terverifikasi Komunitas"**.

5. **AI Vision Verification (Google Gemini Flash)**
   - Foto bukti lapangan dianalisis secara cerdas oleh model `@google/genai` (Gemini Flash).
   - Menghasilkan analisis visual: verifikasi genangan air, estimasi kecocokan ketinggian, dan penjelasan kondisi objek terendam.

---

## Tech Stack

- **Core:** Next.js (App Router, Server Actions, Route Handlers)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS + Lucide React
- **Peta Spasial:** Leaflet & React Leaflet (Carto Voyager Tiles)
- **Database / ORM:** Drizzle ORM + PostgreSQL / PostGIS (dengan in-memory fallback instan untuk demo langsung)
- **AI Vision:** Google Gemini Flash API (`@google/genai`)
- **Validasi Skema:** Zod

---

## Cara Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
```bash
cd citarum-alert
```

### 2. Konfigurasi Environment Variable
Buat file `.env.local` pada root project jika ingin menghubungkan Google Gemini Flash AI, Neon PostgreSQL, dan Vercel Blob:
```env
GEMINI_API_KEY=""
DATABASE_URL=""
BLOB_READ_WRITE_TOKEN=""
ADMIN_USERNAME=""
ADMIN_PASSWORD=""
```
*(Aplikasi juga dilengkapi in-memory store dan data telemetri bawaan sehingga dapat langsung dijalankan untuk pengujian lokal)*

### 3. Jalankan Development Server
```bash
npm run dev
```
*(Di Windows PowerShell: gunakan `npm.cmd run dev` jika PowerShell memiliki kebijakan skrip terbatas)*

### 4. Buka di Browser
Buka peramban di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## Struktur Direktori

```text
citarum-alert/
├── app/
│   ├── api/
│   │   ├── reports/route.ts         # Endpoint posting, fetching & voting laporan warga
│   │   ├── stations/route.ts        # Aggregator telemetri AWLR BBWS/BPBD & koridor jalan
│   │   └── verify-image/route.ts    # AI Vision check via Gemini Flash API
│   ├── layout.tsx                   # Layout utama + CDN leaflet styles
│   ├── page.tsx                     # Dashboard utama (peta interaktif, telemetri, live feed)
│   └── globals.css                  # Tailwind styles & popup overrides
├── components/
│   ├── map/
│   │   ├── FloodMap.tsx             # Interactive Leaflet Container & filter controls
│   │   └── StationMarker.tsx        # Dynamic colored pins & radar animations
│   ├── dashboard/
│   │   ├── TelemetryPanel.tsx       # Live status TMA stasiun & status jalan arteri
│   │   ├── CommunityFeed.tsx        # Micro-report stream & voting komunitas
│   │   └── ReportFormModal.tsx      # GPS-enabled reporting form & AI photo preview
│   └── ui/
│       ├── Button.tsx               # Reusable styled buttons with loading state
│       ├── Badge.tsx                # Dynamic status color badges
│       └── Modal.tsx                # Accessible popup dialog wrapper
├── db/
│   ├── schema.ts                    # Drizzle schema (awlr_stations, citizen_reports)
│   └── index.ts                     # Database connection instance with fallback
├── lib/
│   ├── scraper.ts                   # Fetcher & parser telemetri AWLR BBWS/BPBD
│   └── gemini.ts                    # Google Gemini Flash vision helper
└── types/
    ├── index.ts                     # Interfaces (AWLRStation, FloodReport, RoadCorridor)
    └── flood.ts                     # Type re-exports
```
