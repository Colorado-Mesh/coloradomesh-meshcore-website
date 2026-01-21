'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityStats, NetworkHealth, ApiResponse } from '@/lib/types';

interface UseStatsOptions {
  refreshInterval?: number;
  includeHealth?: boolean;
}

interface UseStatsReturn {
  stats: CommunityStats | null;
  health: NetworkHealth | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching community stats and network health data with auto-refresh.
 *
 * @param options.refreshInterval - Auto-refresh interval in milliseconds (default: 60000)
 * @param options.includeHealth - Whether to also fetch network health data (default: false)
 * @returns Stats data, loading state, error state, and refetch function
 */
export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const { refreshInterval = 60000, includeHealth = false } = options;

  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      if (includeHealth) {
        // Fetch both stats and health in parallel
        // Allow browser/CDN caching - server sets s-maxage=30, stale-while-revalidate=60
        const [statsRes, healthRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/health'),
        ]);

        if (!statsRes.ok) {
          throw new Error(`Stats API returned ${statsRes.status}`);
        }
        if (!healthRes.ok) {
          throw new Error(`Health API returned ${healthRes.status}`);
        }

        let statsData: ApiResponse<CommunityStats>;
        let healthData: ApiResponse<NetworkHealth>;

        try {
          statsData = await statsRes.json();
        } catch {
          throw new Error('Failed to parse stats response');
        }

        try {
          healthData = await healthRes.json();
        } catch {
          throw new Error('Failed to parse health response');
        }

        if (!statsData.success) {
          throw new Error(statsData.error || 'Failed to fetch stats');
        }
        if (!healthData.success) {
          throw new Error(healthData.error || 'Failed to fetch health');
        }

        setStats(statsData.data ?? null);
        setHealth(healthData.data ?? null);
      } else {
        // Fetch only stats - allow browser/CDN caching
        const res = await fetch('/api/stats');

        if (!res.ok) {
          throw new Error(`Stats API returned ${res.status}`);
        }

        let data: ApiResponse<CommunityStats>;
        try {
          data = await res.json();
        } catch {
          throw new Error('Failed to parse stats response');
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch stats');
        }

        setStats(data.data ?? null);
      }

      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [includeHealth]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    stats,
    health,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}
