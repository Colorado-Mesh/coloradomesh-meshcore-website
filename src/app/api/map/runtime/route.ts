import { NextResponse } from 'next/server';
import { getMapPublicRuntimeConfig } from '@/lib/map';
import type { ApiResponse, MapRuntimePublicConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const runtimeConfig = getMapPublicRuntimeConfig();
    const response = NextResponse.json<ApiResponse<MapRuntimePublicConfig>>({
      success: true,
      data: runtimeConfig,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return response;
  } catch (error) {
    console.error('Error fetching map runtime config:', error);

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch map runtime config',
      },
      { status: 500 }
    );
  }
}
