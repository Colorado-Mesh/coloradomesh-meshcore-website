import { describe, expect, it } from 'vitest';

import { COLORADO_MESH_REGION_CODES, COLORADO_MESH_REGIONS } from '@/lib/meshcore-data/regions';
import {
  UPSTREAM_UTILITIES_PROVENANCE,
  UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS,
  UPSTREAM_UTILITIES_REGIONS,
} from '@/lib/upstream-utilities';
import {
  COLORADO_MESH_RADIO_COMMANDS,
  COLORADO_MESH_RADIO_SETTINGS,
  MESHCORE_SETTINGS_PROVENANCE,
  buildRadioSettingsJson,
  formatRadioBandwidthHz,
  formatRadioFrequencyKHz,
} from '@/lib/meshcore-data/settings';
import {
  buildConfigFileName,
  createCompanionConfigExport,
  createRepeaterConfigExport,
  sanitizeConfigName,
  stringifySettingsJson,
} from '@/lib/meshcore-tools/config-export';
import {
  buildCompanionName,
  buildCompanionSuffix,
  buildRepeaterName,
  validateCompanionNameInput,
  validateRepeaterNameInput,
} from '@/lib/meshcore-tools/naming';

describe('MeshCore settings export', () => {
  it('keeps canonical radio settings aligned with the upstream fixture', () => {
    expect(buildRadioSettingsJson()).toEqual(UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS.radio_settings);
  });

  it('tracks generated upstream settings provenance', () => {
    expect(MESHCORE_SETTINGS_PROVENANCE).toEqual({
      source: 'Colorado-Mesh/meshcore-utilities-site',
      sourcePath: 'static/data/recommended_settings.json',
      submodulePath: 'vendor/meshcore-utilities-site',
      upstreamCommit: UPSTREAM_UTILITIES_PROVENANCE.upstreamCommit,
    });
  });

  it('keeps canonical regions aligned with upstream airport regions', () => {
    expect(COLORADO_MESH_REGION_CODES).toEqual(
      UPSTREAM_UTILITIES_REGIONS.airports
        .map((airport) => airport.code.toLowerCase())
        .sort((a, b) => a.localeCompare(b)),
    );
    expect(COLORADO_MESH_REGIONS.find((region) => region.code === 'den')).toEqual({
      code: 'den',
      label: 'Denver International Airport',
    });
  });

  it('formats guide-facing radio settings and commands from canonical data', () => {
    expect(formatRadioFrequencyKHz(COLORADO_MESH_RADIO_SETTINGS.frequency)).toBe(
      '910.525 MHz',
    );
    expect(formatRadioBandwidthHz(COLORADO_MESH_RADIO_SETTINGS.bandwidth)).toBe(
      '62.5 kHz',
    );
    expect(COLORADO_MESH_RADIO_COMMANDS).toEqual([
      'set freq 910525',
      'set radio bw 62500 sf 7 cr 8',
      'set tx 22',
    ]);
  });

  it('builds repeater names using the current naming format', () => {
    expect(
      buildRepeaterName({
        region: 'DEN',
        city: 'DNVR',
        landmark: 'CHSPK',
        nodeType: 'RC',
        pubkey: '9f2e',
      }),
    ).toBe('DEN-DNVR-CHSPK-RC-9F2E');
  });

  it('validates repeater inputs before export', () => {
    const result = createRepeaterConfigExport({
      region: 'BAD',
      city: 'DENVER',
      landmark: 'CHSPK',
      nodeType: 'RC',
      pubkey: '9F2E',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        'Region is not supported',
        'City must be 1–5 letters only',
        'Name exceeds 23-character limit',
      ],
    });
  });

  it('exports deterministic repeater settings JSON without private keys', () => {
    const result = createRepeaterConfigExport({
      region: 'DEN',
      city: 'GLDN',
      landmark: 'LKVST',
      nodeType: 'RC',
      pubkey: '9f2e',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.fileName).toBe(
      'coloradomesh_meshcore_repeater_config_DEN-GLDN-LKVST-RC-9F2E.json',
    );
    expect(result.settingsJson).toMatchObject({
      name: 'DEN-GLDN-LKVST-RC-9F2E',
      node_type: 'RC',
      role: 'repeater',
      repeat: true,
      mobility: 'fixed',
      priority: 'core',
      radio_settings: {
        frequency: COLORADO_MESH_RADIO_SETTINGS.frequency,
        bandwidth: COLORADO_MESH_RADIO_SETTINGS.bandwidth,
        spreading_factor: COLORADO_MESH_RADIO_SETTINGS.spreadingFactor,
        coding_rate: COLORADO_MESH_RADIO_SETTINGS.codingRate,
        tx_power: COLORADO_MESH_RADIO_SETTINGS.txPower,
      },
      regions: {
        all: COLORADO_MESH_REGION_CODES,
        home: 'den',
      },
      public_key_id: '9F2E',
      owner_info: null,
    });
    expect(JSON.stringify(result.settingsJson)).not.toContain('private');
    expect(stringifySettingsJson(result.settingsJson)).toBe(
      stringifySettingsJson(result.settingsJson),
    );
  });

  it('supports skip-city repeater names up to the 23-character limit', () => {
    const errors = validateRepeaterNameInput({
      region: 'DEN',
      skipCity: true,
      landmark: 'LOOKOUTMTN',
      nodeType: 'RD',
      pubkey: 'A1B2',
    });

    expect(errors).toEqual([]);
  });

  it('builds companion suffixes and names from each strategy', () => {
    expect(buildCompanionSuffix({ strategy: 'pubkey', pubkeyPrefix: 'f4a2' })).toBe(
      'F4A2',
    );
    expect(buildCompanionSuffix({ strategy: 'role', role: 'home' })).toBe('HOME');
    expect(buildCompanionSuffix({ strategy: 'number', number: '7' })).toBe('MY07');
    expect(
      buildCompanionName({
        emoji: '👻',
        handle: 'm3shghøst',
        suffix: 'f4a2',
        suffixStrategy: 'pubkey',
      }),
    ).toBe('👻 M3SHGHØST F4A2');
  });

  it('blocks companion exports over the MeshCore name limit', () => {
    expect(
      validateCompanionNameInput({
        emoji: '👻'.repeat(10),
        handle: 'ABCDEFGHIJ',
        suffix: 'ABCD',
        suffixStrategy: 'role',
      }),
    ).toEqual(['Name exceeds 23-character limit']);
  });

  it('blocks companion exports with invalid handles', () => {
    expect(
      createCompanionConfigExport({
        emoji: '👻',
        handle: 'TOO-LONG-HANDLE',
        suffix: 'ABCD',
        suffixStrategy: 'role',
      }),
    ).toEqual({
      ok: false,
      errors: ['Handle must be 1–10 chars (A-Z, 0-9, Ø)'],
    });
    expect(
      createCompanionConfigExport({
        emoji: '👻',
        handle: 'MESH_GHOST',
        suffix: 'ABCD',
        suffixStrategy: 'role',
      }),
    ).toEqual({
      ok: false,
      errors: ['Handle must be 1–10 chars (A-Z, 0-9, Ø)'],
    });
  });

  it('blocks companion exports with invalid strategy-specific suffixes', () => {
    expect(
      createCompanionConfigExport({
        emoji: '👻',
        handle: 'm3shghøst',
        suffix: 'f',
        suffixStrategy: 'pubkey',
      }),
    ).toEqual({
      ok: false,
      errors: ['Public key suffix must be exactly 4 hex chars (0-9, A-F)'],
    });
    expect(
      createCompanionConfigExport({
        emoji: '👻',
        handle: 'm3shghøst',
        suffix: 'MY00',
        suffixStrategy: 'number',
      }),
    ).toEqual({
      ok: false,
      errors: ['Number suffix must be MY01 through MY99'],
    });
  });

  it('exports deterministic companion settings JSON without private keys', () => {
    const result = createCompanionConfigExport({
      emoji: '👻',
      handle: 'm3shghøst',
      suffix: 'f4a2',
      suffixStrategy: 'pubkey',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.fileName).toBe(
      'coloradomesh_meshcore_companion_config_M3SHGH_ST_F4A2.json',
    );
    expect(result.settingsJson).toMatchObject({
      name: '👻 M3SHGHØST F4A2',
      radio_settings: {
        frequency: 910525,
        bandwidth: 62500,
        spreading_factor: 7,
        coding_rate: 8,
        tx_power: 22,
      },
      companion: {
        handle: 'M3SHGHØST',
        suffix: 'F4A2',
        emoji: '👻',
      },
    });
    expect(JSON.stringify(result.settingsJson)).not.toContain('private');
  });

  it('sanitizes exported config filenames predictably', () => {
    expect(sanitizeConfigName('👻 M3SHGHØST F4A2')).toBe('M3SHGH_ST_F4A2');
    expect(sanitizeConfigName('DEN|GLDN')).toBe('DEN_GLDN');
    expect(buildConfigFileName('companion', '***')).toBe(
      'coloradomesh_meshcore_companion_config_unnamed.json',
    );
  });
});
