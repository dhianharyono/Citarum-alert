import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FloodReport, WaterDepthCategory } from '@/types';
import { verifyFloodImageWithGemini } from '@/lib/gemini';
import { db, schema } from '@/db';
import { IN_MEMORY_REPORTS, addInMemoryReport, isReportFromToday } from '@/lib/reports-store';
import { uploadToVercelBlob } from '@/lib/blob';

const reportInputSchema = z.object({
  author: z.string().max(60).optional(),
  caption: z.string().min(5, 'Deskripsi laporan minimal 5 karakter').max(280, 'Maksimal 280 karakter'),
  depthCategory: z.enum([
    'Mata Kaki (<20cm)',
    'Selutut (20-50cm)',
    'Sepaha (50-80cm)',
    'Diatas 1 Meter',
  ]),
  depthCmEstimate: z.number().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  district: z.string().min(2),
  imageUrl: z.string().optional(),
  imageBase64: z.string().optional(),
  tiktokLiveUrl: z.string().max(300).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true';

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

        const finalData = includeAll
          ? formatted
          : formatted.filter((r) => isReportFromToday(r.createdAtIso));

        return NextResponse.json({ success: true, data: finalData });
      }
    } catch (err) {
      console.warn('[DB Error] Falling back to in-memory reports:', err);
    }
  }

  const finalInMemory = includeAll
    ? IN_MEMORY_REPORTS
    : IN_MEMORY_REPORTS.filter((r) => isReportFromToday(r.createdAtIso));

  return NextResponse.json({ success: true, data: finalInMemory });
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = reportInputSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { author, caption, depthCategory, depthCmEstimate, lat, lng, district, imageUrl, imageBase64, tiktokLiveUrl } = parsed.data;

    let sanitizedTiktokUrl: string | undefined = undefined;
    if (tiktokLiveUrl && tiktokLiveUrl.trim()) {
      let trimmed = tiktokLiveUrl.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = `https://${trimmed}`;
      }
      sanitizedTiktokUrl = trimmed;
    }

    let isAiVerified = false;
    let aiConfidence: number | undefined;
    let aiVerdict: string | undefined;

    // Run AI Vision verification if photo provided
    const imgPayload = imageBase64 || imageUrl;
    if (imgPayload) {
      try {
        const aiCheck = await verifyFloodImageWithGemini(imgPayload, depthCategory, caption);
        isAiVerified = aiCheck.isFlood && aiCheck.confidence >= 0.7;
        aiConfidence = aiCheck.confidence;
        aiVerdict = aiCheck.explanation;
      } catch (err) {
        console.warn('AI check skipped due to error:', err);
      }
    }

    // Upload to Vercel Blob CDN if configured (fallback to local base64)
    let finalImageUrl = imageUrl || imageBase64 || undefined;
    if (imgPayload) {
      try {
        finalImageUrl = await uploadToVercelBlob(imgPayload);
      } catch (e) {
        console.warn('Vercel Blob upload skipped, using fallback:', e);
      }
    }

    const newReport: FloodReport = {
      id: `rep-${Date.now()}`,
      author: author && author.trim() ? author.trim() : 'Warga Anonim',
      district,
      caption,
      depthCategory,
      depthCmEstimate: depthCmEstimate ?? (
        depthCategory === 'Mata Kaki (<20cm)' ? 15 :
        depthCategory === 'Selutut (20-50cm)' ? 40 :
        depthCategory === 'Sepaha (50-80cm)' ? 65 : 120
      ),
      lat,
      lng,
      imageUrl: finalImageUrl,
      tiktokLiveUrl: sanitizedTiktokUrl,
      upvotes: 1,
      downvotes: 0,
      isAiVerified,
      aiConfidence,
      aiVerdict,
      createdAt: 'Baru saja',
      createdAtIso: new Date().toISOString(),
    };

    // Attempt DB insertion if available
    if (db) {
      try {
        await db.insert(schema.citizenReports).values({
          authorName: newReport.author,
          caption: newReport.caption,
          waterDepthCategory: newReport.depthCategory,
          depthCmEstimate: newReport.depthCmEstimate,
          imageUrl: newReport.imageUrl,
          tiktokLiveUrl: newReport.tiktokLiveUrl,
          latitude: newReport.lat,
          longitude: newReport.lng,
          district: newReport.district,
          upvotesCount: 1,
          downvotesCount: 0,
          isAiVerified: newReport.isAiVerified ?? false,
        });
      } catch (err) {
        console.warn('Failed to insert into DB, kept in memory:', err);
      }
    }

    // Always keep latest at front of in-memory list
    addInMemoryReport(newReport);

    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Laporan genangan berhasil disiarkan.',
    });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    const report = IN_MEMORY_REPORTS.find((r) => r.id === id);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    if (action === 'upvote') {
      report.upvotes += 1;
    } else if (action === 'un-upvote') {
      report.upvotes = Math.max(0, report.upvotes - 1);
    } else if (action === 'downvote') {
      report.downvotes = Math.max(0, (report.downvotes || 0) + 1);
    } else if (action === 'un-downvote') {
      report.downvotes = Math.max(0, (report.downvotes || 0) - 1);
    } else if (action === 'switch-to-upvote') {
      report.upvotes += 1;
      report.downvotes = Math.max(0, (report.downvotes || 0) - 1);
    } else if (action === 'switch-to-downvote') {
      report.upvotes = Math.max(0, report.upvotes - 1);
      report.downvotes = Math.max(0, (report.downvotes || 0) + 1);
    }

    return NextResponse.json({ success: true, data: report });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update vote' }, { status: 500 });
  }
}

