import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  proxyResult: { ok: false, status: 503, error: 'Live-map upstream is not configured' } as
    | { ok: true; status: number; data: unknown }
    | { ok: false; status: number; error: string },
  fallbackAllowed: true,
  proxyLiveMapEndpoint: vi.fn(),
  canUseLocalLiveMapFallback: vi.fn(),
}));

vi.mock('@/lib/map', () => ({
  getMapSnapshot: vi.fn(async () => ({ nodes: [], links: [], routes: [] })),
}));

vi.mock('@/lib/live-map', () => ({
  proxyLiveMapEndpoint: mocks.proxyLiveMapEndpoint,
  canUseLocalLiveMapFallback: mocks.canUseLocalLiveMapFallback,
  validateElevationQuery: vi.fn((query: URLSearchParams) => ({ ok: true, query })),
  validateLosQuery: vi.fn((query: URLSearchParams) => ({ ok: true, query })),
  validatePeerQuery: vi.fn((query: URLSearchParams) => ({ ok: true, query })),
  validateWeatherBoundsQuery: vi.fn((query: URLSearchParams) => ({ ok: true, query })),
  buildLocalCoverage: vi.fn(() => ({ local: 'coverage' })),
  buildLocalElevationSamples: vi.fn(() => ({ local: 'elevations' })),
  buildLocalLineOfSight: vi.fn(() => ({ local: 'los' })),
  buildLocalLiveMapStats: vi.fn(() => ({ local: 'stats' })),
  buildLocalPeerHistory: vi.fn(() => ({ local: 'peers' })),
  buildLocalWeatherRadarBounds: vi.fn(() => ({ local: 'weather' })),
}));

type RouteModule = { GET: (...args: never[]) => Promise<Response> };
type RouteCase = {
  name: string;
  load: () => Promise<RouteModule>;
  call: (handler: RouteModule['GET']) => Promise<Response>;
  expectedLocal: string;
};

const request = (path: string) => new NextRequest(`https://coloradomesh.test${path}`);

const routes: RouteCase[] = [
  {
    name: 'stats',
    load: () => import('../stats/route') as Promise<RouteModule>,
    call: (GET) => GET(),
    expectedLocal: 'stats',
  },
  {
    name: 'coverage',
    load: () => import('../coverage/route') as Promise<RouteModule>,
    call: (GET) => GET(),
    expectedLocal: 'coverage',
  },
  {
    name: 'line of sight',
    load: () => import('../los/route') as Promise<RouteModule>,
    call: (GET) => GET(request('/api/live-map/los?lat1=39&lon1=-105&lat2=40&lon2=-104') as never),
    expectedLocal: 'los',
  },
  {
    name: 'elevations',
    load: () => import('../los/elevations/route') as Promise<RouteModule>,
    call: (GET) => GET(request('/api/live-map/los/elevations?locations=39,-105') as never),
    expectedLocal: 'elevations',
  },
  {
    name: 'weather bounds',
    load: () => import('../weather/radar/country-bounds/route') as Promise<RouteModule>,
    call: (GET) => GET(request('/api/live-map/weather/radar/country-bounds?lat=39&lon=-105') as never),
    expectedLocal: 'weather',
  },
  {
    name: 'peer history',
    load: () => import('../peers/[deviceId]/route') as Promise<RouteModule>,
    call: (GET) => GET(request('/api/live-map/peers/node-1?limit=20') as never, { params: Promise.resolve({ deviceId: 'node-1' }) } as never),
    expectedLocal: 'peers',
  },
];

beforeEach(() => {
  vi.resetModules();
  mocks.proxyResult = { ok: false, status: 503, error: 'Live-map upstream is not configured' };
  mocks.fallbackAllowed = true;
  mocks.proxyLiveMapEndpoint.mockImplementation(async () => mocks.proxyResult);
  mocks.canUseLocalLiveMapFallback.mockImplementation(() => mocks.fallbackAllowed);
});

describe('live-map local fallback routes', () => {
  it.each(routes)('returns local $name data when the proxy result is fallback-eligible', async ({ load, call, expectedLocal }) => {
    const { GET } = await load();
    const response = await call(GET);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: { local: expectedLocal } });
    expect(mocks.canUseLocalLiveMapFallback).toHaveBeenCalledWith(mocks.proxyResult);
  });

  it.each(routes)('preserves non-fallback $name upstream failures', async ({ load, call }) => {
    mocks.proxyResult = { ok: false, status: 401, error: 'Live-map upstream rejected the configured credentials' };
    mocks.fallbackAllowed = false;

    const { GET } = await load();
    const response = await call(GET);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ success: false, error: 'Live-map upstream rejected the configured credentials' });
    expect(mocks.canUseLocalLiveMapFallback).toHaveBeenCalledWith(mocks.proxyResult);
  });
});
