'use client';

import { useCallback, useEffect, useState } from 'react';
import { API_ROUTES, DEFAULT_REFRESH_INTERVAL } from '@/lib/constants';
import type {
  ApiResponse,
  MapAdvancedFeature,
  MapConnectionStatus,
  MapNode,
  MapRuntimePublicConfig,
  MapSnapshot,
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

async function fetchApiResponse<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Failed to parse ${url} response`);
  }

  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.error || `Failed to fetch ${url}`);
  }

  return payload.data;
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
      const [snapshot, nextRuntimeConfig] = await Promise.all([
        fetchApiResponse<MapSnapshot>(API_ROUTES.MAP_SNAPSHOT),
        fetchApiResponse<MapRuntimePublicConfig>(API_ROUTES.MAP_RUNTIME),
      ]);

      setNodes(snapshot.nodes);
      setStats(snapshot.stats);
      setConnection(snapshot.connection);
      setSource(snapshot.source);
      setWarnings(snapshot.warnings);
      setFeatures(snapshot.features);
      setRuntimeConfig(nextRuntimeConfig);
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
