'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import type { MapAdvancedFeature, MapNode } from '@/lib/types';
import { API_ROUTES } from '@/lib/constants';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface LosPanelProps {
  features: MapAdvancedFeature[];
  defaultCenter?: { latitude: number; longitude: number } | null;
  nodes?: MapNode[];
  selectedNode?: MapNode | null;
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

interface PrefillPair {
  lat1: string;
  lon1: string;
  lat2: string;
  lon2: string;
  source1: string;
  source2: string;
}

const HARDCODED_FALLBACK_1 = { lat: 39.7392, lon: -104.9903, label: 'Denver center' };
const HARDCODED_FALLBACK_2 = { lat: 39.7555, lon: -105.2211, label: 'Lookout Mountain' };

function fmt(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(4) : '';
}

function nodeCoord(node: MapNode | null | undefined): { lat: number; lon: number } | null {
  const c = node?.coordinates;
  if (!c) return null;
  if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) return null;
  return { lat: c.latitude, lon: c.longitude };
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
  nodes: MapNode[],
  selectedNode: MapNode | null | undefined
): PrefillPair {
  const located = nodes.filter((n) => nodeCoord(n));

  let p1: { lat: number; lon: number } | null = null;
  let source1 = '';

  const selectedCoord = nodeCoord(selectedNode ?? null);
  if (selectedCoord) {
    p1 = selectedCoord;
    source1 = `Selected · ${nodeLabel(selectedNode)}`;
  } else if (located.length > 0) {
    const first = nodeCoord(located[0])!;
    p1 = first;
    source1 = `Visible · ${nodeLabel(located[0])}`;
  } else if (
    defaultCenter &&
    Number.isFinite(defaultCenter.latitude) &&
    Number.isFinite(defaultCenter.longitude)
  ) {
    p1 = { lat: defaultCenter.latitude, lon: defaultCenter.longitude };
    source1 = 'Map default center';
  } else {
    p1 = { lat: HARDCODED_FALLBACK_1.lat, lon: HARDCODED_FALLBACK_1.lon };
    source1 = HARDCODED_FALLBACK_1.label;
  }

  let p2: { lat: number; lon: number } | null = null;
  let source2 = '';

  const otherLocated = located.filter(
    (n) => !selectedNode || (n.publicKey !== selectedNode.publicKey && n.id !== selectedNode.id)
  );
  if (otherLocated.length > 0) {
    p2 = nodeCoord(otherLocated[0])!;
    source2 = `Visible · ${nodeLabel(otherLocated[0])}`;
  } else if (
    defaultCenter &&
    Number.isFinite(defaultCenter.latitude) &&
    Number.isFinite(defaultCenter.longitude) &&
    !(p1.lat === defaultCenter.latitude && p1.lon === defaultCenter.longitude)
  ) {
    p2 = { lat: defaultCenter.latitude, lon: defaultCenter.longitude };
    source2 = 'Map default center';
  } else {
    p2 = { lat: HARDCODED_FALLBACK_2.lat, lon: HARDCODED_FALLBACK_2.lon };
    source2 = HARDCODED_FALLBACK_2.label;
  }

  return {
    lat1: fmt(p1.lat),
    lon1: fmt(p1.lon),
    lat2: fmt(p2.lat),
    lon2: fmt(p2.lon),
    source1,
    source2,
  };
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

function validateHeight(input: string): string | null {
  if (input.trim() === '') return null;
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return 'Enter a number.';
  if (parsed < 0) return 'Height must be 0 or greater.';
  return null;
}

export default function LosPanel({
  features,
  defaultCenter,
  nodes = [],
  selectedNode = null,
}: LosPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;

  const prefill = useMemo(
    () => pickPrefill(defaultCenter, nodes, selectedNode),
    [defaultCenter, nodes, selectedNode]
  );

  // Track only the operator-typed override per field; null means "follow prefill".
  // Deriving the displayed value during render lets prefill keep refining as map
  // data loads without setState-in-effect, while user edits stick once made.
  const [userLat1, setUserLat1] = useState<string | null>(null);
  const [userLon1, setUserLon1] = useState<string | null>(null);
  const [userLat2, setUserLat2] = useState<string | null>(null);
  const [userLon2, setUserLon2] = useState<string | null>(null);
  const [h1, setH1] = useState('20');
  const [h2, setH2] = useState('20');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const lat1 = userLat1 ?? prefill.lat1;
  const lon1 = userLon1 ?? prefill.lon1;
  const lat2 = userLat2 ?? prefill.lat2;
  const lon2 = userLon2 ?? prefill.lon2;

  const lat1Id = useId();
  const lon1Id = useId();
  const lat2Id = useId();
  const lon2Id = useId();
  const h1Id = useId();
  const h2Id = useId();
  const lat1ErrId = `${lat1Id}-err`;
  const lon1ErrId = `${lon1Id}-err`;
  const lat2ErrId = `${lat2Id}-err`;
  const lon2ErrId = `${lon2Id}-err`;
  const h1ErrId = `${h1Id}-err`;
  const h2ErrId = `${h2Id}-err`;

  const url = useMemo(() => {
    if (!advancedAvailable || !submitted) return null;
    return submitted;
  }, [advancedAvailable, submitted]);

  const { data, loading, error, lastUpdated } = useLiveMapResource<LosResultShape>(url, {
    enabled: Boolean(url),
  });

  const lat1Error = validateLat(lat1);
  const lon1Error = validateLon(lon1);
  const lat2Error = validateLat(lat2);
  const lon2Error = validateLon(lon2);
  const h1Error = validateHeight(h1);
  const h2Error = validateHeight(h2);
  const inputsValid =
    !lat1Error && !lon1Error && !lat2Error && !lon2Error && !h1Error && !h2Error;

  const restorePrefill = useCallback(() => {
    setUserLat1(null);
    setUserLon1(null);
    setUserLat2(null);
    setUserLon2(null);
  }, []);

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Line-of-sight">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Line of sight</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedMessage ?? 'Configure the live-map upstream on the server to enable LOS calculations.'}
        </p>
      </section>
    );
  }

  const distance =
    typeof data?.distance_km === 'number' && Number.isFinite(data.distance_km)
      ? `${data.distance_km.toFixed(2)} km`
      : typeof data?.distance_m === 'number' && Number.isFinite(data.distance_m)
        ? `${(data.distance_m / 1000).toFixed(2)} km`
        : null;
  const clear =
    typeof data?.clear === 'boolean' ? data.clear : typeof data?.has_los === 'boolean' ? data.has_los : null;

  const userTouched =
    userLat1 !== null || userLon1 !== null || userLat2 !== null || userLon2 !== null;

  return (
    <section className="cm-panel" aria-label="Line-of-sight">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Line of sight</h2>
        <div className="cm-panel__head-actions">
          {userTouched && (
            <button
              type="button"
              className="cm-panel__refresh"
              onClick={restorePrefill}
              title="Restore prefill from selected/visible nodes"
            >
              Restore prefill
            </button>
          )}
          {url && (
            <span className="cm-panel__tag cm-panel__tag--mesh" aria-hidden>
              Probed
            </span>
          )}
        </div>
      </header>

      <p className="cm-panel__sub">
        Point 1: <strong>{prefill.source1 || '—'}</strong> · Point 2:{' '}
        <strong>{prefill.source2 || '—'}</strong>
      </p>

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
              min={-90}
              max={90}
              value={lat1}
              onChange={(event) => setUserLat1(event.target.value)}
              inputMode="decimal"
              aria-label="Lat 1"
              aria-invalid={lat1Error ? true : undefined}
              aria-describedby={lat1Error ? lat1ErrId : undefined}
            />
            {lat1Error && (
              <span id={lat1ErrId} className="cm-panel__field-error" role="alert">
                {lat1Error}
              </span>
            )}
          </label>
          <label htmlFor={lon1Id} className="cm-panel__field">
            <span>Lon 1</span>
            <input
              id={lon1Id}
              type="number"
              step="0.0001"
              min={-180}
              max={180}
              value={lon1}
              onChange={(event) => setUserLon1(event.target.value)}
              inputMode="decimal"
              aria-label="Lon 1"
              aria-invalid={lon1Error ? true : undefined}
              aria-describedby={lon1Error ? lon1ErrId : undefined}
            />
            {lon1Error && (
              <span id={lon1ErrId} className="cm-panel__field-error" role="alert">
                {lon1Error}
              </span>
            )}
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
              aria-label="Height 1 (m)"
              aria-invalid={h1Error ? true : undefined}
              aria-describedby={h1Error ? h1ErrId : undefined}
            />
            {h1Error && (
              <span id={h1ErrId} className="cm-panel__field-error" role="alert">
                {h1Error}
              </span>
            )}
          </label>
        </div>
        <div className="cm-panel__form-row">
          <label htmlFor={lat2Id} className="cm-panel__field">
            <span>Lat 2</span>
            <input
              id={lat2Id}
              type="number"
              step="0.0001"
              min={-90}
              max={90}
              value={lat2}
              onChange={(event) => setUserLat2(event.target.value)}
              inputMode="decimal"
              aria-label="Lat 2"
              aria-invalid={lat2Error ? true : undefined}
              aria-describedby={lat2Error ? lat2ErrId : undefined}
            />
            {lat2Error && (
              <span id={lat2ErrId} className="cm-panel__field-error" role="alert">
                {lat2Error}
              </span>
            )}
          </label>
          <label htmlFor={lon2Id} className="cm-panel__field">
            <span>Lon 2</span>
            <input
              id={lon2Id}
              type="number"
              step="0.0001"
              min={-180}
              max={180}
              value={lon2}
              onChange={(event) => setUserLon2(event.target.value)}
              inputMode="decimal"
              aria-label="Lon 2"
              aria-invalid={lon2Error ? true : undefined}
              aria-describedby={lon2Error ? lon2ErrId : undefined}
            />
            {lon2Error && (
              <span id={lon2ErrId} className="cm-panel__field-error" role="alert">
                {lon2Error}
              </span>
            )}
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
              aria-label="Height 2 (m)"
              aria-invalid={h2Error ? true : undefined}
              aria-describedby={h2Error ? h2ErrId : undefined}
            />
            {h2Error && (
              <span id={h2ErrId} className="cm-panel__field-error" role="alert">
                {h2Error}
              </span>
            )}
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
