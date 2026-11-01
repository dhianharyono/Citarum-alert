import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyFloodImageWithGemini } from '@/lib/gemini';
import { WaterDepthCategory } from '@/types';

const verifySchema = z.object({
  image: z.string().min(10, 'Gambar base64 atau URL diperlukan'),
  caption: z.string().optional(),
  depthCategory: z.enum([
    'Mata Kaki (<20cm)',
    'Selutut (20-50cm)',
    'Sepaha (50-80cm)',
    'Diatas 1 Meter',
  ]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { image, caption, depthCategory } = validated.data;
    const result = await verifyFloodImageWithGemini(
      image,
      depthCategory as WaterDepthCategory,
      caption
    );

    return NextResponse.json({
      success: true,
      data: result,
      verified: result.isFlood && result.confidence >= 0.7,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verify image error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal verification failure' },
      { status: 500 }
    );
  }
}

