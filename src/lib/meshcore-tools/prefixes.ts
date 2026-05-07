import type { MapNode, MapNodeRole } from '@/lib/types';

export const HEX_CHARS = Array.from({ length: 16 }, (_, index) => index.toString(16).toUpperCase());

export const DEFAULT_RESERVED_PREFIXES = ['0000', 'FFFF'] as const;

export type PrefixCellSeverity =
  | 'free'
  | 'reserved'
  | 'used'
  | 'duplicate'
  | 'repeater-collision';

export interface PrefixNodeInfo {
  id: string;
  name: string;
  publicKey: string;
  prefix2: string;
  prefix4: string;
  role: MapNodeRole;
  status: string;
  isOnline: boolean;
  lastHeardAt: string | null;
  searchText: string;
}

export interface PrefixCell {
  id: string;
  prefix2: string;
  nodes: PrefixNodeInfo[];
  count: number;
  reserved: boolean;
  active: boolean;
  severity: PrefixCellSeverity;
  hasRepeaterCollision: boolean;
  selectable: boolean;
  searchText: string;
}

export interface PrefixPrimaryCell extends PrefixCell {
  subCells: PrefixCell[];
  occupiedSubCellCount: number;
  reservedSubCellCount: number;
}

export interface PrefixAnalysis {
  primaryCells: Map<string, PrefixPrimaryCell>;
  secondaryCells: Map<string, PrefixCell>;
  nodeInfos: PrefixNodeInfo[];
  ignoredNodeCount: number;
  occupiedPrefixCount: number;
  freePrefixCount: number;
  reservedPrefixCount: number;
  duplicatePrefixCount: number;
  repeaterCollisionCount: number;
  reservedInUseCount: number;
}

export interface PrefixAnalysisOptions {
  reservedPrefixes?: readonly string[];
}

export interface PrefixSuggestionOptions {
  preferredPrefix2?: string;
  excludePrefixes?: readonly string[];
}

export interface PrefixSearchResult {
  matchedPrimaryPrefixes: Set<string>;
  matchedPrefixes: Set<string>;
  matchCount: number;
}

export function normalizePublicKeyPrefix(value: string | null | undefined, length = 4): string | null {
  const normalized = value?.trim().replace(/^0x/i, '').toUpperCase();

  if (!normalized || normalized.length < length || !/^[A-F0-9]+$/.test(normalized)) {
    return null;
  }

  return normalized.slice(0, length);
}

export function isReservedPrefix(
  prefix4: string,
  reservedPrefixes: ReadonlySet<string> | readonly string[] = DEFAULT_RESERVED_PREFIXES,
): boolean {
  const normalized = normalizePublicKeyPrefix(prefix4, 4);
  if (!normalized) return false;

  const reservedSet = Array.isArray(reservedPrefixes)
    ? buildReservedPrefixSet(reservedPrefixes)
    : (reservedPrefixes as ReadonlySet<string>);

  return reservedSet.has(normalized) || reservedSet.has(normalized.slice(0, 2));
}

export function buildReservedPrefixSet(
  reservedPrefixes: readonly string[] = DEFAULT_RESERVED_PREFIXES,
): ReadonlySet<string> {
  const reserved = new Set<string>();

  for (const prefix of reservedPrefixes) {
    const normalized = normalizePublicKeyPrefix(prefix, prefix.trim().length <= 2 ? 2 : 4);
    if (normalized && (normalized.length === 2 || normalized.length === 4)) {
      reserved.add(normalized);
    }
  }

  return reserved;
}

