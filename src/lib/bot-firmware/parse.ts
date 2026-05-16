import { BOT_BOARDS, getBoardByEnv } from './boards';
import type {
  BotAssetFormat,
  BotPlatform,
  BotReleaseAssetClassification,
  BotVariant,
} from './types';

const ENV_NAMES_LONGEST_FIRST = [...BOT_BOARDS.map((b) => b.env)].sort(
  (a, b) => b.length - a.length,
);

function detectFormat(name: string): { format: BotAssetFormat; stripped: string } {
  if (name.endsWith('-merged.bin')) return { format: 'merged-bin', stripped: name.slice(0, -'-merged.bin'.length) };
  if (name.endsWith('.bin'))        return { format: 'bin',        stripped: name.slice(0, -'.bin'.length) };
  if (name.endsWith('.uf2'))        return { format: 'uf2',        stripped: name.slice(0, -'.uf2'.length) };
  if (name.endsWith('.zip'))        return { format: 'zip',        stripped: name.slice(0, -'.zip'.length) };
  return { format: 'unknown', stripped: name };
}

/**
 * Classify a GitHub release asset name into platform/board/variant/version.
 *
 * Asset naming convention from meshcore-bot-firmware release.yml:
 *   <env-name>-<version>[-merged].<ext>
 * where <env-name> is one of the known companion_radio_(usb|ble) PlatformIO
 * environments and <version> is the release tag (e.g. cmesh-bot-v1.0.0).
 *
 * Returns env=null and platform='UNKNOWN' when no env prefix matches — that's
 * the right place for the UI to surface "unrecognized asset, link to source".
 */
export function classifyAsset(name: string): BotReleaseAssetClassification {
  const { format, stripped } = detectFormat(name);

  let env: string | null = null;
  for (const candidate of ENV_NAMES_LONGEST_FIRST) {
    if (stripped === candidate || stripped.startsWith(`${candidate}-`)) {
      env = candidate;
      break;
    }
  }

  if (!env) {
    return { env: null, platform: 'UNKNOWN', variant: null, format, version: null };
  }

  const board = getBoardByEnv(env);
  const version = stripped === env ? null : stripped.slice(env.length + 1) || null;

  return {
    env,
    platform: board?.platform ?? 'UNKNOWN',
    variant: board?.variant ?? null,
    format,
    version,
  };
}

const PLATFORM_LABEL: Record<BotPlatform, string> = {
  ESP32: 'ESP32',
  NRF52: 'nRF52',
  RP2040: 'RP2040',
  STM32: 'STM32',
};

export function platformLabel(platform: BotPlatform | 'UNKNOWN'): string {
  return platform === 'UNKNOWN' ? 'Unknown' : PLATFORM_LABEL[platform];
}

export function variantLabel(variant: BotVariant | null): string {
  if (variant === 'usb') return 'USB';
  if (variant === 'ble') return 'BLE';
  return '—';
}

/**
 * Strip "_companion_radio_(usb|ble)" suffix to produce a friendlier board label.
 * Heuristic only — env names are already operator-readable, this just shortens.
 */
export function boardDisplayName(env: string): string {
  return env.replace(/_companion_radio_(usb|ble)$/, '').replace(/_/g, ' ');
}

const FORMAT_LABEL: Record<BotAssetFormat, string> = {
  'merged-bin': 'merged.bin',
  bin: '.bin',
  uf2: '.uf2',
  zip: '.zip',
  unknown: 'file',
};

export function formatLabel(format: BotAssetFormat): string {
  return FORMAT_LABEL[format];
}

/**
 * Per-platform install hint shown in the UI. Tells the user which file to
 * grab and points them at flasher.meshcore.io for the actual flashing UX.
 */
export function platformInstallHint(platform: BotPlatform | 'UNKNOWN'): string {
  switch (platform) {
    case 'ESP32':
      return 'Flash the *-merged.bin from the latest release at flasher.meshcore.io (pick "Custom firmware").';
    case 'NRF52':
      return 'Use the .uf2 by entering the bootloader (double-tap reset) and dragging onto the USB drive — or DFU-flash the .zip with adafruit-nrfutil.';
    case 'RP2040':
      return 'Hold BOOTSEL while plugging in, then drag the .uf2 onto the mounted RPI-RP2 drive.';
    case 'STM32':
      return 'Flash with the manufacturer DFU tool — STM32 builds are advanced; see the firmware README for board-specific steps.';
    default:
      return 'Open the GitHub release for install notes specific to this asset.';
  }
}
