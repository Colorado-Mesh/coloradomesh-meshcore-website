import type { MapNode } from '@/lib/types';
import { ROLE_PALETTE, STATUS_LABEL } from './markers';
import {
  formatAbsoluteTime,
  formatBattery,
  formatCoordinates,
  formatPublicKey,
  formatRadio,
  formatRelativeTime,
  formatSignal,
  formatUptime,
} from './format';

interface NodePopupProps {
  node: MapNode;
}

interface RowProps {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}

function Row({ label, children, mono = false }: RowProps) {
  return (
    <div className="cm-popup__row">
      <span className="cm-popup__label">{label}</span>
      <span className={`cm-popup__value${mono ? ' cm-popup__value--mono' : ''}`}>{children}</span>
    </div>
  );
}

export default function NodePopup({ node }: NodePopupProps) {
  const palette = ROLE_PALETTE[node.role] ?? ROLE_PALETTE.unknown;
  const lastHeardRelative = formatRelativeTime(node.lastHeardAt);
  const lastHeardAbsolute = formatAbsoluteTime(node.lastHeardAt);
  const coordinates = formatCoordinates(node);
  const battery = formatBattery(node);
  const radio = formatRadio(node);
  const signal = formatSignal(node);
  const uptime = formatUptime(node.uptimeSeconds);
  const route = node.route?.filter(Boolean) ?? [];
  const neighbors = node.neighbors?.filter(Boolean) ?? [];

  return (
    <div className="cm-popup">
      <div className="cm-popup__header">
        <span
          className="cm-popup__role-dot"
          style={{ background: palette.color, boxShadow: `0 0 0 3px ${palette.glow}` }}
          aria-hidden
        />
        <div className="cm-popup__title">
          <div className="cm-popup__name">{node.name || 'Unnamed node'}</div>
          <div className="cm-popup__meta">
            <span style={{ color: palette.color }}>{palette.label}</span>
            <span aria-hidden>·</span>
            <span>{STATUS_LABEL[node.status] ?? 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="cm-popup__rows">
        <Row label="Public key" mono>
          {formatPublicKey(node)}
        </Row>

        <Row label="Last heard">
          <span>{lastHeardRelative}</span>
          {lastHeardAbsolute && (
            <span className="cm-popup__sub">{lastHeardAbsolute}</span>
          )}
        </Row>

        {(node.firmwareVersion || node.model) && (
          <Row label="Firmware">
            {[node.firmwareVersion, node.model].filter(Boolean).join(' · ')}
          </Row>
        )}

        {coordinates && (
          <Row label="Coordinates" mono>
            {coordinates}
          </Row>
        )}

        {battery && <Row label="Battery">{battery}</Row>}
        {radio && <Row label="Radio">{radio}</Row>}
        {signal && <Row label="Signal">{signal}</Row>}
        {uptime && <Row label="Uptime">{uptime}</Row>}

        {neighbors.length > 0 && (
          <Row label="Neighbors" mono>
            {neighbors.slice(0, 6).join(', ')}
            {neighbors.length > 6 && ` +${neighbors.length - 6}`}
          </Row>
        )}

        {route.length > 0 && (
          <Row label="Route" mono>
            {route.join(' › ')}
          </Row>
        )}
      </div>
    </div>
  );
}
