'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import type { MapAdvancedFeature, MapNode } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface WeatherRadarPanelProps {
  features: MapAdvancedFeature[];
  defaultCenter?: { latitude: number; longitude: number } | null;
  selectedNode?: MapNode | null;
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

const HARDCODED_FALLBACK = { lat: 39.5501, lon: -105.7821, label: 'Colorado center' };

function fmt(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(4) : '';
}

function nodeLabel(node: MapNode | null | undefined): string {
  if (!node) return '';
  const name = node.name?.trim();
  if (name) return name.length > 22 ? `${name.slice(0, 21)}…` : name;
  const key = node.publicKey || node.id;
  return key ? `${key.slice(0, 8)}…` : 'node';
}

function pickPrefill(
  defaultCenter: { latitude: number; longitude: number } | null | undefined,
  selectedNode: MapNode | null | undefined
): { lat: string; lon: string; source: string } {
  const c = selectedNode?.coordinates;
  if (c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude)) {
    return { lat: fmt(c.latitude), lon: fmt(c.longitude), source: `Selected · ${nodeLabel(selectedNode)}` };
  }
  if (
    defaultCenter &&
    Number.isFinite(defaultCenter.latitude) &&
    Number.isFinite(defaultCenter.longitude)
  ) {
    return {
      lat: fmt(defaultCenter.latitude),
      lon: fmt(defaultCenter.longitude),
      source: 'Map default center',
    };
  }
  return { lat: fmt(HARDCODED_FALLBACK.lat), lon: fmt(HARDCODED_FALLBACK.lon), source: HARDCODED_FALLBACK.label };
}

function parseCoord(input: string): number | null {
  if (input.trim() === '') return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateLat(input: string): string | null {
  const value = parseCoord(input);
  if (value === null) return 'Enter a number.';
  if (value < -90 || value > 90) return 'Latitude must be between -90 and 90.';
  return null;
}

function validateLon(input: string): string | null {
  const value = parseCoord(input);
  if (value === null) return 'Enter a number.';
  if (value < -180 || value > 180) return 'Longitude must be between -180 and 180.';
  return null;
}

export default function WeatherRadarPanel({
  features,
  defaultCenter,
  selectedNode = null,
}: WeatherRadarPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;

  const prefill = useMemo(
    () => pickPrefill(defaultCenter, selectedNode),
    [defaultCenter, selectedNode]
  );

  // Track only the operator-typed override; null means "follow prefill". This avoids the
  // setState-in-effect anti-pattern by deriving the displayed value during render.
  const [userLat, setUserLat] = useState<string | null>(null);
  const [userLon, setUserLon] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const lat = userLat ?? prefill.lat;
  const lon = userLon ?? prefill.lon;

  const latId = useId();
  const lonId = useId();
  const latErrId = `${latId}-err`;
  const lonErrId = `${lonId}-err`;

  const url = advancedAvailable && submittedUrl ? submittedUrl : null;
  const { data, loading, error, lastUpdated } = useLiveMapResource<CountryBoundsShape>(url, {
    enabled: Boolean(url),
  });

  const latError = validateLat(lat);
  const lonError = validateLon(lon);
  const inputsValid = !latError && !lonError;

  const restorePrefill = useCallback(() => {
    setUserLat(null);
    setUserLon(null);
  }, []);

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

  const userTouched = userLat !== null || userLon !== null;

  return (
    <section className="cm-panel" aria-label="Weather radar bounds">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Weather radar</h2>
        <div className="cm-panel__head-actions">
          {userTouched && (
            <button
              type="button"
              className="cm-panel__refresh"
              onClick={restorePrefill}
              title="Restore prefill from selected node or map default center"
            >
              Restore prefill
            </button>
          )}
          {submittedUrl && (
            <span className="cm-panel__tag cm-panel__tag--mesh" aria-hidden>
              Probed
            </span>
          )}
        </div>
      </header>

      <p className="cm-panel__sub">
        Coordinate source: <strong>{prefill.source}</strong>. Probes the country-bounds endpoint via the
        local <code>/api/live-map/weather/radar/country-bounds</code> proxy. Tile rendering is on the
        roadmap.
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
              min={-90}
              max={90}
              value={lat}
              onChange={(event) => setUserLat(event.target.value)}
              inputMode="decimal"
              aria-label="Latitude"
              aria-invalid={latError ? true : undefined}
              aria-describedby={latError ? latErrId : undefined}
            />
            {latError && (
              <span id={latErrId} className="cm-panel__field-error" role="alert">
                {latError}
              </span>
            )}
          </label>
          <label htmlFor={lonId} className="cm-panel__field">
            <span>Longitude</span>
            <input
              id={lonId}
              type="number"
              step="0.0001"
              min={-180}
              max={180}
              value={lon}
              onChange={(event) => setUserLon(event.target.value)}
              inputMode="decimal"
              aria-label="Longitude"
              aria-invalid={lonError ? true : undefined}
              aria-describedby={lonError ? lonErrId : undefined}
            />
            {lonError && (
              <span id={lonErrId} className="cm-panel__field-error" role="alert">
                {lonError}
              </span>
            )}
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