export function buildPrefixAnalysis(
  nodes: readonly MapNode[],
  options: PrefixAnalysisOptions = {},
): PrefixAnalysis {
  const reservedPrefixes = buildReservedPrefixSet(options.reservedPrefixes);
  const nodeInfos: PrefixNodeInfo[] = [];
  let ignoredNodeCount = 0;

  for (const node of nodes) {
    const prefix4 = normalizePublicKeyPrefix(node.publicKey, 4);
    if (!prefix4) {
      ignoredNodeCount += 1;
      continue;
    }

    nodeInfos.push({
      id: node.id,
      name: node.name || 'Unnamed',
      publicKey: node.publicKey,
      prefix2: prefix4.slice(0, 2),
      prefix4,
      role: node.role,
      status: node.status,
      isOnline: node.isOnline,
      lastHeardAt: node.lastHeardAt,
      searchText: buildNodeSearchText(node, prefix4),
    });
  }

  const nodesByPrefix4 = new Map<string, PrefixNodeInfo[]>();
  const nodesByPrefix2 = new Map<string, PrefixNodeInfo[]>();

  for (const info of nodeInfos) {
    addToMapArray(nodesByPrefix4, info.prefix4, info);
    addToMapArray(nodesByPrefix2, info.prefix2, info);
  }

  const secondaryCells = new Map<string, PrefixCell>();
  let occupiedPrefixCount = 0;
  let freePrefixCount = 0;
  let reservedPrefixCount = 0;
  let duplicatePrefixCount = 0;
  let repeaterCollisionCount = 0;
  let reservedInUseCount = 0;

  for (const first of HEX_CHARS) {
    for (const second of HEX_CHARS) {
      const prefix2 = `${first}${second}`;
      for (const third of HEX_CHARS) {
        for (const fourth of HEX_CHARS) {
          const prefix4 = `${prefix2}${third}${fourth}`;
          const cell = buildSecondaryCell(prefix4, nodesByPrefix4.get(prefix4) ?? [], reservedPrefixes);
          secondaryCells.set(prefix4, cell);

          if (cell.count > 0) occupiedPrefixCount += 1;
          if (cell.count === 0 && !cell.reserved) freePrefixCount += 1;
          if (cell.reserved) reservedPrefixCount += 1;
          if (cell.count > 1) duplicatePrefixCount += 1;
          if (cell.hasRepeaterCollision) repeaterCollisionCount += 1;
          if (cell.reserved && cell.count > 0) reservedInUseCount += 1;
        }
      }
    }
  }

  const primaryCells = new Map<string, PrefixPrimaryCell>();

  for (const first of HEX_CHARS) {
    for (const second of HEX_CHARS) {
      const prefix2 = `${first}${second}`;
      const subCells = Array.from(secondaryCells.values()).filter((cell) => cell.prefix2 === prefix2);
      primaryCells.set(
        prefix2,
        buildPrimaryCell(prefix2, nodesByPrefix2.get(prefix2) ?? [], subCells, reservedPrefixes),
      );
    }
  }

  return {
    primaryCells,
    secondaryCells,
    nodeInfos,
    ignoredNodeCount,
    occupiedPrefixCount,
    freePrefixCount,
    reservedPrefixCount,
    duplicatePrefixCount,
    repeaterCollisionCount,
    reservedInUseCount,
  };
}

export function suggestFreePrefix(
  analysis: PrefixAnalysis,
  options: PrefixSuggestionOptions = {},
): string | null {
  const excluded = new Set(
    options.excludePrefixes
      ?.map((prefix) => normalizePublicKeyPrefix(prefix, 4))
      .filter((prefix): prefix is string => Boolean(prefix)) ?? [],
  );
  const preferredPrefix2 = normalizePublicKeyPrefix(options.preferredPrefix2, 2);
  const prefixes = Array.from(analysis.secondaryCells.keys()).sort();
  const orderedPrefixes = preferredPrefix2
    ? [
        ...prefixes.filter((prefix) => prefix.startsWith(preferredPrefix2)),
        ...prefixes.filter((prefix) => !prefix.startsWith(preferredPrefix2)),
      ]
    : prefixes;

  for (const prefix of orderedPrefixes) {
    if (excluded.has(prefix)) continue;

    const cell = analysis.secondaryCells.get(prefix);
    if (cell && cell.count === 0 && !cell.reserved) {
      return prefix;
    }
  }

  return null;
}

export function searchPrefixAnalysis(
  analysis: PrefixAnalysis,
  query: string,
): PrefixSearchResult {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedPrimaryPrefixes = new Set<string>();
  const matchedPrefixes = new Set<string>();
  let matchCount = 0;

  if (!normalizedQuery) {
    return { matchedPrimaryPrefixes, matchedPrefixes, matchCount };
  }

  for (const [prefix4, cell] of analysis.secondaryCells) {
    const matchesPrefix = prefix4.toLowerCase().includes(normalizedQuery);
    const matchingNodes = cell.nodes.filter((node) => node.searchText.includes(normalizedQuery));

    if (matchesPrefix || matchingNodes.length > 0) {
      matchedPrefixes.add(prefix4);
      matchedPrimaryPrefixes.add(cell.prefix2);
      matchCount += Math.max(1, matchingNodes.length);
    }
  }

  return { matchedPrimaryPrefixes, matchedPrefixes, matchCount };
}

