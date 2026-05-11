'use client';

import { useState } from 'react';
import type { MapAdvancedFeature } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface CoveragePanelProps {
  features: MapAdvancedFeature[];
}

interface CoverageShape {
  features?: unknown[];
  rings?: unknown[];
  cells?: unknown[];
  type?: string;
  generated_at?: string | null;
}

function countCoverage(data: CoverageShape | null): number | null {
  if (!data) return null;
  if (Array.isArray(data.features)) return data.features.length;
  if (Array.isArray(data.rings)) return data.rings.length;
  if (Array.isArray(data.cells)) return data.cells.length;
  return null;
}

export default function CoveragePanel({ features }: CoveragePanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;
  const [armed, setArmed] = useState(false);

  const { data, loading, error, lastUpdated, refetch } = useLiveMapResource<CoverageShape>(
    armed && advancedAvailable ? API_ROUTES.LIVE_MAP_COVERAGE : null,
    { enabled: armed && advancedAvailable }
  );

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Coverage overlay">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Coverage overlay</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedMessage ??
            'Coverage overlay requires the upstream live-map service to be configured by an operator.'}
        </p>
      </section>
    );
  }

  const count = countCoverage(data);

  return (
    <section className="cm-panel" aria-label="Coverage overlay">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Coverage overlay</h2>
        {armed ? (
          <button
            type="button"
            className="cm-panel__refresh"
            onClick={() => {
              void refetch();
            }}
            disabled={loading}
          >
            {loading ? 'Probing…' : 'Refresh'}
          </button>
        ) : (
          <button
            type="button"
            className="cm-panel__refresh"
            onClick={() => setArmed(true)}
          >
            Probe coverage
          </button>
        )}
      </header>

      {!armed ? (
        <p className="cm-panel__hint">
          Tap probe to fetch coverage data through the local <code>/api/live-map/coverage</code> route.
          Local live-map coverage fallback data may be used when upstream coverage is unavailable. The
          probe is not automatic to avoid pulling large payloads on every load.
        </p>
      ) : error ? (
        <p className="cm-panel__error" role="status">
          {error}
        </p>
      ) : loading ? (
        <p className="cm-panel__hint">Fetching coverage data…</p>
      ) : !data ? (
        <p className="cm-panel__hint">No coverage data reported yet.</p>
      ) : (
        <>
          <dl className="cm-panel__stats">
            {count !== null && (
              <div className="cm-panel__stat">
                <dt>Records</dt>
                <dd>{count}</dd>
              </div>
            )}
            {data.type && (
              <div className="cm-panel__stat">
                <dt>Type</dt>
                <dd>{data.type}</dd>
              </div>
            )}
            {data.generated_at && (
              <div className="cm-panel__stat">
                <dt>Generated</dt>
                <dd>{formatRelativeTime(data.generated_at)}</dd>
              </div>
            )}
          </dl>
          <p className="cm-panel__sub">
            Coverage rendering on the Leaflet canvas is on the roadmap. The route returns upstream data
            when available and falls back to local live-map coverage so operator tools can validate
            availability.
          </p>
          {lastUpdated && (
            <p className="cm-panel__sub">Probed {formatRelativeTime(lastUpdated.toISOString())}</p>
          )}
        </>
      )}
    </section>
  );
}
