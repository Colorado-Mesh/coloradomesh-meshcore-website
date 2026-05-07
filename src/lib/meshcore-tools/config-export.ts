import { findMeshCoreNodeType } from '@/lib/meshcore-data/node-types';
import { COLORADO_MESH_REGION_CODES } from '@/lib/meshcore-data/regions';
import { buildRadioSettingsJson } from '@/lib/meshcore-data/settings';
import {
  buildCompanionName,
  buildRepeaterName,
  normalizeCompanionHandle,
  normalizeCompanionSuffix,
  normalizeNodeType,
  normalizePubkey,
  normalizeRegion,
  validateCompanionNameInput,
  validateRepeaterNameInput,
  type CompanionNameInput,
  type RepeaterNameInput,
} from '@/lib/meshcore-tools/naming';

export type MeshCoreSettingValue =
  | string
  | number
  | boolean
  | null
  | MeshCoreSettingValue[]
  | { [key: string]: MeshCoreSettingValue };

export interface MeshCoreSettingsJson {
  [key: string]: MeshCoreSettingValue;
}

export interface MeshCoreConfigExportSuccess {
  ok: true;
  fileName: string;
  settingsJson: MeshCoreSettingsJson;
  warnings: string[];
}

export interface MeshCoreConfigExportFailure {
  ok: false;
  errors: string[];
}

export type MeshCoreConfigExportResult =
  | MeshCoreConfigExportSuccess
  | MeshCoreConfigExportFailure;

export function createRepeaterConfigExport(
  input: RepeaterNameInput,
): MeshCoreConfigExportResult {
  const errors = validateRepeaterNameInput(input);
  const nodeType = findMeshCoreNodeType(normalizeNodeType(input.nodeType));

  if (!nodeType) {
    errors.push('Node type is not supported');
  }

  if (errors.length > 0 || !nodeType) {
    return { ok: false, errors: unique(errors) };
  }

  const name = buildRepeaterName(input);
  const homeRegion = normalizeRegion(input.region).toLowerCase();
  const publicKeyId = normalizePubkey(input.pubkey);
  const warnings = [
    'Private keys are not included. Import or provision keys on the device separately.',
    'Review owner info before applying this configuration to hardware.',
  ];

  if (nodeType.settings.role === 'room-server') {
    warnings.push('Room server profiles may require firmware-specific room settings after import.');
  }

  return {
    ok: true,
    fileName: buildConfigFileName('repeater', name),
    settingsJson: {
      name,
      node_type: nodeType.code,
      role: nodeType.settings.role,
      repeat: nodeType.settings.repeat,
      mobility: nodeType.settings.mobility,
      priority: nodeType.settings.priority,
      radio_settings: buildRadioSettingsJson(),
      regions: {
        all: COLORADO_MESH_REGION_CODES,
        home: homeRegion,
      },
      public_key_id: publicKeyId,
      owner_info: null,
    },
    warnings,
  };
}

export function createCompanionConfigExport(
  input: CompanionNameInput,
): MeshCoreConfigExportResult {
  const errors = validateCompanionNameInput(input);

  if (errors.length > 0) {
    return { ok: false, errors: unique(errors) };
  }

  const name = buildCompanionName(input);
  const handle = normalizeCompanionHandle(input.handle);
  const suffix = normalizeCompanionSuffix(input.suffix);

  return {
    ok: true,
    fileName: buildConfigFileName('companion', name),
    settingsJson: {
      name,
      radio_settings: buildRadioSettingsJson(),
      companion: {
        handle,
        suffix,
        emoji: input.emoji?.trim() || null,
      },
    },
    warnings: [
      'Private keys are not included. Import or provision keys on the companion device separately.',
      'Companion profiles inherit Colorado Mesh radio defaults; review device-specific preferences before applying.',
    ],
  };
}

export function stringifySettingsJson(settingsJson: MeshCoreSettingsJson): string {
  return `${JSON.stringify(settingsJson, null, 2)}\n`;
}

export function buildConfigFileName(
  kind: 'repeater' | 'companion',
  name: string,
): string {
  const safeName = sanitizeConfigName(name);
  const prefix =
    kind === 'repeater'
      ? 'coloradomesh_meshcore_repeater_config'
      : 'coloradomesh_meshcore_companion_config';
  return `${prefix}_${safeName}.json`;
}

export function sanitizeConfigName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'unnamed'
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
