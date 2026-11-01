import { NextResponse } from 'next/server';
import { fetchLiveAWLRStations } from '@/lib/scraper';

export async function GET() {
  try {
    const stations = await fetchLiveAWLRStations();
    return NextResponse.json({
      success: true,
      data: stations,
      count: stations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching AWLR stations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate river telemetry stations',
      },
      { status: 500 }
    );
  }
}