function buildSecondaryCell(
  prefix4: string,
  nodes: PrefixNodeInfo[],
  reservedPrefixes: ReadonlySet<string>,
): PrefixCell {
  const reserved = isReservedPrefix(prefix4, reservedPrefixes);
  const hasRepeaterCollision = countRepeaterLikeNodes(nodes) > 1;
  const severity = getSecondarySeverity(nodes.length, reserved, hasRepeaterCollision);

  return {
    id: prefix4,
    prefix2: prefix4.slice(0, 2),
    nodes,
    count: nodes.length,
    reserved,
    active: nodes.some((node) => node.isOnline || node.status === 'online'),
    severity,
    hasRepeaterCollision,
    selectable: nodes.length === 0 && !reserved,
    searchText: [prefix4, ...nodes.map((node) => node.searchText)].join(' ').toLowerCase(),
  };
}

function buildPrimaryCell(
  prefix2: string,
  nodes: PrefixNodeInfo[],
  subCells: PrefixCell[],
  reservedPrefixes: ReadonlySet<string>,
): PrefixPrimaryCell {
  const reserved = reservedPrefixes.has(prefix2);
  const hasRepeaterCollision = subCells.some((cell) => cell.hasRepeaterCollision);
  const occupiedSubCellCount = subCells.filter((cell) => cell.count > 0).length;
  const reservedSubCellCount = subCells.filter((cell) => cell.reserved).length;
  const hasDuplicate = subCells.some((cell) => cell.count > 1);
  const hasReservedInUse = subCells.some((cell) => cell.reserved && cell.count > 0);
  const severity = getPrimarySeverity({
    nodeCount: nodes.length,
    reserved: reserved || hasReservedInUse,
    hasDuplicate,
    hasRepeaterCollision,
  });

  return {
    id: prefix2,
    prefix2,
    nodes,
    count: nodes.length,
    reserved: reserved || reservedSubCellCount > 0,
    active: nodes.some((node) => node.isOnline || node.status === 'online'),
    severity,
    hasRepeaterCollision,
    selectable: false,
    searchText: [prefix2, ...nodes.map((node) => node.searchText)].join(' ').toLowerCase(),
    subCells,
    occupiedSubCellCount,
    reservedSubCellCount,
  };
}

function getSecondarySeverity(
  nodeCount: number,
  reserved: boolean,
  hasRepeaterCollision: boolean,
): PrefixCellSeverity {
  if (hasRepeaterCollision) return 'repeater-collision';
  if (nodeCount > 1) return 'duplicate';
  if (nodeCount === 1) return 'used';
  if (reserved) return 'reserved';
  return 'free';
}

function getPrimarySeverity(input: {
  nodeCount: number;
  reserved: boolean;
  hasDuplicate: boolean;
  hasRepeaterCollision: boolean;
}): PrefixCellSeverity {
  if (input.hasRepeaterCollision) return 'repeater-collision';
  if (input.hasDuplicate) return 'duplicate';
  if (input.nodeCount > 0) return 'used';
  if (input.reserved) return 'reserved';
  return 'free';
}

function countRepeaterLikeNodes(nodes: PrefixNodeInfo[]): number {
  return nodes.filter((node) => node.role === 'repeater' || node.role === 'room_server').length;
}

function buildNodeSearchText(node: MapNode, prefix4: string): string {
  const metadataValues = node.metadata ? Object.values(node.metadata) : [];
  return [
    prefix4,
    prefix4.slice(0, 2),
    node.id,
    node.name,
    node.publicKey,
    node.role,
    node.status,
    node.model,
    node.firmwareVersion,
    node.hardwareVersion,
    node.clientVersion,
    node.lastHeardAt,
    ...metadataValues,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join(' ')
    .toLowerCase();
}

function addToMapArray<TKey, TValue>(map: Map<TKey, TValue[]>, key: TKey, value: TValue): void {
  const values = map.get(key);
  if (values) {
    values.push(value);
  } else {
    map.set(key, [value]);
  }
}
