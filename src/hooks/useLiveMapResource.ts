'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiResponse } from '@/lib/types';

interface UseLiveMapResourceOptions {
  enabled?: boolean;
  refreshIntervalMs?: number;
}

export interface LiveMapResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useLiveMapResource<T>(
  url: string | null,
  { enabled = true, refreshIntervalMs }: UseLiveMapResourceOptions = {}
): LiveMapResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url) && enabled);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!url || !enabled) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await fetch(url, { signal: controller.signal });
      setStatus(response.status);

      let payload: ApiResponse<T> | null = null;
      try {
        payload = (await response.json()) as ApiResponse<T>;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload || payload.success !== true || payload.data === undefined) {
        setError(payload?.error ?? `Request failed with status ${response.status}`);
        setData(null);
      } else {
        setError(null);
        setData(payload.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load resource');
      setData(null);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    if (!url || !enabled) {
      setLoading(false);
      return;
    }

    fetchOnce();
    const id = refreshIntervalMs
      ? setInterval(() => {
          fetchOnce();
        }, refreshIntervalMs)
      : null;

    return () => {
      if (id) clearInterval(id);
      abortRef.current?.abort();
    };
  }, [url, enabled, fetchOnce, refreshIntervalMs]);

  return { data, loading, error, status, lastUpdated, refetch: fetchOnce };
}
