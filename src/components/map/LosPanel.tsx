'use client';

import { useId, useMemo, useState } from 'react';
import type { MapAdvancedFeature } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface LosPanelProps {
  features: MapAdvancedFeature[];
  defaultCenter?: { latitude: number; longitude: number } | null;
}

interface LosResultShape {
  clear?: boolean;
  has_los?: boolean;
  fresnel_clearance?: number | null;
  distance_m?: number | null;
  distance_km?: number | null;
  midpoint?: { lat?: number; lon?: number };
  obstruction?: Record<string, unknown> | null;
}

function formatDistance(meters: number | null | undefined, km: number | null | undefined): string | null {
  if (typeof km === 'number' && Number.isFinite(km)) return `${km.toFixed(2)} km`;
  if (typeof meters === 'number' && Number.isFinite(meters)) return `${(meters / 1000).toFixed(2)} km`;
  return null;
}

function isFiniteNumber(input: string): boolean {
  if (input.trim() === '') return false;
  const parsed = Number(input);
  return Number.isFinite(parsed);
}

export default function LosPanel({ features, defaultCenter }: LosPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;

  const fallbackLat = defaultCenter?.latitude?.toFixed(4) ?? '39.7392';
  const fallbackLon = defaultCenter?.longitude?.toFixed(4) ?? '-104.9903';

  const [lat1, setLat1] = useState(fallbackLat);
  const [lon1, setLon1] = useState(fallbackLon);
  const [lat2, setLat2] = useState('39.7555');
  const [lon2, setLon2] = useState('-105.2211');
  const [h1, setH1] = useState('20');
  const [h2, setH2] = useState('20');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const lat1Id = useId();
  const lon1Id = useId();
  const lat2Id = useId();
  const lon2Id = useId();
  const h1Id = useId();
  const h2Id = useId();

  const url = useMemo(() => {
    if (!advancedAvailable || !submitted) return null;
    return submitted;
  }, [advancedAvailable, submitted]);

  const { data, loading, error, lastUpdated } = useLiveMapResource<LosResultShape>(url, {
    enabled: Boolean(url),
  });

  const inputsValid =
    isFiniteNumber(lat1) && isFiniteNumber(lon1) && isFiniteNumber(lat2) && isFiniteNumber(lon2);

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Line-of-sight">
        <header className="cm-panel__head">
          <h3 className="cm-panel__title">Line of sight</h3>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedMessage ?? 'Configure the live-map upstream on the server to enable LOS calculations.'}
        </p>
      </section>
    );
  }

  const distance = formatDistance(data?.distance_m, data?.distance_km);
  const clear =
    typeof data?.clear === 'boolean' ? data.clear : typeof data?.has_los === 'boolean' ? data.has_los : null;

  return (
    <section className="cm-panel" aria-label="Line-of-sight">
      <header className="cm-panel__head">
        <h3 className="cm-panel__title">Line of sight</h3>
        {url && (
          <span className="cm-panel__tag cm-panel__tag--mesh" aria-hidden>
            Probed
          </span>
        )}
      </header>

      <form
        className="cm-panel__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!inputsValid) return;
          const params = new URLSearchParams({ lat1, lon1, lat2, lon2 });
          if (h1.trim()) params.set('h1', h1);
          if (h2.trim()) params.set('h2', h2);
          setSubmitted(`${API_ROUTES.LIVE_MAP_LOS}?${params.toString()}`);
        }}
      >
        <div className="cm-panel__form-row">
          <label htmlFor={lat1Id} className="cm-panel__field">
            <span>Lat 1</span>
            <input
              id={lat1Id}
              type="number"
              step="0.0001"
              value={lat1}
              onChange={(event) => setLat1(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label htmlFor={lon1Id} className="cm-panel__field">
            <span>Lon 1</span>
            <input
              id={lon1Id}
              type="number"
              step="0.0001"
              value={lon1}
              onChange={(event) => setLon1(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label htmlFor={h1Id} className="cm-panel__field cm-panel__field--narrow">
            <span>Height 1 (m)</span>
            <input
              id={h1Id}
              type="number"
              step="1"
              min="0"
              value={h1}
              onChange={(event) => setH1(event.target.value)}
              inputMode="numeric"
            />
          </label>
        </div>
        <div className="cm-panel__form-row">
          <label htmlFor={lat2Id} className="cm-panel__field">
            <span>Lat 2</span>
            <input
              id={lat2Id}
              type="number"
              step="0.0001"
              value={lat2}
              onChange={(event) => setLat2(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label htmlFor={lon2Id} className="cm-panel__field">
            <span>Lon 2</span>
            <input
              id={lon2Id}
              type="number"
              step="0.0001"
              value={lon2}
              onChange={(event) => setLon2(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label htmlFor={h2Id} className="cm-panel__field cm-panel__field--narrow">
            <span>Height 2 (m)</span>
            <input
              id={h2Id}
              type="number"
              step="1"
              min="0"
              value={h2}
              onChange={(event) => setH2(event.target.value)}
              inputMode="numeric"
            />
          </label>
        </div>
        <button
          type="submit"
          className="cm-panel__submit"
          disabled={!inputsValid || loading}
        >
          {loading ? 'Calculating…' : 'Calculate LOS'}
        </button>
      </form>

      {url ? (
        error ? (
          <p className="cm-panel__error" role="status">
            {error}
          </p>
        ) : loading && !data ? (
          <p className="cm-panel__hint">Calculating line-of-sight…</p>
        ) : data ? (
          <dl className="cm-panel__stats">
            {clear !== null && (
              <div className="cm-panel__stat">
                <dt>Result</dt>
                <dd>{clear ? 'Likely clear' : 'Obstructed'}</dd>
              </div>
            )}
            {distance && (
              <div className="cm-panel__stat">
                <dt>Distance</dt>
                <dd>{distance}</dd>
              </div>
            )}
            {typeof data.fresnel_clearance === 'number' && (
              <div className="cm-panel__stat">
                <dt>Fresnel clearance</dt>
                <dd>{data.fresnel_clearance.toFixed(2)} m</dd>
              </div>
            )}
            {lastUpdated && (
              <div className="cm-panel__stat">
                <dt>Probed</dt>
                <dd>{formatRelativeTime(lastUpdated.toISOString())}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="cm-panel__hint">No LOS result returned.</p>
        )
      ) : (
        <p className="cm-panel__sub">
          Inputs are sent only to the local <code>/api/live-map/los</code> proxy. Upstream credentials
          stay on the server.
        </p>
      )}
    </section>
  );
}
