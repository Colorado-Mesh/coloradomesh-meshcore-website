'use client';

import { useStats } from '@/hooks/useStats';
import { OBSERVER_REFRESH_INTERVAL } from '@/lib/constants';

interface TopContributorsProps {
  refreshInterval?: number;
}

export function TopContributors({ refreshInterval = OBSERVER_REFRESH_INTERVAL }: TopContributorsProps) {
  const { stats, loading, error, refetch } = useStats({
    refreshInterval,
    includeHealth: false,
  });

  const topUsers = stats?.top_users ?? [];

  if (loading && !stats) {
    return (
      <div className="card-mesh p-6 animate-pulse">
        <div className="h-6 w-40 rounded bg-night-700 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-night-700" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-night-700 mb-2" />
                <div className="h-3 w-20 rounded bg-night-700" />
              </div>
              <div className="h-6 w-12 rounded bg-night-700" />
            </div>
          ))}
        </div>
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
          <span className="font-medium">Error loading contributors</span>
        </div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-mesh/20 text-mesh rounded-lg hover:bg-mesh/30 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (topUsers.length === 0) {
    return (
      <div className="card-mesh p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
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
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          Top Messagers
        </h3>
        <p className="text-foreground-muted text-sm">No messenger data available yet.</p>
      </div>
    );
  }

  // Calculate total for percentage
  const totalMessages = topUsers.reduce((sum, user) => sum + user.count, 0);

  return (
    <div className="card-mesh p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        Top Messagers
        <span className="text-xs font-normal text-foreground-muted ml-auto">30d</span>
      </h3>

      <div className="space-y-4">
        {topUsers.slice(0, 8).map((user, index) => {
          const percentage = totalMessages > 0 ? (user.count / totalMessages) * 100 : 0;
          const colors = [
            { bg: 'bg-mesh', text: 'text-mesh' },
            { bg: 'bg-mountain-500', text: 'text-mountain-500' },
            { bg: 'bg-forest-500', text: 'text-forest-500' },
            { bg: 'bg-sunset-500', text: 'text-sunset-500' },
            { bg: 'bg-sky-500', text: 'text-sky-500' },
            { bg: 'bg-purple-500', text: 'text-purple-500' },
            { bg: 'bg-amber-500', text: 'text-amber-500' },
            { bg: 'bg-rose-500', text: 'text-rose-500' },
          ];
          const color = colors[index] || colors[colors.length - 1];

          return (
            <div key={user.user} className="flex items-center gap-4">
              {/* Rank badge */}
              <div
                className={`h-10 w-10 rounded-full ${color.bg}/20 flex items-center justify-center font-bold ${color.text}`}
              >
                {index + 1}
              </div>

              {/* User info and progress bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground truncate font-mono text-sm">
                    {user.user}
                  </span>
                  <span className={`text-sm font-mono ${color.text}`}>
                    {user.count}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-night-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total messages footer */}
      <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between text-sm">
        <span className="text-foreground-muted">Total messages</span>
        <span className="font-mono font-semibold text-foreground">{totalMessages}</span>
      </div>
    </div>
  );
}
