import type { MapNode, MapNodeRole, MapSnapshot } from '@/lib/map';

const EARTH_RADIUS_METERS = 6_371_000;
const EFFECTIVE_EARTH_RADIUS_METERS = EARTH_RADIUS_METERS * (4 / 3);
const CONTIGUOUS_US_BOUNDS = {
  north: 49.384358,
  south: 24.396308,
  east: -66.93457,
  west: -124.848974,
};

interface LocalSourceMeta {
  type: MapSnapshot['source']['type'];
  label: string;
  last_updated: string | null;
}

function sourceMeta(snapshot: MapSnapshot): LocalSourceMeta {
  return {
    type: snapshot.source.type,
    label: snapshot.source.label,
    last_updated: snapshot.source.lastUpdated,
  };
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nodeIdentifiers(node: MapNode): string[] {
  return [node.id, node.publicKey, node.name].filter((value): value is string => Boolean(value));
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function keyMatchesNode(key: string, node: MapNode): boolean {
  const normalized = normalizeIdentifier(key);
  return nodeIdentifiers(node).some((value) => normalizeIdentifier(value) === normalized);
}

function buildNodeIndex(nodes: MapNode[]): Map<string, MapNode> {
  const index = new Map<string, MapNode>();
  for (const node of nodes) {
    for (const identifier of nodeIdentifiers(node)) {
      const normalized = normalizeIdentifier(identifier);
      if (!index.has(normalized)) index.set(normalized, node);
    }
  }
  return index;
}

function findNode(index: Map<string, MapNode>, key: string): MapNode | null {
  return index.get(normalizeIdentifier(key)) ?? null;
}

function coverageRadiusMeters(role: MapNodeRole): number {
  switch (role) {
    case 'gateway':
    case 'repeater':
    case 'router':
      return 25_000;
    case 'room_server':
      return 15_000;
    case 'companion':
      return 7_500;
    default:
      return 10_000;
  }
}

export function buildLocalLiveMapStats(snapshot: MapSnapshot) {
  const mqttConnected = snapshot.source.type === 'mqtt' && snapshot.connection.state === 'connected';

  return {
    source: sourceMeta(snapshot),
    generated_at: snapshot.generatedAt,
    node_count: snapshot.stats.totalNodes,
    decoder: {
      nodes: snapshot.stats.totalNodes,
      located_nodes: snapshot.stats.locatedNodes,
      visible_nodes: snapshot.stats.visibleNodes,
      online_nodes: snapshot.stats.onlineNodes,
      stale_nodes: snapshot.stats.staleNodes,
      offline_nodes: snapshot.stats.offlineNodes,
      repeaters: snapshot.stats.repeaterNodes,
      links: snapshot.stats.linkCount,
      routes: snapshot.stats.routeCount,
      errors_total: 0,
    },
    mqtt: {
      connected: mqttConnected,
      topic: snapshot.connection.topic,
      state: snapshot.connection.state,
    },
    map: snapshot.stats,
  };
}

export function buildLocalCoverage(snapshot: MapSnapshot) {
  const features = snapshot.nodes
    .filter((node) => node.coordinates)
    .map((node) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [node.coordinates!.longitude, node.coordinates!.latitude],
      },
      properties: {
        id: node.id,
        public_key: node.publicKey,
        name: node.name,
        role: node.role,
        status: node.status,
        radius_m: coverageRadiusMeters(node.role),
        altitude_m: node.coordinates?.altitudeMeters ?? null,
        last_heard: node.lastHeardAt,
      },
    }));

  return {
    type: 'FeatureCollection' as const,
    features,
    generated_at: snapshot.generatedAt,
    source: sourceMeta(snapshot),
  };
}

