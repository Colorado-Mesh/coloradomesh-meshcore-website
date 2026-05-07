import type { MeshCoreNodeTypeCode } from '@/lib/meshcore-data/node-types';
import { isColoradoMeshRegionCode } from '@/lib/meshcore-data/regions';

export const MESHCORE_NAME_LIMIT = 23;

export type CompanionSuffixStrategy = 'pubkey' | 'role' | 'number';

export interface RepeaterNameInput {
  region: string;
  city?: string;
  skipCity?: boolean;
  landmark: string;
  nodeType: string;
  pubkey: string;
}

export interface CompanionNameInput {
  emoji?: string;
  handle: string;
  suffix: string;
  suffixStrategy: CompanionSuffixStrategy;
}

export interface CompanionRole {
  code: string;
  label: string;
  description: string;
}

export const COMPANION_ROLES: CompanionRole[] = [
  { code: 'PRIM', label: 'Primary', description: 'Default method to contact you' },
  { code: 'SCND', label: 'Secondary', description: 'Less critical, still used regularly' },
  { code: 'TERT', label: 'Tertiary', description: 'Used occasionally or for a specific purpose' },
  { code: 'BKUP', label: 'Backup', description: 'Fallback if other devices are unavailable' },
  { code: 'EMRG', label: 'Emergency', description: 'Reserved for critical situations' },
  { code: 'MOBL', label: 'Mobile', description: 'Portable, used on the go (hiking, etc.)' },
  { code: 'VHCL', label: 'Vehicle', description: 'Installed in a car or other vehicle' },
  { code: 'HOME', label: 'Home', description: 'Stationary household node' },
];

export function buildRepeaterName(input: RepeaterNameInput): string {
  const region = normalizeRegion(input.region);
  const city = normalizeCity(input.city ?? '');
  const landmark = normalizeLandmark(input.landmark);
  const nodeType = normalizeNodeType(input.nodeType);
  const pubkey = normalizePubkey(input.pubkey);
  const parts: string[] = [];

  if (region) parts.push(region);
  if (!input.skipCity && city) parts.push(city);
  if (landmark) parts.push(landmark);
  if (nodeType) parts.push(nodeType);
  if (pubkey) parts.push(pubkey);

  return parts.join('-');
}

export function validateRepeaterNameInput(input: RepeaterNameInput): string[] {
  const errors: string[] = [];
  const region = normalizeRegion(input.region);
  const city = normalizeCity(input.city ?? '');
  const landmark = normalizeLandmark(input.landmark);
  const nodeType = normalizeNodeType(input.nodeType);
  const pubkey = normalizePubkey(input.pubkey);
  const landmarkMaxLen = input.skipCity ? 11 : 5;

  if (!region) {
    errors.push('Region is required');
  } else if (!isColoradoMeshRegionCode(region)) {
    errors.push('Region is not supported');
  }
  if (!input.skipCity && !city) errors.push('City is required');
  if (!landmark) errors.push('Landmark is required');
  if (!nodeType) errors.push('Node type is required');
  if (!pubkey) errors.push('Public key prefix is required');
  if (city && !input.skipCity && !/^[A-Z]{1,5}$/.test(city)) {
    errors.push('City must be 1–5 letters only');
  }
  if (
    landmark &&
    (landmark.length > landmarkMaxLen || !/^[A-Za-z0-9.+_|]+$/.test(landmark))
  ) {
    errors.push(`Landmark must be 1–${landmarkMaxLen} chars (A-Z, a-z, 0-9, +, ., _, |)`);
  }
  if (nodeType && !isMeshCoreNodeTypeCode(nodeType)) {
    errors.push('Node type is not supported');
  }
  if (pubkey && !/^[A-F0-9]{4}$/.test(pubkey)) {
    errors.push('Pub key must be exactly 4 hex chars (0-9, A-F)');
  }

  const name = buildRepeaterName(input);
  if (name.length > MESHCORE_NAME_LIMIT) {
    errors.push('Name exceeds 23-character limit');
  }

  return errors;
}

export function buildCompanionSuffix(params: {
  strategy: CompanionSuffixStrategy;
  pubkeyPrefix?: string;
  role?: string;
  customRole?: string;
  number?: string;
}): string {
  switch (params.strategy) {
    case 'pubkey':
      return normalizePubkey(params.pubkeyPrefix ?? '');
    case 'role':
      return normalizeCompanionRole(
        params.role === '__custom' ? params.customRole ?? '' : params.role ?? '',
      );
    case 'number':
      return params.number ? `MY${params.number.replace(/[^0-9]/g, '').slice(0, 2).padStart(2, '0')}` : '';
  }
}

export function buildCompanionName(input: CompanionNameInput): string {
  const parts: string[] = [];
  const emoji = input.emoji?.trim();
  const handle = normalizeCompanionHandle(input.handle);
  const suffix = normalizeCompanionSuffix(input.suffix);

  if (emoji) parts.push(emoji);
  if (handle) parts.push(handle);
  if (suffix) parts.push(suffix);

  return parts.join(' ');
}

export function validateCompanionNameInput(input: CompanionNameInput): string[] {
  const errors: string[] = [];
  const name = buildCompanionName(input);
  const handle = normalizeCompanionHandle(input.handle);
  const suffix = normalizeCompanionSuffix(input.suffix);

  if (!handle) {
    errors.push('Handle is required');
  } else if (handle.length > 10 || !/^[A-Z0-9Ø]+$/.test(handle)) {
    errors.push('Handle must be 1–10 chars (A-Z, 0-9, Ø)');
  }
  if (!suffix) errors.push('Suffix is required');

  if (!isCompanionSuffixStrategy(input.suffixStrategy)) {
    errors.push('Suffix strategy is not supported');
  } else if (suffix) {
    if (input.suffixStrategy === 'pubkey' && !/^[A-F0-9]{4}$/.test(suffix)) {
      errors.push('Public key suffix must be exactly 4 hex chars (0-9, A-F)');
    }
    if (input.suffixStrategy === 'role' && !/^[A-Z]{2,4}$/.test(suffix)) {
      errors.push('Role suffix must be 2–4 letters only');
    }
    if (input.suffixStrategy === 'number' && !/^MY(0[1-9]|[1-9][0-9])$/.test(suffix)) {
      errors.push('Number suffix must be MY01 through MY99');
    }
  }

  if (name.length > MESHCORE_NAME_LIMIT) {
    errors.push('Name exceeds 23-character limit');
  }

  return errors;
}

export function normalizeRegion(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeCity(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeLandmark(value: string): string {
  return value.trim();
}

export function normalizeNodeType(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizePubkey(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeCompanionHandle(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeCompanionRole(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeCompanionSuffix(value: string): string {
  return value.trim().toUpperCase();
}

function isMeshCoreNodeTypeCode(value: string): value is MeshCoreNodeTypeCode {
  return ['RC', 'RD', 'RE', 'RM', 'TS', 'TM', 'TR'].includes(value);
}

function isCompanionSuffixStrategy(value: string): value is CompanionSuffixStrategy {
  return ['pubkey', 'role', 'number'].includes(value);
}
