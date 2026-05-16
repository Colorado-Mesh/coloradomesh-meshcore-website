'use client';

import { useCallback, useEffect, useState } from 'react';
import { CORESCOPE_API_ROUTES, DEFAULT_REFRESH_INTERVAL } from '@/lib/constants';
import {
  buildMapStats,
  normalizeLiveMapNode,
  uniqueMapNodes,
} from '@/lib/map';
import type {
  MapAdvancedFeature,
  MapConnectionStatus,
  MapNode,
  MapRuntimePublicConfig,
  MapSnapshotSource,
  MapSnapshotWarning,
  MapStats,
} from '@/lib/types';

interface UseMapSnapshotOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseMapSnapshotReturn {
  nodes: MapNode[];
  stats: MapStats | null;
  connection: MapConnectionStatus | null;
  source: MapSnapshotSource | null;
  warnings: MapSnapshotWarning[];
  features: MapAdvancedFeature[];
  runtimeConfig: MapRuntimePublicConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

interface CoreScopeNodesResponse {
  nodes?: unknown[];
  total?: number;
  counts?: Record<string, number>;
}

interface CoreScopeStatsResponse {
  totalNodes?: number;
  totalObservers?: number;
  totalPackets?: number;
  packetsLastHour?: number;
  packetsLast24h?: number;
  counts?: Record<string, number>;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new Error(`Failed to parse ${url} response`);
  }
}

function toCoreScopeSnapshot(
  nodesPayload: CoreScopeNodesResponse,
  statsPayload: CoreScopeStatsResponse
) {
  const generatedAt = new Date().toISOString();
  const source: MapSnapshotSource = {
    type: 'live_map_api',
    label: 'CoreScope analyzer',
    lastUpdated: generatedAt,
  };
  const nodes = uniqueMapNodes(
    (Array.isArray(nodesPayload.nodes) ? nodesPayload.nodes : [])
      .map((node) => normalizeLiveMapNode(node))
      .filter((node): node is MapNode => node !== null)
  );
  const stats = buildMapStats(nodes, [], [], source, 'connected');
  const connection: MapConnectionStatus = {
    state: 'connected',
    configured: true,
    sampleData: false,
    historyEnabled: true,
    topic: null,
    lastConnectedAt: generatedAt,
    lastMessageAt: stats.lastUpdated,
    message: 'CoreScope analyzer endpoints are available.',
  };

  return {
    generatedAt,
    nodes,
    stats: {
      ...stats,
      totalNodes: typeof statsPayload.totalNodes === 'number' ? statsPayload.totalNodes : stats.totalNodes,
      repeaterNodes: typeof statsPayload.counts?.repeaters === 'number' ? statsPayload.counts.repeaters : stats.repeaterNodes,
    },
    connection,
    source,
    warnings: [] as MapSnapshotWarning[],
    features: [] as MapAdvancedFeature[],
    runtimeConfig: null as MapRuntimePublicConfig | null,
  };
}

export function useMapSnapshot(options: UseMapSnapshotOptions = {}): UseMapSnapshotReturn {
  const { refreshInterval = DEFAULT_REFRESH_INTERVAL, enabled = true } = options;

  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [stats, setStats] = useState<MapStats | null>(null);
  const [connection, setConnection] = useState<MapConnectionStatus | null>(null);
  const [source, setSource] = useState<MapSnapshotSource | null>(null);
  const [warnings, setWarnings] = useState<MapSnapshotWarning[]>([]);
  const [features, setFeatures] = useState<MapAdvancedFeature[]>([]);
  const [runtimeConfig, setRuntimeConfig] = useState<MapRuntimePublicConfig | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      const [nodesPayload, statsPayload] = await Promise.all([
        fetchJson<CoreScopeNodesResponse>(CORESCOPE_API_ROUTES.NODES),
        fetchJson<CoreScopeStatsResponse>(CORESCOPE_API_ROUTES.STATS),
      ]);
      const snapshot = toCoreScopeSnapshot(nodesPayload, statsPayload);

      setNodes(snapshot.nodes);
      setStats(snapshot.stats);
      setConnection(snapshot.connection);
      setSource(snapshot.source);
      setWarnings(snapshot.warnings);
      setFeatures(snapshot.features);
      setRuntimeConfig(snapshot.runtimeConfig);
      setError(null);
      setLastUpdated(new Date(snapshot.generatedAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch map data');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();

    if (!enabled) return;

    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, fetchData, refreshInterval]);

  return {
    nodes,
    stats,
    connection,
    source,
    warnings,
    features,
    runtimeConfig,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

export function useMapStats(options: UseMapSnapshotOptions = {}) {
  const { stats, loading, error, lastUpdated, refetch } = useMapSnapshot(options);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refetch,
  };
}
