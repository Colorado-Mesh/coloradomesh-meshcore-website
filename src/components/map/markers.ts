import type { MapNodeRole, MapNodeStatus } from '@/lib/types';

export interface RolePalette {
  label: string;
  color: string;
  glow: string;
}

export const ROLE_PALETTE: Record<MapNodeRole, RolePalette> = {
  gateway: {
    label: 'Gateway',
    color: '#f48c06', // sunset-500
    glow: 'rgba(244, 140, 6, 0.55)',
  },
  repeater: {
    label: 'Repeater',
    color: '#5fb37a', // forest-300
    glow: 'rgba(95, 179, 122, 0.55)',
  },
  router: {
    label: 'Router',
    color: '#3d7ab0', // mountain-500
    glow: 'rgba(61, 122, 176, 0.55)',
  },
  room_server: {
    label: 'Room Server',
    color: '#00d4aa', // mesh
    glow: 'rgba(0, 212, 170, 0.6)',
  },
  companion: {
    label: 'Companion',
    color: '#5fa3d6', // sky signal
    glow: 'rgba(95, 163, 214, 0.55)',
  },
  node: {
    label: 'Node',
    color: '#a6b6cc', // ops-text-mid
    glow: 'rgba(166, 182, 204, 0.45)',
  },
  unknown: {
    label: 'Unknown',
    color: '#6b7d97', // ops-text-dim
    glow: 'rgba(107, 125, 151, 0.4)',
  },
};

export const STATUS_LABEL: Record<MapNodeStatus, string> = {
  online: 'Online',
  stale: 'Stale',
  offline: 'Offline',
  unknown: 'Unknown',
};

export const STATUS_TONE: Record<MapNodeStatus, { ring: string; opacity: number; pulse: boolean }> = {
  online: { ring: '#ffffff', opacity: 1, pulse: true },
  stale: { ring: '#f59e0b', opacity: 0.85, pulse: false },
  offline: { ring: '#475569', opacity: 0.55, pulse: false },
  unknown: { ring: '#94a3b8', opacity: 0.7, pulse: false },
};

export function buildMarkerHtml(role: MapNodeRole, status: MapNodeStatus): string {
  const palette = ROLE_PALETTE[role] ?? ROLE_PALETTE.unknown;
  const tone = STATUS_TONE[status] ?? STATUS_TONE.unknown;
  const pulseRing = tone.pulse
    ? `<span class="cm-marker__pulse" style="background:${palette.glow};"></span>`
    : '';
  const glowShadow = tone.pulse
    ? `0 0 0 4px ${palette.glow}, 0 6px 14px rgba(0,0,0,0.55)`
    : `0 6px 14px rgba(0,0,0,0.55)`;

  return `
    <span class="cm-marker" style="opacity:${tone.opacity};">
      ${pulseRing}
      <span class="cm-marker__dot" style="background:${palette.color}; border-color:${tone.ring}; box-shadow:${glowShadow};"></span>
    </span>
  `;
}
