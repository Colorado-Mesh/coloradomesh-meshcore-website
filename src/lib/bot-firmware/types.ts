export type BotPlatform = 'ESP32' | 'NRF52' | 'RP2040' | 'STM32';

export type BotVariant = 'usb' | 'ble';

export type BotAssetFormat = 'merged-bin' | 'bin' | 'uf2' | 'zip' | 'unknown';

export interface BotBoard {
  /** PlatformIO environment name, e.g. "Heltec_v3_companion_radio_usb". */
  env: string;
  platform: BotPlatform;
  /** PlatformIO `board =` value, useful as a chip-family hint. */
  board: string;
  variant: BotVariant;
}

export interface BotReleaseAsset {
  name: string;
  size: number;
  downloadUrl: string;
  contentType: string;
}

export interface BotReleaseAssetClassification {
  env: string | null;
  platform: BotPlatform | 'UNKNOWN';
  variant: BotVariant | null;
  format: BotAssetFormat;
  version: string | null;
}

export interface BotRelease {
  tagName: string;
  name: string;
  htmlUrl: string;
  publishedAt: string | null;
  prerelease: boolean;
  draft: boolean;
  body: string;
  assets: BotReleaseAsset[];
}
