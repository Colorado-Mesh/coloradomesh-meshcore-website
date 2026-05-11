import { NextRequest, NextResponse } from 'next/server';
import { buildLocalWeatherRadarBounds, canUseLocalLiveMapFallback, proxyLiveMapEndpoint, validateWeatherBoundsQuery } from '@/lib/live-map';
import type { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const validation = validateWeatherBoundsQuery(request.nextUrl.searchParams);
  if (!validation.ok) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: validation.error },
      { status: validation.status }
    );
  }

  const result = await proxyLiveMapEndpoint('weather-radar-country-bounds', { query: validation.query });

  if (!result.ok && !canUseLocalLiveMapFallback(result)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: result.error },
      { status: result.status }
    );
  }

  const data = result.ok
    ? result.data
    : buildLocalWeatherRadarBounds(validation.query);

  const response = NextResponse.json<ApiResponse<unknown>>({ success: true, data });
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return response;
}
