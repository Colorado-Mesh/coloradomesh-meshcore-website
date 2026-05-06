import type { MapNode } from '@/lib/types';

const RELATIVE_THRESHOLDS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

const relativeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

export function formatRelativeTime(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return 'Unknown';
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return 'Unknown';

  const diffMs = timestamp - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 30 * 1000) return 'Just now';

  for (const { unit, ms } of RELATIVE_THRESHOLDS) {
    if (absMs >= ms) {
      const value = Math.round(diffMs / ms);
      return relativeFormatter
        ? relativeFormatter.format(value, unit)
        : `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? '' : 's'} ${value < 0 ? 'ago' : 'from now'}`;
    }
  }

  const seconds = Math.round(diffMs / 1000);
  return relativeFormatter
    ? relativeFormatter.format(seconds, 'second')
    : `${Math.abs(seconds)}s ${seconds < 0 ? 'ago' : 'from now'}`;
}

export function formatAbsoluteTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPublicKey(node: MapNode): string {
  const key = node.publicKey || node.id;
  if (!key) return '—';
  if (key.length <= 12) return key;
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

export function formatCoordinates(node: MapNode): string | null {
  if (!node.coordinates) return null;
  const { latitude, longitude } = node.coordinates;
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function formatBattery(node: MapNode): string | null {
  const battery = node.battery;
  if (!battery) return null;
  const parts: string[] = [];
  if (typeof battery.percentage === 'number') parts.push(`${Math.round(battery.percentage)}%`);
  if (typeof battery.millivolts === 'number') parts.push(`${(battery.millivolts / 1000).toFixed(2)} V`);
  return parts.length ? parts.join(' · ') : null;
}

export function formatRadio(node: MapNode): string | null {
  const radio = node.radio;
  if (!radio) return null;
  const parts: string[] = [];
  if (typeof radio.frequency === 'number') parts.push(`${radio.frequency} MHz`);
  if (typeof radio.bandwidth === 'number') parts.push(`BW ${radio.bandwidth}`);
  if (typeof radio.spreadingFactor === 'number') parts.push(`SF${radio.spreadingFactor}`);
  if (typeof radio.power === 'number') parts.push(`${radio.power} dBm`);
  return parts.length ? parts.join(' · ') : null;
}

export function formatSignal(node: MapNode): string | null {
  const radio = node.radio;
  if (!radio) return null;
  const parts: string[] = [];
  if (typeof radio.snr === 'number') parts.push(`SNR ${radio.snr.toFixed(1)} dB`);
  if (typeof radio.rssi === 'number') parts.push(`RSSI ${Math.round(radio.rssi)} dBm`);
  if (typeof radio.noiseFloor === 'number') parts.push(`Noise ${Math.round(radio.noiseFloor)} dBm`);
  return parts.length ? parts.join(' · ') : null;
}

export function formatUptime(seconds: number | null | undefined): string | null {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
