import { NextResponse } from 'next/server';
import { buildLocalCoverage, canUseLocalLiveMapFallback, proxyLiveMapEndpoint } from '@/lib/live-map';
import { getMapSnapshot } from '@/lib/map';
import type { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await proxyLiveMapEndpoint('coverage');

  if (!result.ok && !canUseLocalLiveMapFallback(result)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: result.error },
      { status: result.status }
    );
  }

  const data = result.ok
    ? result.data
    : buildLocalCoverage(await getMapSnapshot());

  const response = NextResponse.json<ApiResponse<unknown>>({ success: true, data });
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return response;
}
