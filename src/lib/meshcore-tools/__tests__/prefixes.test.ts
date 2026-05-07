import { describe, expect, it } from 'vitest';

import type { MapNode, MapNodeRole, MapNodeStatus } from '@/lib/types';
import {
  buildPrefixAnalysis,
  buildReservedPrefixSet,
  isReservedPrefix,
  normalizePublicKeyPrefix,
  searchPrefixAnalysis,
  suggestFreePrefix,
} from '@/lib/meshcore-tools/prefixes';

function mapNode(input: {
  id: string;
  publicKey: string;
  name?: string;
  role?: MapNodeRole;
  status?: MapNodeStatus;
  isOnline?: boolean;
}): MapNode {
  return {
    id: input.id,
    publicKey: input.publicKey,
    name: input.name ?? input.id,
    role: input.role ?? 'node',
    coordinates: null,
    lastHeardAt: '2026-05-07T12:00:00.000Z',
    status: input.status ?? 'online',
    isOnline: input.isOnline ?? true,
  };
}

describe('MeshCore prefix analysis', () => {
  it('normalizes full public keys and rejects malformed or incomplete values', () => {
    expect(normalizePublicKeyPrefix('0x9f2e0011')).toBe('9F2E');
    expect(normalizePublicKeyPrefix('9f', 2)).toBe('9F');
    expect(normalizePublicKeyPrefix('9f', 4)).toBeNull();
    expect(normalizePublicKeyPrefix('9fzz')).toBeNull();
    expect(normalizePublicKeyPrefix('')).toBeNull();
  });

  it('tracks exact 4-character occupancy separately from first-byte rollups', () => {
    const analysis = buildPrefixAnalysis([
      mapNode({ id: 'den-repeater', publicKey: '9F2E00112233', role: 'repeater' }),
      mapNode({ id: 'den-companion', publicKey: '9F2F00112233', role: 'companion' }),
      mapNode({ id: 'bad-node', publicKey: '9F' }),
    ]);

    expect(analysis.ignoredNodeCount).toBe(1);
    expect(analysis.occupiedPrefixCount).toBe(2);
    expect(analysis.primaryCells.get('9F')).toMatchObject({
      id: '9F',
      count: 2,
      occupiedSubCellCount: 2,
      severity: 'used',
    });
    expect(analysis.secondaryCells.get('9F2E')).toMatchObject({
      count: 1,
      severity: 'used',
      selectable: false,
    });
    expect(analysis.secondaryCells.get('9F2D')).toMatchObject({
      count: 0,
      severity: 'free',
      selectable: true,
    });
  });

  it('distinguishes mixed duplicates from repeater collisions', () => {
    const analysis = buildPrefixAnalysis([
      mapNode({ id: 'repeater-a', publicKey: 'A1B200112233', role: 'repeater' }),
      mapNode({ id: 'repeater-b', publicKey: 'A1B2FFEEDDCC', role: 'room_server' }),
      mapNode({ id: 'node-a', publicKey: 'C3D400112233', role: 'node' }),
      mapNode({ id: 'companion-a', publicKey: 'C3D4FFEEDDCC', role: 'companion' }),
    ]);

    expect(analysis.secondaryCells.get('A1B2')).toMatchObject({
      count: 2,
      severity: 'repeater-collision',
      hasRepeaterCollision: true,
    });
    expect(analysis.primaryCells.get('A1')).toMatchObject({
      severity: 'repeater-collision',
      hasRepeaterCollision: true,
    });
    expect(analysis.secondaryCells.get('C3D4')).toMatchObject({
      count: 2,
      severity: 'duplicate',
      hasRepeaterCollision: false,
    });
    expect(analysis.duplicatePrefixCount).toBe(2);
    expect(analysis.repeaterCollisionCount).toBe(1);
  });

  it('supports injectable reserved 2-character and 4-character IDs', () => {
    const reservedPrefixes = buildReservedPrefixSet(['AB', '1234']);
    expect(isReservedPrefix('ABCD', reservedPrefixes)).toBe(true);
    expect(isReservedPrefix('1234', reservedPrefixes)).toBe(true);
    expect(isReservedPrefix('1235', reservedPrefixes)).toBe(false);

    const analysis = buildPrefixAnalysis(
      [mapNode({ id: 'reserved-node', publicKey: '123400112233' })],
      { reservedPrefixes: ['AB', '1234'] },
    );

    expect(analysis.secondaryCells.get('ABCD')).toMatchObject({
      reserved: true,
      severity: 'reserved',
      selectable: false,
    });
    expect(analysis.secondaryCells.get('1234')).toMatchObject({
      reserved: true,
      severity: 'used',
      selectable: false,
    });
    expect(analysis.primaryCells.get('12')).toMatchObject({
      reserved: true,
      severity: 'used',
    });
    expect(analysis.reservedInUseCount).toBe(1);
    expect(analysis.freePrefixCount).toBe(65_536 - analysis.reservedPrefixCount);
  });

  it('counts occupied reserved prefixes outside the free pool only once', () => {
    const analysis = buildPrefixAnalysis(
      [mapNode({ id: 'reserved-node', publicKey: '123400112233' })],
      { reservedPrefixes: ['1234'] },
    );

    expect(analysis.occupiedPrefixCount).toBe(1);
    expect(analysis.reservedPrefixCount).toBe(1);
    expect(analysis.reservedInUseCount).toBe(1);
    expect(analysis.freePrefixCount).toBe(65_535);
  });

  it('suggests deterministic free prefixes while skipping reserved and occupied cells', () => {
    const analysis = buildPrefixAnalysis(
      [mapNode({ id: 'occupied', publicKey: '000100112233' })],
      { reservedPrefixes: ['0000'] },
    );

    expect(suggestFreePrefix(analysis, { preferredPrefix2: '00' })).toBe('0002');
    expect(suggestFreePrefix(analysis, { preferredPrefix2: '00', excludePrefixes: ['0002'] })).toBe('0003');
  });

  it('searches by prefix, public key, name, role, and status', () => {
    const analysis = buildPrefixAnalysis([
      mapNode({
        id: 'golden-repeater',
        publicKey: '9F2E00112233',
        name: 'DEN-GLDN-LKVST-RC-9F2E',
        role: 'repeater',
        status: 'stale',
        isOnline: false,
      }),
    ]);

    expect(searchPrefixAnalysis(analysis, 'LKVST')).toMatchObject({
      matchCount: 1,
    });
    expect(searchPrefixAnalysis(analysis, 'LKVST').matchedPrefixes.has('9F2E')).toBe(true);
    expect(searchPrefixAnalysis(analysis, '9F').matchedPrimaryPrefixes.has('9F')).toBe(true);
    expect(searchPrefixAnalysis(analysis, 'missing')).toMatchObject({
      matchCount: 0,
    });
  });
});
