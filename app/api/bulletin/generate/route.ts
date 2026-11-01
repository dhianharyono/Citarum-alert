import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/lib/admin-config';
import { updateCurrentBulletin, SituationalBulletinData, DEFAULT_BULLETIN } from '@/lib/bulletin-store';

export async function POST() {
  const apiKey = getGeminiApiKey();
  const nowStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Anda adalah Editor Informasi Kebencanaan & Transportasi resmi CitarumAlert untuk seluruh wilayah Kabupaten Bandung, Jawa Barat.
Buat buletin laporan situasi komprehensif se-Kabupaten Bandung untuk periode November 2026 berdasarkan peringatan BPBD Kab. Bandung, BMKG Jabar, dan pantauan TMC Lalu Lintas.

Cakupan harus mencakup 4 zona utama:
1. Bandung Selatan (Dayeuhkolot, Baleendah, Bojongsoang - bantaran Citarum)
2. Arteri Barat (Kopo, Cibaduyut, Katapang, Soreang)
3. Bandung Timur (Rancaekek Kahatex, Majalaya, Cikeruh)
4. Dataran Tinggi / Lereng (Peringatan potensi longsor 25 kecamatan BPBD di Pangalengan, Ciwidey, Ibun)

Kembalikan HANYA format JSON valid tanpa backtick markdown:
{
  "title": "Buletin Informasi Terkini Kabupaten Bandung",
  "period": "Update November 2026",
  "leadSummary": "Paragraf ringkasan situasi bencana hidrometeorologi, status cuaca, dan kondisi umum jalan se-Kabupaten Bandung (2-3 kalimat lugas dan profesional).",
  "regions": [
    {
      "region": "Bandung Selatan (Bantaran Citarum)",
      "location": "Dayeuhkolot, Baleendah & Bojongsoang",
      "condition": "Uraian kondisi genangan, debit air, dan status keterlintasan kendaraan.",
      "status": "Siaga Genangan"
    },
    {
      "region": "Koridor Arteri Barat",
      "location": "Kopo Sayati, Cibaduyut & Katapang",
      "condition": "Uraian kondisi genangan jalan komuter dan rekomendasi alternatif.",
      "status": "Roda 2 Waspada"
    },
    {
      "region": "Bandung Timur",
      "location": "Rancaekek & Majalaya",
      "condition": "Uraian kondisi jalur nasional Bandung-Garut dan luapan anak sungai.",
      "status": "Bisa Dilewati"
    },
    {
      "region": "Wilayah Lereng & Dataran Tinggi",
      "location": "Pangalengan, Ciwidey, Ibun & Pasirjambu",
      "condition": "Peringatan BPBD mengenai potensi longsor tanah dan kewaspadaan jalan berbukit.",
      "status": "Waspada Longsor"
    }
  ],
  "mitigationNotice": "Himbauan keselamatan resmi bagi warga dan pengendara yang melintas di wilayah Kabupaten Bandung.",
  "sources": "Pusdalops BPBD Kabupaten Bandung, BMKG Stasiun Geofisika Bandung & TMC Polresta Bandung"
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

      const raw = response.text || '';
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.leadSummary && Array.isArray(parsed.regions)) {
        const newBulletin: SituationalBulletinData = {
          title: parsed.title || 'Buletin Informasi Terkini Kabupaten Bandung',
          period: parsed.period || 'November 2026',
          leadSummary: parsed.leadSummary,
          regions: parsed.regions,
          mitigationNotice: parsed.mitigationNotice || DEFAULT_BULLETIN.mitigationNotice,
          sources: parsed.sources || DEFAULT_BULLETIN.sources,
          lastUpdated: `${nowStr} WIB`,
        };

        updateCurrentBulletin(newBulletin);

        return NextResponse.json({
          success: true,
          message: 'Berita situasi se-Kabupaten Bandung berhasil diperbarui.',
          data: newBulletin,
        });
      }
    } catch (err) {
      console.warn('Gemini bulletin generation error, using curated template:', err);
    }
  }

  // Fallback update
  const updatedFallback: SituationalBulletinData = {
    ...DEFAULT_BULLETIN,
    lastUpdated: `${nowStr} WIB`,
  };
  updateCurrentBulletin(updatedFallback);

  return NextResponse.json({
    success: true,
    message: 'Berita situasi berhasil diperbarui.',
    data: updatedFallback,
  });
}
