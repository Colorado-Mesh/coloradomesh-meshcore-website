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
    color: '#9eb2cb', // ops-text-dim
    glow: 'rgba(158, 178, 203, 0.45)',
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

export type MarkerSize = 'sm' | 'md' | 'lg';

export interface MarkerSizing {
  container: number;
  dot: number;
  pulseInset: number;
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

export const MARKER_SIZING: Record<MarkerSize, MarkerSizing> = {
  sm: { container: 22, dot: 12, pulseInset: 0, iconAnchor: [11, 11], popupAnchor: [0, -11] },
  md: { container: 28, dot: 16, pulseInset: 0, iconAnchor: [14, 14], popupAnchor: [0, -14] },
  lg: { container: 36, dot: 22, pulseInset: 0, iconAnchor: [18, 18], popupAnchor: [0, -18] },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface MarkerHtmlOptions {
  size?: MarkerSize;
  label?: string | null;
}

export function buildMarkerHtml(
  role: MapNodeRole,
  status: MapNodeStatus,
  options: MarkerHtmlOptions = {}
): string {
  const palette = ROLE_PALETTE[role] ?? ROLE_PALETTE.unknown;
  const tone = STATUS_TONE[status] ?? STATUS_TONE.unknown;
  const size = options.size ?? 'md';
  const sizing = MARKER_SIZING[size] ?? MARKER_SIZING.md;
  const pulseRing = tone.pulse
    ? `<span class="cm-marker__pulse" style="background:${palette.glow};"></span>`
    : '';
  const glowShadow = tone.pulse
    ? `0 0 0 4px ${palette.glow}, 0 6px 14px rgba(0,0,0,0.55)`
    : `0 6px 14px rgba(0,0,0,0.55)`;

  const labelHtml =
    options.label && options.label.trim().length > 0
      ? `<span class="cm-marker__label">${escapeHtml(options.label.trim())}</span>`
      : '';

  return `
    <span class="cm-marker cm-marker--${size}" style="opacity:${tone.opacity}; width:${sizing.container}px; height:${sizing.container}px;">
      ${pulseRing}
      <span class="cm-marker__dot" style="background:${palette.color}; border-color:${tone.ring}; box-shadow:${glowShadow}; width:${sizing.dot}px; height:${sizing.dot}px;"></span>
      ${labelHtml}
    </span>
  `;
}
