'use client';

import { useStats } from '@/hooks/useStats';
import { formatNumber, formatPercentage, formatDecimal } from '@/lib/utils';
import { OBSERVER_REFRESH_INTERVAL } from '@/lib/constants';

interface ObserverStatsProps {
  refreshInterval?: number;
}

export function ObserverStats({ refreshInterval = OBSERVER_REFRESH_INTERVAL }: ObserverStatsProps) {
  const { stats, health, loading, error, refetch } = useStats({
    refreshInterval,
    includeHealth: true,
  });

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-mesh p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-night-700" />
              <div className="h-4 w-24 rounded bg-night-700" />
            </div>
            <div className="h-8 w-16 rounded bg-night-700" />
            <div className="h-3 w-32 rounded bg-night-700 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-mesh p-6 border-error/50">
        <div className="flex items-center gap-3 text-error">
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
          <span className="font-medium">Error loading stats</span>
        </div>
        <p className="mt-2 text-sm text-foreground-muted">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-mesh/20 text-mesh rounded-lg hover:bg-mesh/30 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Nodes Heard */}
      <div className="card-mesh p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-mesh/20 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-mesh"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span className="text-sm text-foreground-muted">Nodes Heard</span>
        </div>
        <p className="text-3xl font-bold text-foreground font-mono">
          {formatNumber(stats?.contacts_24h ?? stats?.active_nodes)}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {stats?.contacts_7d ? `${stats.contacts_7d} this week` : 'Heard in last 24h'}
        </p>
      </div>

      {/* Messages Today */}
      <div className="card-mesh p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-mountain-500/20 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-mountain-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-sm text-foreground-muted">Messages</span>
        </div>
        <p className="text-3xl font-bold text-foreground font-mono">
          {formatNumber(stats?.messages_24h ?? stats?.packets_today)}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {stats?.total_messages ? `${formatNumber(stats.total_messages)} total` : '30-day count'}
        </p>
      </div>

      {/* Network Reach */}
      <div className="card-mesh p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-forest-500/20 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-forest-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-sm text-foreground-muted">Network Reach</span>
        </div>
        <p className="text-3xl font-bold text-foreground font-mono">
          {stats?.avg_hop_count ? stats.avg_hop_count.toFixed(1) : formatPercentage(health?.uptime_pct)}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {stats?.avg_hop_count ? `Max: ${stats.max_hop_count} hops` : 'Avg hop count'}
        </p>
      </div>

      {/* Reply Rate */}
      <div className="card-mesh p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-sunset-500/20 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-sunset-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-sm text-foreground-muted">Bot Reply Rate</span>
        </div>
        <p className="text-3xl font-bold text-foreground font-mono">
          {stats?.bot_reply_rate_24h !== undefined ? `${stats.bot_reply_rate_24h.toFixed(0)}%` : formatDecimal(stats?.avg_snr)}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {stats?.bot_reply_rate_24h !== undefined ? '24h command response rate' : 'Signal-to-noise ratio'}
        </p>
      </div>
    </div>
  );
}
