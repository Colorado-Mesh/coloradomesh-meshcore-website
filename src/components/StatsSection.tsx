'use client';

import {
  COMMUNITY_NAME,
  DEFAULT_REFRESH_INTERVAL,
} from '@/lib/constants';
import { useMapStats } from '@/hooks/useMapSnapshot';

interface StatCardProps {
  value: string;
  label: string;
  sublabel: string;
  loading: boolean;
  unavailable: boolean;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  isActive?: boolean;
}

function StatCard({
  value,
  label,
  sublabel,
  loading,
  unavailable,
  icon,
  iconBgClass,
  iconColorClass,
  isActive,
}: StatCardProps) {
  const display = loading ? null : unavailable ? '—' : value;

  return (
    <div className={`card-mesh p-6 sm:p-8 text-center ${isActive ? 'node-active' : ''}`}>
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${iconBgClass} mb-4`}>
        <div className={iconColorClass}>{icon}</div>
      </div>
      <p className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {display === null ? (
          <span className="inline-block w-16 h-10 bg-foreground-muted/20 rounded animate-pulse" />
        ) : (
          display
        )}
      </p>
      <p className="text-foreground-muted font-medium">{label}</p>
      <p className="text-sm text-foreground-muted/70 mt-1">{sublabel}</p>
    </div>
  );
}

interface StatsSectionProps {
  refreshInterval?: number;
}

function formatRelativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return null;

  const diffSeconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export function StatsSection({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: StatsSectionProps = {}) {
  const { stats, loading, error } = useMapStats({
    enabled: refreshInterval >= 0,
    refreshInterval,
  });

  const unavailable = !loading && (!!error || !stats);
  const sourceLabel = stats?.source.label ?? 'Live network map';
  const lastUpdatedRelative = formatRelativeTime(stats?.lastUpdated ?? null);
  const formatNumber = (value: number | null | undefined) =>
    typeof value === 'number' ? value.toLocaleString() : '—';

  const onlineSublabel = stats
    ? stats.onlineNodes > 0
      ? `of ${formatNumber(stats.totalNodes)} nodes seen`
      : `Heard nothing recently across ${formatNumber(stats.totalNodes)} known nodes`
    : 'Heard within freshness window';

  const repeaterSublabel = stats
    ? stats.repeaterNodes > 0
      ? `${formatNumber(stats.locatedNodes)} nodes mapped on the live map`
      : 'No repeaters reporting in window'
    : 'Reporting on the live map';

  const visibleSublabel = stats
    ? `Mapped within the last ${stats.visibleNodes > 0 ? '24h' : 'window'}`
    : 'Visible on the live network map';

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <p className="eyebrow">
              <span aria-hidden>◊</span>
              <span>Live network signal</span>
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {COMMUNITY_NAME} at a glance
            </h2>
            <p className="mt-2 text-sm text-foreground-muted max-w-xl">
              Map-derived metrics streamed from the public live network map. Numbers update on a short interval and may dip when MQTT ingest is paused.
            </p>
          </div>
          <div className="text-xs text-foreground-dim font-mono uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-2">
              <span
                className={`status-dot ${unavailable ? 'status-dot-amber' : 'status-dot-pulse'}`}
                aria-hidden
              />
              {unavailable
                ? 'data unavailable'
                : `${sourceLabel}${lastUpdatedRelative ? ` · ${lastUpdatedRelative}` : ''}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <StatCard
            value={formatNumber(stats?.onlineNodes)}
            label="Nodes Online"
            sublabel={onlineSublabel}
            loading={loading}
            unavailable={unavailable}
            isActive
            iconBgClass="bg-mesh/10"
            iconColorClass="text-mesh"
            icon={
              <svg
                className="h-7 w-7"
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
            }
          />

          <StatCard
            value={formatNumber(stats?.visibleNodes)}
            label="Mapped Nodes"
            sublabel={visibleSublabel}
            loading={loading}
            unavailable={unavailable}
            iconBgClass="bg-mountain-500/10"
            iconColorClass="text-mountain-500"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />

          <StatCard
            value={formatNumber(stats?.repeaterNodes)}
            label="Active Repeaters"
            sublabel={repeaterSublabel}
            loading={loading}
            unavailable={unavailable}
            iconBgClass="bg-forest-500/10"
            iconColorClass="text-forest-500"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
