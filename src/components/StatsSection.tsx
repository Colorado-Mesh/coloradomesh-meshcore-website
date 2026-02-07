'use client';

import { useStats } from '@/hooks/useStats';

function StatCard({
  value,
  label,
  sublabel,
  loading,
  error,
  icon,
  iconBgClass,
  iconColorClass,
  isActive,
}: {
  value: string | number;
  label: string;
  sublabel: string;
  loading: boolean;
  error: boolean;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  isActive?: boolean;
}) {
  return (
    <div className={`card-mesh p-6 sm:p-8 text-center ${isActive ? 'node-active' : ''}`}>
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${iconBgClass} mb-4`}>
        <div className={iconColorClass}>{icon}</div>
      </div>
      <p className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {loading ? (
          <span className="inline-block w-16 h-10 bg-foreground-muted/20 rounded animate-pulse" />
        ) : error ? (
          '--'
        ) : (
          value
        )}
      </p>
      <p className="text-foreground-muted font-medium">{label}</p>
      <p className="text-sm text-foreground-muted/70 mt-1">{sublabel}</p>
    </div>
  );
}

export function StatsSection() {
  const { stats, loading, error } = useStats({ refreshInterval: 60000 });

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Nodes Heard */}
          <StatCard
            value={stats?.contacts_24h ?? stats?.active_nodes ?? '--'}
            label="Nodes Heard"
            sublabel="Heard in last 24 hours"
            loading={loading}
            error={!!error}
            isActive={true}
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

          {/* Messages */}
          <StatCard
            value={stats?.messages_24h ?? stats?.packets_today ?? '--'}
            label="Messages"
            sublabel="Sent in last 24 hours"
            loading={loading}
            error={!!error}
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />

          {/* Network Reach */}
          <StatCard
            value={stats?.max_hop_count ? `${stats.max_hop_count} hops` : '--'}
            label="Max Network Reach"
            sublabel={stats?.avg_hop_count ? `Avg: ${stats.avg_hop_count.toFixed(1)} hops` : 'Message distance'}
            loading={loading}
            error={!!error}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
