import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { IN_MEMORY_REPORTS, isReportFromToday } from '@/lib/reports-store';
import { FloodReport, WaterDepthCategory } from '@/types';
import { generateCitizenReportsAiSummary } from '@/lib/reports-summary';

async function getActiveReports(includeAll: boolean = false): Promise<FloodReport[]> {
  if (db) {
    try {
      const dbReports = await db.select().from(schema.citizenReports);
      if (dbReports.length > 0) {
        const formatted: FloodReport[] = dbReports.map((r) => ({
          id: r.id,
          author: r.authorName,
          district: r.district,
          caption: r.caption,
          depthCategory: r.waterDepthCategory as WaterDepthCategory,
          depthCmEstimate: r.depthCmEstimate ?? undefined,
          lat: r.latitude,
          lng: r.longitude,
          imageUrl: r.imageUrl ?? undefined,
          tiktokLiveUrl: (r as unknown as { tiktokLiveUrl?: string }).tiktokLiveUrl ?? undefined,
          upvotes: r.upvotesCount,
          downvotes: r.downvotesCount,
          isAiVerified: r.isAiVerified,
          createdAt: r.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          createdAtIso: r.createdAt.toISOString(),
        }));

        const filtered = includeAll
          ? formatted
          : formatted.filter((r) => isReportFromToday(r.createdAtIso));

        // If no reports today, fallback to all available so user has insights
        const finalReports = filtered.length > 0 ? filtered : formatted;

        return finalReports.sort((a, b) => {
          const timeA = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
          const timeB = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
          if (timeA && timeB && timeA !== timeB) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });
      }
    } catch (err) {
      console.warn('[DB Error] Falling back to in-memory reports for summary:', err);
    }
  }

  const filtered = includeAll
    ? IN_MEMORY_REPORTS
    : IN_MEMORY_REPORTS.filter((r) => isReportFromToday(r.createdAtIso));

  const finalInMemory = filtered.length > 0 ? filtered : IN_MEMORY_REPORTS;

  return [...finalInMemory].sort((a, b) => {
    const timeA = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
    const timeB = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
    if (timeA && timeB && timeA !== timeB) return timeB - timeA;
    return b.id.localeCompare(a.id);
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true';

  try {
    const reports = await getActiveReports(includeAll);
    const summary = await generateCitizenReportsAiSummary(reports);

    return NextResponse.json(
      { success: true, data: summary },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Reports summary GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat rangkuman AI laporan warga' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let rawBody: { reports?: FloodReport[] } = {};
    try {
      rawBody = await req.json();
    } catch {
      // Body may be empty
    }

    const reports =
      rawBody.reports && Array.isArray(rawBody.reports)
        ? rawBody.reports
        : await getActiveReports(true);

    const summary = await generateCitizenReportsAiSummary(reports);

    return NextResponse.json(
      { success: true, data: summary },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Reports summary POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghasilkan rangkuman AI' },
      { status: 500 }
    );
  }
}

