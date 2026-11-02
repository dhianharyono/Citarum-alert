import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_TOKEN_VALUE } from '@/lib/admin-config';
import { deleteReportById, toggleReportVerification, IN_MEMORY_REPORTS, formatAuthorName } from '@/lib/reports-store';
import { db, schema } from '@/db';
import { eq, desc, lt } from 'drizzle-orm';
import { deleteFromVercelBlob } from '@/lib/blob';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  return token === ADMIN_AUTH_TOKEN_VALUE;
}

// GET all reports for admin (all time)
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (db) {
    try {
      const dbReports = await db
        .select()
        .from(schema.citizenReports)
        .orderBy(desc(schema.citizenReports.createdAt));

      if (dbReports.length > 0) {
        const formatted = dbReports.map((r) => ({
          id: r.id,
          author: formatAuthorName(r.authorName),
          district: r.district,
          caption: r.caption,
          depthCategory: r.waterDepthCategory,
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
        return NextResponse.json({ success: true, data: formatted });
      }
    } catch (err) {
      console.warn('[Admin DB Error] Using in-memory reports:', err);
    }
  }

  return NextResponse.json({ success: true, data: IN_MEMORY_REPORTS });
}

// DELETE a report or cleanup old reports (e.g. olderThanDays=7)
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const olderThanDays = searchParams.get('olderThanDays');

    // Case 1: Bulk cleanup by retention days (e.g. ?olderThanDays=7)
    if (olderThanDays) {
      const days = parseInt(olderThanDays, 10);
      if (isNaN(days) || days < 0) {
        return NextResponse.json(
          { success: false, message: 'Parameter olderThanDays harus berupa angka positif.' },
          { status: 400 }
        );
      }

      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      if (db) {
        try {
          const staleReports = await db
            .select()
            .from(schema.citizenReports)
            .where(lt(schema.citizenReports.createdAt, cutoffDate));

          for (const rep of staleReports) {
            if (rep.imageUrl) {
              await deleteFromVercelBlob(rep.imageUrl).catch(() => {});
            }
          }

          if (staleReports.length > 0) {
            await db
              .delete(schema.citizenReports)
              .where(lt(schema.citizenReports.createdAt, cutoffDate));
          }
          deletedCount = staleReports.length;
        } catch (err) {
          console.warn('[Admin Bulk Cleanup DB error]:', err);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Pembersihan berhasil. ${deletedCount} laporan yang lebih dari ${days} hari telah dihapus.`,
        deletedCount,
      });
    }

    // Case 2: Single report deletion by ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parameter id laporan atau olderThanDays wajib diisi.' },
        { status: 400 }
      );
    }

    let deletedFromDb = false;
    if (db) {
      try {
        const existing = await db
          .select()
          .from(schema.citizenReports)
          .where(eq(schema.citizenReports.id, id));

        if (existing[0]?.imageUrl) {
          await deleteFromVercelBlob(existing[0].imageUrl).catch(() => {});
        }

        await db.delete(schema.citizenReports).where(eq(schema.citizenReports.id, id));
        deletedFromDb = true;
      } catch (err) {
        console.warn('DB delete error:', err);
      }
    }

    const deletedFromMemory = deleteReportById(id);

    return NextResponse.json({
      success: true,
      message: `Laporan #${id} berhasil dihapus oleh admin.`,
      deleted: deletedFromDb || deletedFromMemory,
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus laporan.' },
      { status: 500 }
    );
  }
}

// PATCH toggle verification
export async function PATCH(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isAiVerified } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parameter id laporan wajib disertakan.' },
        { status: 400 }
      );
    }

    if (db) {
      try {
        await db
          .update(schema.citizenReports)
          .set({ isAiVerified: Boolean(isAiVerified) })
          .where(eq(schema.citizenReports.id, id));
      } catch (err) {
        console.warn('DB update verification error:', err);
      }
    }

    toggleReportVerification(id);

    return NextResponse.json({
      success: true,
      message: `Status verifikasi laporan #${id} diperbarui.`,
    });
  } catch (error) {
    console.error('Error updating report verification:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengubah status verifikasi laporan.' },
      { status: 500 }
    );
  }
}
