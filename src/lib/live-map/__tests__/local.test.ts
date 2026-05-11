import { describe, expect, it } from 'vitest';
import { buildSampleMapSnapshot } from '@/lib/map/sample-data';

import {
  buildLocalCoverage,
  buildLocalElevationSamples,
  buildLocalLineOfSight,
  buildLocalLiveMapStats,
  buildLocalPeerHistory,
  buildLocalWeatherRadarBounds,
} from '../local';

describe('local live-map operator data', () => {
  it('derives stats and coverage from the canonical map snapshot', () => {
    const snapshot = buildSampleMapSnapshot(new Date('2026-05-07T12:00:00.000Z'));

    const stats = buildLocalLiveMapStats(snapshot);
    const coverage = buildLocalCoverage(snapshot);

    expect(stats.node_count).toBe(snapshot.nodes.length);
    expect(stats.decoder.located_nodes).toBe(snapshot.stats.locatedNodes);
    expect(stats.map).toEqual(snapshot.stats);
    expect(coverage.type).toBe('FeatureCollection');
    expect(coverage.features).toHaveLength(snapshot.stats.locatedNodes);
    expect(coverage.features[0]).toEqual(
      expect.objectContaining({
        geometry: expect.objectContaining({ type: 'Point' }),
        properties: expect.objectContaining({ radius_m: expect.any(Number) }),
      })
    );
  });

  it('calculates a local line-of-sight estimate for valid coordinates', () => {
    const result = buildLocalLineOfSight(
      new URLSearchParams('lat1=39.7392&lon1=-104.9903&lat2=39.7555&lon2=-105.2211&h1=20&h2=20')
    );

    expect(result.distance_km).toBeGreaterThan(19);
    expect(result.midpoint).toEqual({ lat: 39.74735, lon: -105.1057 });
    expect(result.model).toBe('local_radio_horizon_estimate');
    expect(typeof result.clear).toBe('boolean');
  });

  it('returns local elevation samples for multiple locations and empty inputs', () => {
    expect(buildLocalElevationSamples(new URLSearchParams('locations=39,-105|40,-104'))).toEqual({
      locations: [
        { lat: 39, lon: -105, elevation_m: null },
        { lat: 40, lon: -104, elevation_m: null },
      ],
      source: 'local_coordinate_samples',
    });

    expect(buildLocalElevationSamples(new URLSearchParams())).toEqual({
      locations: [],
      source: 'local_coordinate_samples',
    });
  });

  it('returns local peer history from neighbors, links, and routes', () => {
    const snapshot = buildSampleMapSnapshot(new Date('2026-05-07T12:00:00.000Z'));
    const history = buildLocalPeerHistory(snapshot, 'cm-golden-repeater', 10);

    expect(history.node?.name).toBe('Golden Ridge Repeater');
    expect(history.peers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Colorado Mesh Denver Gateway' }),
        expect.objectContaining({ name: 'Boulder Field Node' }),
      ])
    );
  });

  it('skips malformed peer links and routes in local fallback history', () => {
    const snapshot = buildSampleMapSnapshot(new Date('2026-05-07T12:00:00.000Z'));
    snapshot.links.push({ id: 'bad-link', source: null, target: 'cm-golden-repeater' } as never);
    snapshot.routes.push({ id: 'bad-route', path: null } as never);

    expect(() => buildLocalPeerHistory(snapshot, 'cm-golden-repeater', 10)).not.toThrow();
  });

  it('reports weather radar country bounds locally for Colorado coordinates', () => {
    const result = buildLocalWeatherRadarBounds(new URLSearchParams('lat=39.7392&lon=-104.9903'));

    expect(result.country_code).toBe('US');
    expect(result.bounds).toEqual(
      expect.objectContaining({ north: expect.any(Number), south: expect.any(Number) })
    );
  });
});
