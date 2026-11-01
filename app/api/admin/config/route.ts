import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_TOKEN_VALUE,
  getMaskedGeminiKey,
  setGeminiApiKey,
  getGeminiApiKey,
} from '@/lib/admin-config';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  return token === ADMIN_AUTH_TOKEN_VALUE;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { configured, masked } = getMaskedGeminiKey();
  const currentKey = getGeminiApiKey();

  return NextResponse.json({
    success: true,
    data: {
      geminiConfigured: configured,
      geminiKeyMasked: masked,
      hasKey: !!currentKey,
      model: 'gemini-2.5-flash',
      status: 'Ready',
    },
  });
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { geminiApiKey } = await req.json();

    if (typeof geminiApiKey !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Format API Key tidak valid.' },
        { status: 400 }
      );
    }

    const trimmedKey = geminiApiKey.trim();
    setGeminiApiKey(trimmedKey);

    // Try persisting to .env.local if possible
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(
          /GEMINI_API_KEY=.*/g,
          `GEMINI_API_KEY=${trimmedKey}`
        );
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (e) {
      console.warn('Could not persist GEMINI_API_KEY to .env.local file:', e);
    }

    const { configured, masked } = getMaskedGeminiKey();

    return NextResponse.json({
      success: true,
      message: 'Google Gemini API Key berhasil diperbarui dan aktif seketika.',
      data: {
        geminiConfigured: configured,
        geminiKeyMasked: masked,
      },
    });
  } catch (error) {
    console.error('Error saving admin config:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui konfigurasi.' },
      { status: 500 }
    );
  }
}

