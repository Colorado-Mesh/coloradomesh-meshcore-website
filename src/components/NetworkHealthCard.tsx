'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NetworkHealth, ApiResponse } from '@/lib/types';
import { OBSERVER_REFRESH_INTERVAL } from '@/lib/constants';

interface NetworkHealthCardProps {
  refreshInterval?: number;
}

interface HealthState {
  health: NetworkHealth | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const STATUS_CONFIG = {
  healthy: {
    label: 'Healthy',
    bgColor: 'bg-forest-500',
    borderColor: 'border-forest-500',
    textColor: 'text-forest-500',
  },
  degraded: {
    label: 'Degraded',
    bgColor: 'bg-sunset-500',
    borderColor: 'border-sunset-500',
    textColor: 'text-sunset-500',
  },
  offline: {
    label: 'Offline',
    bgColor: 'bg-error',
    borderColor: 'border-error',
    textColor: 'text-error',
  },
} as const;

export function NetworkHealthCard({ refreshInterval = OBSERVER_REFRESH_INTERVAL }: NetworkHealthCardProps) {
  const [state, setState] = useState<HealthState>({
    health: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data: ApiResponse<NetworkHealth> = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch health data');
      }

      setState({
        health: data.data ?? null,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch data',
      }));
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, refreshInterval]);

  const formatDecimal = (num: number | null | undefined, suffix = ''): string => {
    if (num === null || num === undefined) return '--';
    return `${num.toFixed(1)}${suffix}`;
  };

  const formatLastSeen = (timestamp: string | null | undefined): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const isRecentActivity = (timestamp: string | null | undefined): boolean => {
    if (!timestamp) return false;
    const diffMs = Date.now() - new Date(timestamp).getTime();
    return diffMs < 5 * 60 * 1000; // Less than 5 minutes
  };

  // Determine SNR quality color
  const getSnrColor = (snr: number | null | undefined): string => {
    if (snr === null || snr === undefined) return 'text-foreground-muted border-night-700';
    if (snr >= 10) return 'text-forest-500 border-forest-500';
    if (snr >= 5) return 'text-mesh border-mesh';
    if (snr >= 0) return 'text-sunset-500 border-sunset-500';
    return 'text-error border-error';
  };

  if (state.loading && !state.health) {
    return (
      <div className="card-mesh p-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-night-700 mb-4" />
              <div className="h-5 w-32 rounded bg-night-700 mx-auto mb-2" />
              <div className="h-4 w-24 rounded bg-night-700 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="card-mesh p-8 border-error/50">
        <div className="flex items-center justify-center gap-3 text-error">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">Error loading health data</span>
        </div>
        <p className="mt-2 text-sm text-foreground-muted text-center">{state.error}</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchHealth}
            className="px-4 py-2 bg-mesh/20 text-mesh rounded-lg hover:bg-mesh/30 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { health } = state;
  const statusConfig = health?.status ? STATUS_CONFIG[health.status] : null;
  const snrColorClass = getSnrColor(health?.avg_snr);

  return (
    <div className="card-mesh p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Overall Status */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center h-24 w-24 rounded-full bg-night-800/50 border-4 ${
              statusConfig ? statusConfig.borderColor : 'border-night-700'
            } mb-4`}
          >
            {statusConfig ? (
              <span className={`text-base font-bold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            ) : (
              <span className="text-4xl font-bold text-foreground-muted">--</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Overall Status</h3>
          <p className="text-sm text-foreground-muted">Network health status</p>
        </div>

        {/* Network Score */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center h-24 w-24 rounded-full bg-night-800/50 border-4 ${
              health && health.network_score !== undefined && health.network_score >= 80
                ? 'border-forest-500'
                : health && health.network_score !== undefined && health.network_score >= 60
                  ? 'border-mesh'
                  : health && health.network_score !== undefined && health.network_score >= 40
                    ? 'border-sunset-500'
                    : health && health.network_score !== undefined
                      ? 'border-error'
                      : 'border-night-700'
            } mb-4`}
          >
            <span
              className={`text-2xl font-bold ${
                health && health.network_score !== undefined && health.network_score >= 80
                  ? 'text-forest-500'
                  : health && health.network_score !== undefined && health.network_score >= 60
                    ? 'text-mesh'
                    : health && health.network_score !== undefined && health.network_score >= 40
                      ? 'text-sunset-500'
                      : health && health.network_score !== undefined
                        ? 'text-error'
                        : 'text-foreground-muted'
              }`}
            >
              {health?.network_score !== undefined ? health.network_score : '--'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Network Score</h3>
          <p className="text-sm text-foreground-muted">Combined health rating</p>
        </div>

        {/* Average SNR */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full bg-night-800/50 border-4 ${snrColorClass.split(' ')[1]} mb-4`}>
            <span className={`text-2xl font-bold ${snrColorClass.split(' ')[0]}`}>
              {formatDecimal(health?.avg_snr, '')}
              <span className="text-sm font-normal ml-0.5">dB</span>
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Avg Signal</h3>
          <p className="text-sm text-foreground-muted">Signal-to-noise ratio</p>
        </div>
      </div>

      {/* Additional Metrics */}
      {health && (
        <>
          {/* Bot Metrics Row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-mesh">
                {health.contacts_24h ?? '--'}
              </p>
              <p className="text-xs text-foreground-muted">Contacts (30d)</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-mountain-500">
                {health.messages_24h ?? '--'}
              </p>
              <p className="text-xs text-foreground-muted">Messages (30d)</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-forest-500">
                {health.avg_hop_count ? formatDecimal(health.avg_hop_count, ' hops') : '--'}
              </p>
              <p className="text-xs text-foreground-muted">Avg Reach</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-sunset-500">
                {health.bot_reply_rate !== undefined ? `${health.bot_reply_rate.toFixed(0)}%` : '--'}
              </p>
              <p className="text-xs text-foreground-muted">Bot Response Rate</p>
            </div>
          </div>

          {/* Signal Metrics Row */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-foreground">
                {formatDecimal(health.avg_rssi, ' dBm')}
              </p>
              <p className="text-xs text-foreground-muted">Avg RSSI</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className="text-lg font-mono font-semibold text-foreground">
                {formatDecimal(health.avg_noise_floor, ' dBm')}
              </p>
              <p className="text-xs text-foreground-muted">Noise Floor</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800/30">
              <p className={`text-lg font-mono font-semibold ${isRecentActivity(health.last_packet_at) ? 'text-green-400' : 'text-mesh'}`}>
                {formatLastSeen(health.last_packet_at)}
              </p>
              <p className="text-xs text-foreground-muted">Last Activity</p>
            </div>
          </div>
        </>
      )}

      {/* Score Breakdown */}
      {health?.score_breakdown && (
        <div className="mt-6 p-4 rounded-lg bg-night-800/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
            <span className="text-xs text-foreground-muted">10 pts max each</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: 'status', label: 'Status', color: 'bg-forest-500' },
              { key: 'uptime', label: 'Uptime', color: 'bg-mesh' },
              { key: 'signal', label: 'Signal', color: 'bg-mountain-500' },
              { key: 'activity', label: 'Activity', color: 'bg-sunset-500' },
              { key: 'responsiveness', label: 'Response', color: 'bg-forest-500' },
              { key: 'reach', label: 'Reach', color: 'bg-mesh' },
              { key: 'recency', label: 'Recency', color: 'bg-mountain-500' },
              { key: 'diversity', label: 'Diversity', color: 'bg-sunset-500' },
              { key: 'geo_coverage', label: 'Coverage', color: 'bg-forest-500' },
              { key: 'latency', label: 'Latency', color: 'bg-mesh' },
            ].map(({ key, label, color }) => {
              const value = health.score_breakdown?.[key as keyof typeof health.score_breakdown] ?? 0;
              const percentage = (value / 10) * 100;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">{label}</span>
                    <span className="font-mono text-foreground">{value}</span>
                  </div>
                  <div className="h-1.5 bg-night-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Metrics */}
          {(health.geo_spread_km !== undefined || health.unique_contributors !== undefined) && (
            <div className="mt-4 pt-3 border-t border-night-700 flex flex-wrap gap-4 text-xs">
              {health.geo_spread_km !== undefined && health.geo_spread_km > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-foreground-muted">Coverage:</span>
                  <span className="font-mono text-foreground">{health.geo_spread_km} km</span>
                </div>
              )}
              {health.max_hop_count !== undefined && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-mesh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-foreground-muted">Max Hops:</span>
                  <span className="font-mono text-foreground">{health.max_hop_count}</span>
                </div>
              )}
              {health.unique_contributors !== undefined && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-sunset-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-foreground-muted">Messagers:</span>
                  <span className="font-mono text-foreground">{health.unique_contributors}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Last Activity & Legend */}
      <div className="mt-8 pt-8 border-t border-card-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Last packet received */}
          <div className="text-sm text-foreground-muted">
            <span>Last packet: </span>
            <span className={`font-medium ${isRecentActivity(health?.last_packet_at) ? 'text-green-400' : 'text-foreground'}`}>
              {formatLastSeen(health?.last_packet_at)}
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-forest-500" />
              <span className="text-foreground-muted">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sunset-500" />
              <span className="text-foreground-muted">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-error" />
              <span className="text-foreground-muted">Offline</span>
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {state.lastUpdated && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-muted">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>
              Auto-refreshing every {refreshInterval / 1000}s • Last updated:{' '}
              {state.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
