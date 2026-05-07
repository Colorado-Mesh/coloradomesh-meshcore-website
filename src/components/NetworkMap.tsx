'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L, { type LatLngBounds, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { MapNode, MapNodeRole, MapNodeStatus, MapRuntimePublicConfig, MapStats } from '@/lib/types';
import { useMapSnapshot } from '@/hooks/useMapSnapshot';
import { DEFAULT_REFRESH_INTERVAL } from '@/lib/constants';

import MapControls from './map/MapControls';
import MapLegend from './map/MapLegend';
import MapStatsOverlay from './map/MapStatsOverlay';
import NodePopup from './map/NodePopup';
import { buildMarkerHtml } from './map/markers';

interface NetworkMapProps {
  nodes?: MapNode[];
  stats?: MapStats | null;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  runtimeConfig?: MapRuntimePublicConfig | null;
  refreshInterval?: number;
  className?: string;
  height?: number | string;
}

const COLORADO_CENTER: LatLngTuple = [39.5501, -105.7821];
const COLORADO_ZOOM = 7;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

type LocatedMapNode = MapNode & {
  coordinates: NonNullable<MapNode['coordinates']>;
};

function hasCoordinates(node: MapNode): node is LocatedMapNode {
  const coords = node.coordinates;
  if (!coords) return false;
  const { latitude, longitude } = coords;
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

interface FitBoundsProps {
  bounds: LatLngBounds | null;
}

function FitBounds({ bounds }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [bounds, map]);
  return null;
}

function MapStateLayer({ children }: { children: React.ReactNode }) {
  return <div className="cm-map__state">{children}</div>;
}

function normalize(value: string | null | undefined): string {
  return value ? value.toLowerCase() : '';
}

function matchesQuery(node: LocatedMapNode, query: string): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (normalize(node.name).includes(needle)) return true;
  if (normalize(node.publicKey).includes(needle)) return true;
  if (normalize(node.id).includes(needle)) return true;
  return false;
}

