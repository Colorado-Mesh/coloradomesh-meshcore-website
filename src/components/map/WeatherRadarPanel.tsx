'use client';

import { useId, useState } from 'react';
import type { MapAdvancedFeature } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface WeatherRadarPanelProps {
  features: MapAdvancedFeature[];
  defaultCenter?: { latitude: number; longitude: number } | null;
}

interface CountryBoundsShape {
  country?: string | null;
  country_code?: string | null;
  bounds?: {
    north?: number;
    south?: number;
    east?: number;
    west?: number;
  } | null;
}

function isFiniteNumber(input: string): boolean {
  if (input.trim() === '') return false;
  const parsed = Number(input);
  return Number.isFinite(parsed);
}

export default function WeatherRadarPanel({ features, defaultCenter }: WeatherRadarPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;

  const fallbackLat = defaultCenter?.latitude?.toFixed(4) ?? '39.5501';
  const fallbackLon = defaultCenter?.longitude?.toFixed(4) ?? '-105.7821';

  const [lat, setLat] = useState(fallbackLat);
  const [lon, setLon] = useState(fallbackLon);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const latId = useId();
  const lonId = useId();

  const url = advancedAvailable && submittedUrl ? submittedUrl : null;
  const { data, loading, error, lastUpdated } = useLiveMapResource<CountryBoundsShape>(url, {
    enabled: Boolean(url),
  });

  const inputsValid = isFiniteNumber(lat) && isFiniteNumber(lon);

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Weather radar bounds">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Weather radar</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedMessage ??
            'Weather radar overlays require the upstream live-map service to be configured by an operator.'}
        </p>
      </section>
    );
  }

  return (
    <section className="cm-panel" aria-label="Weather radar bounds">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Weather radar</h2>
        {submittedUrl && (
          <span className="cm-panel__tag cm-panel__tag--mesh" aria-hidden>
            Probed
          </span>
        )}
      </header>

      <p className="cm-panel__sub">
        Probes the upstream country-bounds endpoint to confirm radar tiling availability for a coordinate.
        Tile rendering is on the roadmap.
      </p>

      <form
        className="cm-panel__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!inputsValid) return;
          const params = new URLSearchParams({ lat, lon });
          setSubmittedUrl(`${API_ROUTES.LIVE_MAP_WEATHER_RADAR_COUNTRY_BOUNDS}?${params.toString()}`);
        }}
      >
        <div className="cm-panel__form-row">
          <label htmlFor={latId} className="cm-panel__field">
            <span>Latitude</span>
            <input
              id={latId}
              type="number"
              step="0.0001"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label htmlFor={lonId} className="cm-panel__field">
            <span>Longitude</span>
            <input
              id={lonId}
              type="number"
              step="0.0001"
              value={lon}
              onChange={(event) => setLon(event.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
        <button
          type="submit"
          className="cm-panel__submit"
          disabled={!inputsValid || loading}
        >
          {loading ? 'Probing…' : 'Probe bounds'}
        </button>
      </form>

      {submittedUrl ? (
        error ? (
          <p className="cm-panel__error" role="status">
            {error}
          </p>
        ) : loading && !data ? (
          <p className="cm-panel__hint">Probing weather radar bounds…</p>
        ) : data ? (
          <dl className="cm-panel__stats">
            {data.country && (
              <div className="cm-panel__stat">
                <dt>Country</dt>
                <dd>{data.country}</dd>
              </div>
            )}
            {data.country_code && (
              <div className="cm-panel__stat">
                <dt>Code</dt>
                <dd>{data.country_code}</dd>
              </div>
            )}
            {data.bounds && (
              <div className="cm-panel__stat">
                <dt>Bounds</dt>
                <dd>
                  N {data.bounds.north?.toFixed(2) ?? '—'} · S {data.bounds.south?.toFixed(2) ?? '—'} · E{' '}
                  {data.bounds.east?.toFixed(2) ?? '—'} · W {data.bounds.west?.toFixed(2) ?? '—'}
                </dd>
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
          <p className="cm-panel__hint">No bounds reported.</p>
        )
      ) : null}
    </section>
  );
}
