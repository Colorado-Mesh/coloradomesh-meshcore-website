import { describe, expect, it } from 'vitest';
import { normalizeLiveMapNode } from '../normalize';

describe('map node normalization', () => {
  it('normalizes Colorado analyzer API nodes', () => {
    const node = normalizeLiveMapNode(
      {
        public_key: 'A10F4C8D9E7B6A5C3D2E1F0A9B8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0C',
        name: 'DEN-TEST',
        role: 'repeater',
        lat: 39.7392,
        lon: -104.9903,
        last_heard: '2026-05-09T11:58:00Z',
        battery_mv: 4010,
      },
      new Date('2026-05-09T12:00:00.000Z')
    );

    expect(node).toEqual(
      expect.objectContaining({
        publicKey: 'A10F4C8D9E7B6A5C3D2E1F0A9B8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0C',
        name: 'DEN-TEST',
        role: 'repeater',
        lastHeardAt: '2026-05-09T11:58:00.000Z',
        status: 'online',
        coordinates: { latitude: 39.7392, longitude: -104.9903, altitudeMeters: null },
        battery: { millivolts: 4010, percentage: 79 },
      })
    );
  });
});