export function NetworkMap({
  nodes: providedNodes,
  stats: providedStats,
  loading: loadingProp,
  error: errorProp,
  lastUpdated: lastUpdatedProp,
  runtimeConfig: runtimeConfigProp,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  className = '',
  height = 560,
}: NetworkMapProps) {
  const externallyControlled = providedNodes !== undefined;
  const snapshot = useMapSnapshot({
    enabled: !externallyControlled,
    refreshInterval,
  });

  const nodes = useMemo(
    () => (externallyControlled ? providedNodes ?? [] : snapshot.nodes),
    [externallyControlled, providedNodes, snapshot.nodes]
  );
  const stats = externallyControlled ? providedStats ?? null : snapshot.stats;
  const runtimeConfig = runtimeConfigProp ?? snapshot.runtimeConfig;
  const loading = loadingProp ?? snapshot.loading;
  const error = errorProp ?? snapshot.error;
  const lastUpdated = lastUpdatedProp ?? snapshot.lastUpdated;

  // Strip the default Leaflet marker icon URL resolver so divIcon styling is consistent.
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  }, []);

  const locatedNodes = useMemo<LocatedMapNode[]>(
    () => nodes.filter(hasCoordinates),
    [nodes]
  );

  const [query, setQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<MapNodeRole>>(() => new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<MapNodeStatus>>(
    () => new Set()
  );

  const toggleRole = useCallback((role: MapNodeRole) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const toggleStatus = useCallback((status: MapNodeStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedRoles(new Set());
    setSelectedStatuses(new Set());
  }, []);

  const availableRoles = useMemo<MapNodeRole[]>(() => {
    const set = new Set<MapNodeRole>();
    for (const node of locatedNodes) set.add(node.role);
    return Array.from(set);
  }, [locatedNodes]);

  const availableStatuses = useMemo<MapNodeStatus[]>(() => {
    const set = new Set<MapNodeStatus>();
    for (const node of locatedNodes) set.add(node.status);
    return Array.from(set);
  }, [locatedNodes]);

  const effectiveSelectedRoles = useMemo<Set<MapNodeRole>>(() => {
    if (selectedRoles.size === 0) return selectedRoles;
    const next = new Set<MapNodeRole>();
    for (const role of selectedRoles) {
      if (availableRoles.includes(role)) next.add(role);
    }
    return next;
  }, [selectedRoles, availableRoles]);

  const effectiveSelectedStatuses = useMemo<Set<MapNodeStatus>>(() => {
    if (selectedStatuses.size === 0) return selectedStatuses;
    const next = new Set<MapNodeStatus>();
    for (const status of selectedStatuses) {
      if (availableStatuses.includes(status)) next.add(status);
    }
    return next;
  }, [selectedStatuses, availableStatuses]);

  const filtersActive =
    query.trim().length > 0 ||
    effectiveSelectedRoles.size > 0 ||
    effectiveSelectedStatuses.size > 0;

  const markerNodes = useMemo<LocatedMapNode[]>(() => {
    return locatedNodes.filter((node) => {
      if (!matchesQuery(node, query)) return false;
      if (effectiveSelectedRoles.size > 0 && !effectiveSelectedRoles.has(node.role)) {
        return false;
      }
      if (
        effectiveSelectedStatuses.size > 0 &&
        !effectiveSelectedStatuses.has(node.status)
      ) {
        return false;
      }
      return true;
    });
  }, [locatedNodes, query, effectiveSelectedRoles, effectiveSelectedStatuses]);

  const bounds = useMemo<LatLngBounds | null>(() => {
    if (markerNodes.length === 0) return null;
    if (markerNodes.length === 1) {
      const { latitude, longitude } = markerNodes[0].coordinates;
      return L.latLng(latitude, longitude).toBounds(20000); // ~20km
    }
    return L.latLngBounds(
      markerNodes.map(
        (node): LatLngTuple => [node.coordinates.latitude, node.coordinates.longitude]
      )
    );
  }, [markerNodes]);

  const activeRoles = useMemo(() => {
    const set = new Set<MapNodeRole>();
    for (const node of markerNodes) set.add(node.role);
    return set;
  }, [markerNodes]);

  const iconCache = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    const buildKey = (role: MapNodeRole, status: MapNodeStatus) => `${role}:${status}`;
    return {
      get(node: MapNode): L.DivIcon {
        const key = buildKey(node.role, node.status);
        const cached = cache.get(key);
        if (cached) return cached;
        const icon = L.divIcon({
          className: 'cm-marker-icon',
          html: buildMarkerHtml(node.role, node.status),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });
        cache.set(key, icon);
        return icon;
      },
    };
  }, []);

  const containerStyle = { height: typeof height === 'number' ? `${height}px` : height };
  const containerClass = `cm-map ${className}`.trim();
  const showControls = !loading && !error && locatedNodes.length > 0;

  if (loading) {
    return (
      <div className="cm-map-shell">
        <div className={containerClass} style={containerStyle}>
          <MapStateLayer>
            <div className="cm-map__state-inner">
              <span className="status-dot status-dot-pulse" aria-hidden />
              <span className="mono text-xs uppercase tracking-[0.18em] text-foreground-dim">
                Initializing map…
              </span>
            </div>
          </MapStateLayer>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cm-map-shell">
        <div className={containerClass} style={containerStyle}>
          <MapStateLayer>
            <div className="cm-map__state-inner">
              <span className="status-dot status-dot-red" aria-hidden />
              <div>
                <div className="text-foreground font-medium">Could not load map data</div>
                <div className="text-sm text-foreground-muted mt-1">{error}</div>
              </div>
            </div>
          </MapStateLayer>
        </div>
      </div>
    );
  }

  if (locatedNodes.length === 0) {
    return (
      <div className="cm-map-shell">
        <div className={containerClass} style={containerStyle}>
          <MapStateLayer>
            <div className="cm-map__state-inner cm-map__state-inner--empty">
              <span className="status-dot status-dot-amber" aria-hidden />
              <div>
                <div className="text-foreground font-medium">No located nodes yet</div>
                <div className="text-sm text-foreground-muted mt-1 max-w-sm">
                  Once Colorado MeshCore receives node positions, they will appear here. Until then,
                  check the source overlay below for sample data status.
                </div>
              </div>
            </div>
          </MapStateLayer>
          <MapStatsOverlay stats={stats} visibleMarkers={0} lastUpdated={lastUpdated} />
        </div>
      </div>
    );
  }

  const fallbackCenter: LatLngTuple = runtimeConfig
    ? [runtimeConfig.defaultCenter.latitude, runtimeConfig.defaultCenter.longitude]
    : COLORADO_CENTER;
  const center: LatLngTuple = bounds
    ? [bounds.getCenter().lat, bounds.getCenter().lng]
    : fallbackCenter;
  const zoom = runtimeConfig?.defaultZoom ?? COLORADO_ZOOM;
  const tileUrl = runtimeConfig?.tileUrl ?? TILE_URL;
  const tileAttribution = runtimeConfig?.tileAttribution ?? TILE_ATTRIBUTION;

  return (
    <div className="cm-map-shell">
      {showControls && (
        <MapControls
          query={query}
          onQueryChange={setQuery}
          availableRoles={availableRoles}
          selectedRoles={effectiveSelectedRoles}
          onToggleRole={toggleRole}
          availableStatuses={availableStatuses}
          selectedStatuses={effectiveSelectedStatuses}
          onToggleStatus={toggleStatus}
          onClear={clearFilters}
          matchCount={markerNodes.length}
          totalCount={locatedNodes.length}
          filtersActive={filtersActive}
        />
      )}

      <div className={containerClass} style={containerStyle}>
        {markerNodes.length === 0 ? (
          <>
            <MapStateLayer>
              <div className="cm-map__state-inner cm-map__state-inner--empty">
                <span className="status-dot status-dot-amber" aria-hidden />
                <div>
                  <div className="text-foreground font-medium">No nodes match the current filter</div>
                  <div className="text-sm text-foreground-muted mt-1 max-w-sm">
                    {locatedNodes.length === 1
                      ? '1 located node is hidden by the active filter.'
                      : `${locatedNodes.length} located nodes are hidden by the active filter.`}{' '}
                    Adjust the search or role chips above, or clear the filter to plot every node.
                  </div>
                </div>
              </div>
            </MapStateLayer>
            <MapStatsOverlay stats={stats} visibleMarkers={0} lastUpdated={lastUpdated} />
            <MapLegend activeRoles={new Set(availableRoles)} />
          </>
        ) : (
          <>
            <MapContainer
              center={center}
              zoom={markerNodes.length === 1 ? 11 : zoom}
              scrollWheelZoom
              className="cm-map__leaflet"
              style={{ background: 'var(--night-sky-950)' }}
            >
              <TileLayer attribution={tileAttribution} url={tileUrl} />
              <FitBounds bounds={bounds} />

              {markerNodes.map((node) => (
                <Marker
                  key={node.publicKey || node.id}
                  position={[node.coordinates.latitude, node.coordinates.longitude]}
                  icon={iconCache.get(node)}
                >
                  <Popup className="cm-popup-wrapper">
                    <NodePopup node={node} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <MapStatsOverlay
              stats={stats}
              visibleMarkers={markerNodes.length}
              lastUpdated={lastUpdated}
            />
            <MapLegend activeRoles={activeRoles} />
          </>
        )}
      </div>
    </div>
  );
}

export default NetworkMap;
