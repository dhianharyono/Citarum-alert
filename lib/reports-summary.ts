import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/lib/admin-config';
import { FloodReport, CitizenReportsAiSummary } from '@/types';

/**
 * Depth category weights to determine maximum reported depth
 */
const DEPTH_RANKS: Record<string, number> = {
  'Mata Kaki (<20cm)': 1,
  'Selutut (20-50cm)': 2,
  'Sepaha (50-80cm)': 3,
  'Diatas 1 Meter': 4,
};

/**
 * Synthesizes an intelligent, actionable situational summary from citizen flood reports.
 * Uses Gemini Flash (gemini-2.5-flash) if API key is configured, with robust heuristic fallback.
 */
export async function generateCitizenReportsAiSummary(
  reports: FloodReport[]
): Promise<CitizenReportsAiSummary> {
  const now = new Date();
  const timeStr = `${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

  // Empty state if no reports are available
  if (!reports || reports.length === 0) {
    return {
      headline: 'Belum Ada Laporan Genangan Masuk Hari Ini',
      summary:
        'Saat ini belum ada kiriman laporan banjir dari warga untuk hari ini. Kondisi jalan dan permukiman terpantau normal atau belum dilaporkan. Tetap waspada terhadap perubahan cuaca dan debit sungai resmi.',
      keyHotspots: [],
      highestDepth: 'Normal / Nihil',
      totalAnalyzed: 0,
      urgentNote:
        'Melihat genangan air di perjalanan Anda? Gunakan tombol "Laporkan Banjir" untuk memandu warga dan komuter lainnya.',
      generatedAt: timeStr,
    };
  }

  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const reportsSnippet = reports.slice(0, 20).map((r, i) => ({
        no: i + 1,
        kecamatan: r.district,
        kedalaman: r.depthCategory,
        estimasiCm: r.depthCmEstimate,
        keterangan: r.caption,
        waktu: r.createdAt || 'Hari ini',
        upvotes: r.upvotes,
      }));

      const prompt = `
Anda adalah AI Spesialis Analis Situasi Darurat Banjir Citarum Alert untuk wilayah Kabupaten Bandung.
Berikut adalah data laporan genangan langsung dari warga di lapangan hari ini:
${JSON.stringify(reportsSnippet, null, 2)}

Tugas Anda:
Analisis dan rangkum seluruh laporan warga di atas menjadi ringkasan kondisi terkini yang jelas, akurat, dan sangat bermanfaat bagi masyarakat serta komuter yang akan melintas.

Kembalikan HANYA format JSON valid tanpa tanda petik backtick markdown (\`\`\`json):
{
  "headline": "Judul ringkas situasi terkini (maksimal 8-10 kata, mencerminkan wilayah terdampak utama)",
  "summary": "Paragraf ringkasan narasi menyeluruh (2-3 kalimat lugas mengenai kondisi genangan, tren air, dan dampaknya)",
  "keyHotspots": [
    {
      "district": "Nama Kecamatan Utama",
      "condition": "Ringkasan kondisi genangan dan dampaknya di kecamatan ini (1 kalimat)",
      "depthLevel": "Mata Kaki (<20cm)" | "Selutut (20-50cm)" | "Sepaha (50-80cm)" | "Diatas 1 Meter"
    }
  ],
  "highestDepth": "Ketinggian genangan tertinggi yang dilaporkan warga",
  "urgentNote": "Pesan keselamatan penting atau imbauan rute alternatif bagi pengendara / warga setempat",
  "totalAnalyzed": ${reports.length}
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.summary && parsed.headline) {
        return {
          headline: parsed.headline,
          summary: parsed.summary,
          keyHotspots: Array.isArray(parsed.keyHotspots) ? parsed.keyHotspots : [],
          highestDepth: parsed.highestDepth || getHighestDepthCategory(reports),
          totalAnalyzed: reports.length,
          urgentNote: parsed.urgentNote || 'Pilih rute bebas genangan dan jangan memaksakan melintas air deras.',
          generatedAt: timeStr,
        };
      }
    } catch (err) {
      console.warn('[Gemini AI] Reports summary generation failed, falling back to heuristic:', err);
    }
  }

  // Fallback heuristic synthesis
  return generateFallbackSummary(reports, timeStr);
}

/**
 * Computes highest depth category among reports
 */
function getHighestDepthCategory(reports: FloodReport[]): string {
  let highestRank = 0;
  let highestCat = 'Mata Kaki (<20cm)';

  for (const r of reports) {
    const rank = DEPTH_RANKS[r.depthCategory] || 1;
    if (rank > highestRank) {
      highestRank = rank;
      highestCat = r.depthCategory;
    }
  }

  return highestCat;
}

/**
 * Deterministic fallback situational synthesizer based on real report data
 */
function generateFallbackSummary(
  reports: FloodReport[],
  timeStr: string
): CitizenReportsAiSummary {
  const highestDepth = getHighestDepthCategory(reports);

  // Group by district
  const districtMap: Record<string, FloodReport[]> = {};
  for (const r of reports) {
    if (!districtMap[r.district]) {
      districtMap[r.district] = [];
    }
    districtMap[r.district].push(r);
  }

  const sortedDistricts = Object.entries(districtMap).sort(
    (a, b) => b[1].length - a[1].length
  );

  const topDistrictNames = sortedDistricts.slice(0, 3).map(([name]) => name);
  const headline =
    topDistrictNames.length > 0
      ? `Genangan Terpantau di ${topDistrictNames.join(', ')}`
      : `${reports.length} Titik Genangan Dilaporkan Warga`;

  // Build summary text
  const totalReports = reports.length;
  const verifiedCount = reports.filter((r) => r.isAiVerified).length;
  const verifiedNote =
    verifiedCount > 0 ? ` (${verifiedCount} diantaranya telah diverifikasi foto)` : '';

  const summary = `Berdasarkan rangkuman ${totalReports} laporan warga terkini${verifiedNote}, genangan tertinggi tercatat pada kategori ${highestDepth}. Wilayah yang paling banyak dilaporkan meliputi ${topDistrictNames.join(', ')}. Pengendara dan warga di sekitar bantaran dihimbau mengantisipasi perlambatan arus lalu lintas.`;

  // Build key hotspots
  const keyHotspots = sortedDistricts.slice(0, 4).map(([district, distReports]) => {
    const highestInDist = getHighestDepthCategory(distReports);
    const sampleCaption = distReports[0]?.caption || 'Genangan air dilaporkan di jalan permukiman/arteri.';
    const shortCondition =
      sampleCaption.length > 90 ? `${sampleCaption.slice(0, 87)}...` : sampleCaption;

    return {
      district,
      condition: shortCondition,
      depthLevel: highestInDist,
    };
  });

  const urgentNote =
    highestDepth === 'Diatas 1 Meter' || highestDepth === 'Sepaha (50-80cm)'
      ? 'Akses jalan tertentu tidak disarankan untuk motor/kendaraan kecil. Pantau jalur alternatif dan sensor sungai resmi.'
      : 'Kondisi genangan dapat dilalui dengan hati-hati. Kurangi kecepatan saat melintasi genangan air di lajur kiri.';

  return {
    headline,
    summary,
    keyHotspots,
    highestDepth,
    totalAnalyzed: totalReports,
    urgentNote,
    generatedAt: timeStr,
  };
}

