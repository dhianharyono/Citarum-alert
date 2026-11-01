import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleGenAI } from '@google/genai';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_TOKEN_VALUE,
  getGeminiApiKey,
} from '@/lib/admin-config';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  return token === ADMIN_AUTH_TOKEN_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const keyToTest = (body.apiKey && typeof body.apiKey === 'string' && body.apiKey.trim())
      ? body.apiKey.trim()
      : getGeminiApiKey();

    if (!keyToTest) {
      return NextResponse.json(
        {
          success: false,
          message: 'API Key Gemini belum diset. Silakan masukkan API Key terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const ai = new GoogleGenAI({ apiKey: keyToTest });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Balas hanya 1 kata: "OK" jika Anda menerima pesan ini untuk tes koneksi CitarumAlert.' },
          ],
        },
      ],
    });

    const elapsed = Date.now() - startTime;
    const replyText = response.text?.trim() || 'OK';

    return NextResponse.json({
      success: true,
      message: `Koneksi ke Google Gemini AI Berhasil! Waktu respon: ${elapsed}ms`,
      details: {
        model: 'gemini-2.5-flash',
        latencyMs: elapsed,
        responseSample: replyText,
      },
    });
  } catch (error: unknown) {
    console.error('Gemini test connection failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: `Koneksi Google Gemini Gagal: ${errorMessage}`,
      },
      { status: 502 }
    );
  }
}