export function buildLocalLineOfSight(query: URLSearchParams) {
  const lat1 = Number(query.get('lat1'));
  const lon1 = Number(query.get('lon1'));
  const lat2 = Number(query.get('lat2'));
  const lon2 = Number(query.get('lon2'));
  const h1 = Math.max(0, Number(query.get('h1') ?? 0));
  const h2 = Math.max(0, Number(query.get('h2') ?? 0));
  const distanceM = haversineMeters(lat1, lon1, lat2, lon2);
  const horizonM =
    Math.sqrt(2 * EFFECTIVE_EARTH_RADIUS_METERS * h1) +
    Math.sqrt(2 * EFFECTIVE_EARTH_RADIUS_METERS * h2);
  const clearanceM = horizonM - distanceM;
  const clear = clearanceM >= 0;

  return {
    clear,
    has_los: clear,
    distance_m: round(distanceM, 1),
    distance_km: round(distanceM / 1000, 3),
    fresnel_clearance: round(clearanceM, 1),
    midpoint: {
      lat: round((lat1 + lat2) / 2, 6),
      lon: round((lon1 + lon2) / 2, 6),
    },
    obstruction: clear
      ? null
      : {
          type: 'radio_horizon',
          excess_m: round(Math.abs(clearanceM), 1),
        },
    model: 'local_radio_horizon_estimate',
  };
}

export function buildLocalElevationSamples(query: URLSearchParams) {
  const locations = query.get('locations') ?? '';

  return {
    locations: locations
      .split('|')
      .filter(Boolean)
      .map((location) => {
        const [lat, lon] = location.split(',').map(Number);
        return { lat, lon, elevation_m: null };
      }),
    source: 'local_coordinate_samples',
  };
}

export function buildLocalWeatherRadarBounds(query: URLSearchParams) {
  const lat = Number(query.get('lat'));
  const lon = Number(query.get('lon'));
  const inContiguousUs =
    lat >= CONTIGUOUS_US_BOUNDS.south &&
    lat <= CONTIGUOUS_US_BOUNDS.north &&
    lon >= CONTIGUOUS_US_BOUNDS.west &&
    lon <= CONTIGUOUS_US_BOUNDS.east;

  return {
    country: inContiguousUs ? 'United States' : null,
    country_code: inContiguousUs ? 'US' : null,
    bounds: inContiguousUs ? CONTIGUOUS_US_BOUNDS : null,
    source: 'local_country_bounds',
  };
}

export function buildLocalPeerHistory(snapshot: MapSnapshot, deviceId: string, limit: number) {
  const nodeIndex = buildNodeIndex(snapshot.nodes);
  const selected = findNode(nodeIndex, deviceId);
  const peerKeys = new Set<string>();

  if (selected) {
    for (const neighbor of selected.neighbors ?? []) peerKeys.add(neighbor);
  }

  for (const link of snapshot.links) {
    if (typeof link.source !== 'string' || typeof link.target !== 'string') continue;

    const sourceMatches = selected
      ? keyMatchesNode(link.source, selected)
      : link.source === deviceId;
    const targetMatches = selected
      ? keyMatchesNode(link.target, selected)
      : link.target === deviceId;

    if (sourceMatches) peerKeys.add(link.target);
    if (targetMatches) peerKeys.add(link.source);
  }

  for (const route of snapshot.routes) {
    const path = Array.isArray(route.path)
      ? route.path.filter((key): key is string => typeof key === 'string')
      : [];
    if (!path.length) continue;

    const index = path.findIndex((key) => (selected ? keyMatchesNode(key, selected) : key === deviceId));
    if (index > 0) peerKeys.add(path[index - 1]);
    if (index >= 0 && index < path.length - 1) peerKeys.add(path[index + 1]);
  }

  const peers = Array.from(peerKeys)
    .map((key) => {
      const node = findNode(nodeIndex, key);
      return {
        public_key: node?.publicKey ?? key,
        publicKey: node?.publicKey ?? key,
        name: node?.name ?? key,
        last_heard: node?.lastHeardAt ?? null,
        lastHeard: node?.lastHeardAt ?? null,
        snr: node?.radio?.snr ?? null,
        rssi: node?.radio?.rssi ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = a.last_heard ? Date.parse(a.last_heard) : 0;
      const bTime = b.last_heard ? Date.parse(b.last_heard) : 0;
      return bTime - aTime;
    })
    .slice(0, limit);

  return {
    device_id: deviceId,
    source: sourceMeta(snapshot),
    generated_at: snapshot.generatedAt,
    node: selected
      ? {
          public_key: selected.publicKey,
          name: selected.name,
        }
      : null,
    peers,
  };
}
