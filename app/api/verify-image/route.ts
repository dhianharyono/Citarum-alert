import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyFloodImageWithGemini } from '@/lib/gemini';
import { WaterDepthCategory } from '@/types';
import { uploadToVercelBlob } from '@/lib/blob';

const verifySchema = z.object({
  image: z.string().min(10, 'Gambar base64 atau URL diperlukan'),
  caption: z.string().optional(),
  depthCategory: z
    .enum([
      'Mata Kaki (<20cm)',
      'Selutut (20-50cm)',
      'Sepaha (50-80cm)',
      'Diatas 1 Meter',
    ])
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let image = '';
    let caption: string | undefined;
    let depthCategory: WaterDepthCategory | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      caption = (formData.get('caption') as string) || undefined;
      depthCategory = (formData.get('depthCategory') as WaterDepthCategory) || undefined;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'File gambar tidak ditemukan dalam formulir' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mime = file.type || 'image/jpeg';
      image = `data:${mime};base64,${buffer.toString('base64')}`;
    } else {
      const body = await req.json();
      const validated = verifySchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json(
          { success: false, errors: validated.error.flatten() },
          { status: 400 }
        );
      }
      image = validated.data.image;
      caption = validated.data.caption;
      depthCategory = validated.data.depthCategory as WaterDepthCategory;
    }

    const result = await verifyFloodImageWithGemini(image, depthCategory, caption);

    let blobUrl: string | undefined;
    try {
      blobUrl = await uploadToVercelBlob(image);
    } catch {
      // fallback
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        url: blobUrl || image,
      },
      verified: result.isFlood && result.confidence >= 0.7,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verify image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal memproses verifikasi gambar',
      },
      { status: 500 }
    );
  }
}
