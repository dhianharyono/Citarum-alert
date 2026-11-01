import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBulletin } from '@/lib/bulletin-store';

export async function GET(req: NextRequest) {
  // Reading req ensures dynamic evaluation with cacheComponents enabled
  const _ = req.nextUrl;
  return NextResponse.json(
    {
      success: true,
      data: getCurrentBulletin(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

