'use client';

import { useState } from 'react';
import type { MapAdvancedFeature, MapNode } from '@/lib/types';
import { useLiveMapResource } from '@/hooks/useLiveMapResource';
import { formatRelativeTime } from './format';

interface PeerHistoryPanelProps {
  features: MapAdvancedFeature[];
  selectedNode: MapNode | null;
  onClear?: () => void;
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

export default function PeerHistoryPanel({ features, selectedNode, onClear }: PeerHistoryPanelProps) {
  const advancedAvailable = features.some(
    (feature) => feature.id === 'advanced-live-map-proxy' && feature.status === 'available'
  );
  const advancedMessage = features.find((feature) => feature.id === 'advanced-live-map-proxy')?.message;
  const [armed, setArmed] = useState(false);

  const deviceId = selectedNode?.publicKey || selectedNode?.id || null;
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

  if (!selectedNode) {
    return (
      <section className="cm-panel" aria-label="Peer history">
        <header className="cm-panel__head">
          <h2 className="cm-panel__title">Peer history</h2>
          <span className="cm-panel__tag cm-panel__tag--dim">Idle</span>
        </header>
        <p className="cm-panel__hint">
          Use the focus action in any node popup to load rolling peer history through the local
          <code> /api/live-map/peers/&hellip;</code> proxy.
        </p>
      </section>
    );
  }

  const peers = readPeerArray(data);

  return (
    <section className="cm-panel" aria-label="Peer history">
      <header className="cm-panel__head">
        <h2 className="cm-panel__title">Peer history</h2>
        <div className="cm-panel__head-actions">
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
          {onClear && (
            <button type="button" className="cm-panel__refresh" onClick={onClear}>
              Clear focus
            </button>
          )}
        </div>
      </header>
      <p className="cm-panel__sub">
        Focused node: <strong>{selectedNode.name || 'Unnamed node'}</strong>
      </p>

      {!armed ? (
        <button type="button" className="cm-panel__submit" onClick={() => setArmed(true)}>
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
            <p className="cm-panel__sub">+{peers.length - MAX_DISPLAY} more in upstream payload</p>
          )}
          {lastUpdated && (
            <p className="cm-panel__sub">Updated {formatRelativeTime(lastUpdated.toISOString())}</p>
          )}
        </>
      )}
    </section>
  );
}
