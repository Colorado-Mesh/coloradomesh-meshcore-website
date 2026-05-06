import type { MapNodeRole } from '@/lib/types';
import { ROLE_PALETTE } from './markers';

interface MapLegendProps {
  activeRoles: Set<MapNodeRole>;
}

const LEGEND_ORDER: MapNodeRole[] = [
  'gateway',
  'repeater',
  'router',
  'room_server',
  'companion',
  'node',
  'unknown',
];

export default function MapLegend({ activeRoles }: MapLegendProps) {
  const items = LEGEND_ORDER.filter((role) => activeRoles.has(role));
  const list = items.length > 0 ? items : (['gateway', 'repeater', 'companion', 'node'] as MapNodeRole[]);

  return (
    <div className="cm-overlay cm-overlay--legend" aria-label="Map legend">
      <div className="cm-overlay__title">Roles</div>
      <ul className="cm-legend">
        {list.map((role) => {
          const palette = ROLE_PALETTE[role];
          return (
            <li key={role} className="cm-legend__item">
              <span
                className="cm-legend__swatch"
                style={{ background: palette.color, boxShadow: `0 0 0 2px ${palette.glow}` }}
                aria-hidden
              />
              <span className="cm-legend__label">{palette.label}</span>
            </li>
          );
        })}
      </ul>
      <div className="cm-legend__divider" aria-hidden />
      <ul className="cm-legend cm-legend--status">
        <li className="cm-legend__item">
          <span className="cm-legend__status cm-legend__status--online" aria-hidden />
          <span className="cm-legend__label">Online</span>
        </li>
        <li className="cm-legend__item">
          <span className="cm-legend__status cm-legend__status--stale" aria-hidden />
          <span className="cm-legend__label">Stale</span>
        </li>
        <li className="cm-legend__item">
          <span className="cm-legend__status cm-legend__status--offline" aria-hidden />
          <span className="cm-legend__label">Offline</span>
        </li>
      </ul>
    </div>
  );
}
