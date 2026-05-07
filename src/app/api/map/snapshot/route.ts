import { NextResponse } from 'next/server';
import { getMapSnapshot } from '@/lib/map';
import type { ApiResponse, MapSnapshot } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await getMapSnapshot();
    const response = NextResponse.json<ApiResponse<MapSnapshot>>({
      success: true,
      data: snapshot,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20');

    return response;
  } catch (error) {
    console.error('Error fetching map snapshot:', error);

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch map snapshot',
      },
      { status: 500 }
    );
  }
}
