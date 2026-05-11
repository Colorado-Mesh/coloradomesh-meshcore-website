'use client';

import { useId, useMemo, useState } from 'react';
import type { MapAdvancedFeature, MapNode } from '@/lib/types';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface PeerHistoryPanelProps {
  features: MapAdvancedFeature[];
  selectedNode: MapNode | null;
  nodes?: MapNode[];
  onClear?: () => void;
  onSelectNode?: (node: MapNode) => void;
}

interface PeersPayload {
  peers?: Array<{
    public_key?: string;
    publicKey?: string;
    name?: string;
    last_heard?: string | null;
    lastHeard?: string | null;
    snr?: number | null;
    rssi?: number | null;
  }>;
}

const MAX_DISPLAY = 8;

function readPeerArray(payload: PeersPayload | null): NonNullable<PeersPayload['peers']> {
  if (!payload) return [];
  return Array.isArray(payload.peers) ? payload.peers : [];
}

function deviceIdFor(node: MapNode | null | undefined): string | null {
  if (!node) return null;
  return node.publicKey || node.id || null;
}

function nodeKey(node: MapNode): string {
  return node.publicKey || node.id;
}

function nodeOptionLabel(node: MapNode): string {
  const name = node.name?.trim();
  const fallback = (node.publicKey || node.id || '').slice(0, 8);
  if (!name) return fallback || 'Unnamed node';
  return name.length > 28 ? `${name.slice(0, 27)}…` : name;
}

export default function PeerHistoryPanel({
  features,
  selectedNode,
  nodes = [],
  onClear,
  onSelectNode,
}: PeerHistoryPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;
  const pickerId = useId();

  const sortedNodes = useMemo(() => {
    const cloned = [...nodes];
    cloned.sort((a, b) => {
      const onlineDiff = Number(b.isOnline) - Number(a.isOnline);
      if (onlineDiff !== 0) return onlineDiff;
      const nameA = (a.name || a.publicKey || a.id || '').toLowerCase();
      const nameB = (b.name || b.publicKey || b.id || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return cloned;
  }, [nodes]);

  // Track only the operator-typed override; null means "use first available". The
  // displayed selection is derived during render so the picker self-heals when the
  // visible node list changes (no setState-in-effect needed).
  const [userPick, setUserPick] = useState<string | null>(null);
  const fallbackKey = sortedNodes[0] ? nodeKey(sortedNodes[0]) : '';
  const validUserPick =
    userPick && sortedNodes.some((n) => nodeKey(n) === userPick) ? userPick : null;
  const picked = validUserPick ?? fallbackKey;
  const pickedNode = useMemo(
    () => sortedNodes.find((n) => nodeKey(n) === picked) ?? null,
    [sortedNodes, picked]
  );

  const activeNode = selectedNode ?? pickedNode;
  const deviceId = deviceIdFor(activeNode);

  // Track the deviceId the operator armed against; armed is derived so it auto-resets
  // when the active node changes — no effect required.
  const [armedFor, setArmedFor] = useState<string | null>(null);
  const armed = armedFor !== null && armedFor === deviceId;

  const url =
    armed && advancedAvailable && deviceId
      ? `/api/live-map/peers/${encodeURIComponent(deviceId)}?limit=20`
      : null;

  const { data, loading, error, lastUpdated, refetch } = useLiveMapResource<PeersPayload>(url, {
    enabled: Boolean(url),
  });

  if (!advancedAvailable) {
    return (
      <section className="cm-panel" aria-label="Peer history">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Peer history</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Unavailable</span>
        </header>
        <p className="cm-panel__hint">
          {advancedMessage ?? 'Peer history requires the upstream live-map service to be configured.'}
        </p>
      </section>
    );
  }

  if (!activeNode) {
    return (
      <section className="cm-panel" aria-label="Peer history">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Peer history</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">No nodes</span>
        </header>
        <p className="cm-panel__hint">
          No located nodes are visible yet. Once a node appears on the map, pick one from this panel
          (or use the focus action in any node popup) to load rolling peer history through the local
          <code> /api/live-map/peers/&hellip;</code> proxy.
        </p>
      </section>
    );
  }

  const peers = readPeerArray(data);
  const focusedFromMap = Boolean(selectedNode);

  return (
    <section className="cm-panel" aria-label="Peer history">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Peer history</h2>
        <div className="cm-panel__head-actions">
          {focusedFromMap && (
            <span className="cm-panel__tag cm-panel__tag--mesh" aria-hidden>
              Focused
            </span>
          )}
          {armed && (
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
          )}
          {onClear && focusedFromMap && (
            <button type="button" className="cm-panel__refresh" onClick={onClear}>
              Clear focus
            </button>
          )}
        </div>
      </header>

      {focusedFromMap ? (
        <p className="cm-panel__sub">
          Focused node: <strong>{selectedNode?.name || nodeOptionLabel(selectedNode!)}</strong>
        </p>
      ) : (
        <label htmlFor={pickerId} className="cm-panel__field">
          <span>Node</span>
          <select
            id={pickerId}
            className="cm-panel__select"
            value={picked}
            onChange={(event) => {
              const next = event.target.value;
              setUserPick(next);
              const target = sortedNodes.find((n) => nodeKey(n) === next);
              if (target && onSelectNode) onSelectNode(target);
            }}
          >
            {sortedNodes.map((node) => (
              <option key={nodeKey(node)} value={nodeKey(node)}>
                {nodeOptionLabel(node)}
                {node.isOnline ? '' : ' · offline'}
              </option>
            ))}
          </select>
        </label>
      )}

      {!armed ? (
        <button
          type="button"
          className="cm-panel__submit"
          onClick={() => setArmedFor(deviceId)}
          disabled={!deviceId}
        >
          Load peer history
        </button>
      ) : error ? (
        <p className="cm-panel__error" role="status">
          {error}
        </p>
      ) : loading ? (
        <p className="cm-panel__hint">Fetching peer history…</p>
      ) : peers.length === 0 ? (
        <p className="cm-panel__hint">No peer history available for this device yet.</p>
      ) : (
        <>
          <ul className="cm-panel__peers">
            {peers.slice(0, MAX_DISPLAY).map((peer, index) => {
              const key = peer.public_key ?? peer.publicKey ?? `${peer.name ?? 'peer'}-${index}`;
              const lastHeard = peer.last_heard ?? peer.lastHeard ?? null;
              return (
                <li key={key} className="cm-panel__peer">
                  <span className="cm-panel__peer-name">{peer.name || (peer.public_key ?? peer.publicKey ?? 'Unnamed peer')}</span>
                  <span className="cm-panel__peer-meta">
                    {lastHeard && <span>{formatRelativeTime(lastHeard)}</span>}
                    {typeof peer.snr === 'number' && <span>SNR {peer.snr.toFixed(1)} dB</span>}
                    {typeof peer.rssi === 'number' && <span>RSSI {Math.round(peer.rssi)} dBm</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          {peers.length > MAX_DISPLAY && (
            <p className="cm-panel__sub">+{peers.length - MAX_DISPLAY} more in peer payload</p>
          )}
          {lastUpdated && (
            <p className="cm-panel__sub">Updated {formatRelativeTime(lastUpdated.toISOString())}</p>
          )}
        </>
      )}

      {!focusedFromMap && (
        <p className="cm-panel__sub">
          Tip: open any node&rsquo;s popup on the map and tap <em>Focus on operator panel</em> to lock
          this panel to that node.
        </p>
      )}
    </section>
  );
}
