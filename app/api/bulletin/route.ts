import { NextResponse } from 'next/server';
import { getCurrentBulletin } from '@/lib/bulletin-store';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getCurrentBulletin(),
  });
}

