'use client';

import type { MapAdvancedFeature } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface LiveMapStatsPanelProps {
  features: MapAdvancedFeature[];
  enabled: boolean;
}

interface UpstreamStatsShape {
  decoder?: Record<string, unknown> | null;
  mqtt?: Record<string, unknown> | null;
  uptime_seconds?: number | null;
  uptime?: number | null;
  message_count?: number | null;
  packet_count?: number | null;
  node_count?: number | null;
  connected_clients?: number | null;
  source?: { label?: string | null; type?: string | null } | null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function findFirst(record: Record<string, unknown> | null | undefined, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = readNumber(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function readBooleanFlag(record: Record<string, unknown> | null | undefined, keys: string[]): boolean | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return null;
}

function formatUptime(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function LiveMapStatsPanel({ features, enabled }: LiveMapStatsPanelProps) {
  const advancedFeature = features.find((feature) => feature.id === 'advanced-live-map-proxy');
  const advancedAvailable = advancedFeature?.status === 'available';
  const url = enabled && advancedAvailable ? API_ROUTES.LIVE_MAP_STATS : null;
  const { data, loading, error, lastUpdated, refetch } = useLiveMapResource<UpstreamStatsShape>(url, {
    enabled: Boolean(url),
    refreshIntervalMs: 30_000,
  });

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Live-map stats">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Live-map stats</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedFeature?.message ?? 'Configure the live-map upstream on the server to expose decoder stats.'}
        </p>
      </section>
    );
  }

  const decoder = (data?.decoder ?? null) as Record<string, unknown> | null;
  const mqtt = (data?.mqtt ?? null) as Record<string, unknown> | null;
  const uptimeSeconds = readNumber(data?.uptime_seconds) ?? readNumber(data?.uptime);
  const messages =
    findFirst(decoder, ['messages_total', 'messages', 'message_count']) ??
    readNumber(data?.message_count);
  const packets =
    findFirst(decoder, ['packets_total', 'packets', 'packet_count']) ??
    readNumber(data?.packet_count);
  const decoded = findFirst(decoder, ['decoded_total', 'decoded', 'decoded_messages']);
  const errors = findFirst(decoder, ['errors_total', 'errors', 'error_count']);
  const nodeCount =
    findFirst(decoder, ['nodes', 'node_count']) ?? readNumber(data?.node_count);
  const connectedClients = readNumber(data?.connected_clients);
  const mqttConnected = readBooleanFlag(mqtt, ['connected', 'is_connected']);
  const uptimeLabel = formatUptime(uptimeSeconds);
  const sourceLabel = typeof data?.source?.label === 'string' ? data.source.label : null;

  return (
    <section className="cm-panel" aria-label="Live-map stats">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Live-map stats</h2>
        <button
          type="button"
          className="cm-panel__refresh"
          onClick={() => {
            void refetch();
          }}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error ? (
        <p className="cm-panel__error" role="status">
          {error}
        </p>
      ) : loading && !data ? (
        <p className="cm-panel__hint">Fetching live-map stats…</p>
      ) : !data ? (
        <p className="cm-panel__hint">No live-map stats reported yet.</p>
      ) : (
        <>
          <dl className="cm-panel__stats">
            {uptimeLabel && (
              <div className="cm-panel__stat">
                <dt>Uptime</dt>
                <dd>{uptimeLabel}</dd>
              </div>
            )}
            {nodeCount !== null && (
              <div className="cm-panel__stat">
                <dt>Nodes</dt>
                <dd>{nodeCount}</dd>
              </div>
            )}
            {messages !== null && (
              <div className="cm-panel__stat">
                <dt>Messages</dt>
                <dd>{messages.toLocaleString()}</dd>
              </div>
            )}
            {packets !== null && (
              <div className="cm-panel__stat">
                <dt>Packets</dt>
                <dd>{packets.toLocaleString()}</dd>
              </div>
            )}
            {decoded !== null && (
              <div className="cm-panel__stat">
                <dt>Decoded</dt>
                <dd>{decoded.toLocaleString()}</dd>
              </div>
            )}
            {errors !== null && (
              <div className="cm-panel__stat">
                <dt>Errors</dt>
                <dd>{errors.toLocaleString()}</dd>
              </div>
            )}
            {connectedClients !== null && (
              <div className="cm-panel__stat">
                <dt>Clients</dt>
                <dd>{connectedClients}</dd>
              </div>
            )}
            {mqttConnected !== null && (
              <div className="cm-panel__stat">
                <dt>Upstream MQTT</dt>
                <dd>{mqttConnected ? 'Connected' : 'Disconnected'}</dd>
              </div>
            )}
          </dl>
          {sourceLabel && (
            <p className="cm-panel__sub">Source: {sourceLabel}</p>
          )}
          {lastUpdated && (
            <p className="cm-panel__sub">Updated {formatRelativeTime(lastUpdated.toISOString())}</p>
          )}
        </>
      )}
    </section>
  );
}
