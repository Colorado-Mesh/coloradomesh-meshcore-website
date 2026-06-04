import { describe, expect, it } from 'vitest';
import Ajv from 'ajv';

import { PARITY_MANIFEST } from '../manifest';
import { buildParityReport } from '../report';
import provenance from '../fixtures/provenance.json';
import {
  UPSTREAM_UTILITIES_AIRPORTS,
  UPSTREAM_UTILITIES_PROVENANCE,
  UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS,
  UPSTREAM_UTILITIES_SERIAL_COMMAND_PROFILE,
  UPSTREAM_UTILITIES_SERIAL_COMMAND_SCHEMA,
} from '@/lib/upstream-utilities';

describe('PARITY_MANIFEST', () => {
  it('uses unique item ids and covers required domains', () => {
    const ids = PARITY_MANIFEST.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    expect(PARITY_MANIFEST.map((item) => item.domain)).toEqual(
      expect.arrayContaining([
        'utilities',
        'repeater-config',
        'serial-usb',
        'prefix-matrix',
        'corescope-api',
        'corescope-ui',
        'docker',
        'ci',
      ])
    );
  });

  it('records contacts export as out of scope', () => {
    expect(PARITY_MANIFEST).toContainEqual(
      expect.objectContaining({
        id: 'contacts-export',
        status: 'out-of-scope',
      })
    );
  });

  it('builds a maintainer report from the manifest', () => {
    const report = buildParityReport();
    expect(report).toContain('Colorado MeshCore Upstream Parity Report');
    expect(report).toContain('corescope-analyzer-api-consumer');
  });
});

describe('upstream parity fixtures', () => {
  it('loads generated utility artifacts and provenance fixtures', () => {
    expect(UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS.radio_settings.frequency).toBe(910525);
    expect(UPSTREAM_UTILITIES_SERIAL_COMMAND_PROFILE.actions.length).toBeGreaterThan(0);
    expect(UPSTREAM_UTILITIES_AIRPORTS.length).toBeGreaterThan(0);
    expect(provenance.sources.length).toBeGreaterThan(0);
  });

  it('records submodule provenance for generated utility artifacts', () => {
    expect(UPSTREAM_UTILITIES_PROVENANCE).toMatchObject({
      upstreamRepository: 'Colorado-Mesh/meshcore-utilities-site',
      upstreamUrl: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
      submodulePath: 'vendor/meshcore-utilities-site',
    });
    expect(UPSTREAM_UTILITIES_PROVENANCE.upstreamCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(UPSTREAM_UTILITIES_PROVENANCE.sources.map((source) => source.upstreamPath)).toEqual([
      'static/data/recommended_settings.json',
      'static/data/airports.json',
      'static/data/counties.json',
      'static/data/mountains.json',
      'static/data/municipalities.json',
      'static/data/unincorporated_areas.json',
      'static/data/default_serial_commands.json',
      'serial_commands.schema.json',
    ]);
  });

  it('validates the generated serial command profile against the generated upstream schema', () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(UPSTREAM_UTILITIES_SERIAL_COMMAND_SCHEMA);
    const valid = validate(UPSTREAM_UTILITIES_SERIAL_COMMAND_PROFILE);
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });
});
