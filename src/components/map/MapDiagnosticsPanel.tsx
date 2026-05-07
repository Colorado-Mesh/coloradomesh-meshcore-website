'use client';

import type {
  MapAdvancedFeature,
  MapConnectionStatus,
  MapRuntimePublicConfig,
  MapSnapshotSource,
  MapSnapshotWarning,
} from '@/lib/types';
import { formatRelativeTime } from './format';

interface MapDiagnosticsPanelProps {
  source: MapSnapshotSource | null;
  connection: MapConnectionStatus | null;
  runtimeConfig: MapRuntimePublicConfig | null;
  warnings: MapSnapshotWarning[];
  features: MapAdvancedFeature[];
  generatedAt: Date | null;
}

const CONNECTION_LABEL: Record<string, string> = {
  sample: 'Sample data',
  not_configured: 'Not configured',
  configured: 'Configured',
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
};

const CONNECTION_TONE: Record<string, string> = {
  sample: 'cm-pill--sunset',
  not_configured: 'cm-pill--dim',
  configured: 'cm-pill--sky',
  connected: 'cm-pill--mesh',
  disconnected: 'cm-pill--dim',
  error: 'cm-pill--red',
};

const SEVERITY_TONE: Record<string, string> = {
  info: 'cm-diag-warning--info',
  warning: 'cm-diag-warning--warning',
  critical: 'cm-diag-warning--critical',
};

const FEATURE_TONE: Record<string, string> = {
  available: 'cm-diag-feature--available',
  unavailable: 'cm-diag-feature--unavailable',
  deferred: 'cm-diag-feature--deferred',
};

const FEATURE_LABEL: Record<string, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
  deferred: 'Deferred',
};

function tileHostFromUrl(tileUrl: string): string | null {
  if (!tileUrl) return null;
  try {
    const probe = tileUrl
      .replaceAll('{s}', 'a')
      .replaceAll('{z}', '0')
      .replaceAll('{x}', '0')
      .replaceAll('{y}', '0')
      .replaceAll('{r}', '');
    return new URL(probe).host || null;
  } catch {
    return null;
  }
}

export default function MapDiagnosticsPanel({
  source,
  connection,
  runtimeConfig,
  warnings,
  features,
  generatedAt,
}: MapDiagnosticsPanelProps) {
  const state = connection?.state ?? 'not_configured';
  const tone = CONNECTION_TONE[state] ?? CONNECTION_TONE.not_configured;
  const label = CONNECTION_LABEL[state] ?? state;
  const generatedRelative = generatedAt ? formatRelativeTime(generatedAt.toISOString()) : 'Unknown';
  const tileHost = runtimeConfig ? tileHostFromUrl(runtimeConfig.tileUrl) : null;

  return (
    <section
      className="cm-diag"
      aria-label="Live map diagnostics"
      data-testid="map-diagnostics"
    >
      <div className="cm-diag__head">
        <span className={`cm-pill ${tone}`}>{label}</span>
        <div className="cm-diag__source">
          <div className="cm-diag__source-label">{source?.label ?? 'No live source'}</div>
          {runtimeConfig?.sourceLabel && runtimeConfig.sourceLabel !== source?.label && (
            <div className="cm-diag__source-sub">{runtimeConfig.sourceLabel}</div>
          )}
        </div>
        <div className="cm-diag__freshness" aria-label="Snapshot freshness">
          <span className="cm-diag__freshness-label">Snapshot</span>
          <span className="cm-diag__freshness-value">{generatedRelative}</span>
        </div>
      </div>

      {connection?.message && (
        <p className="cm-diag__message">{connection.message}</p>
      )}

      {warnings.length > 0 && (
        <ul className="cm-diag__warnings" aria-label="Live map warnings">
          {warnings.map((warning) => (
            <li
              key={warning.id}
              className={`cm-diag-warning ${SEVERITY_TONE[warning.severity] ?? SEVERITY_TONE.info}`}
              role={warning.severity === 'critical' ? 'alert' : 'status'}
            >
              <span className="cm-diag-warning__severity">{warning.severity}</span>
              <span className="cm-diag-warning__text">{warning.message}</span>
            </li>
          ))}
        </ul>
      )}

      {features.length > 0 && (
        <div className="cm-diag__features" aria-label="Advanced live-map features">
          <div className="cm-diag__features-label">Operator features</div>
          <ul className="cm-diag__features-list">
            {features.map((feature) => (
              <li
                key={feature.id}
                className={`cm-diag-feature ${FEATURE_TONE[feature.status] ?? ''}`}
              >
                <span className="cm-diag-feature__label">{feature.label}</span>
                <span className="cm-diag-feature__status">
                  {FEATURE_LABEL[feature.status] ?? feature.status}
                </span>
                <span className="cm-diag-feature__message">{feature.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="cm-diag__meta">
        <div className="cm-diag__meta-row">
          <dt>Source</dt>
          <dd>{source?.type ?? 'empty'}</dd>
        </div>
        {tileHost && (
          <div className="cm-diag__meta-row">
            <dt>Tile host</dt>
            <dd>{tileHost}</dd>
          </div>
        )}
        {connection?.topic && (
          <div className="cm-diag__meta-row">
            <dt>MQTT topic</dt>
            <dd>{connection.topic}</dd>
          </div>
        )}
        <div className="cm-diag__meta-row">
          <dt>History</dt>
          <dd>{connection?.historyEnabled ? 'Enabled' : 'Disabled'}</dd>
        </div>
        {source?.lastUpdated && (
          <div className="cm-diag__meta-row">
            <dt>Last source update</dt>
            <dd>{formatRelativeTime(source.lastUpdated)}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
