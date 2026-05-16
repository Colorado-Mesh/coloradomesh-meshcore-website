import { describe, expect, it } from 'vitest';

import { BOT_BOARDS } from '../boards';
import {
  boardDisplayName,
  classifyAsset,
  formatLabel,
  platformLabel,
  variantLabel,
} from '../parse';

describe('classifyAsset', () => {
  it('parses an ESP32 merged.bin release asset', () => {
    const result = classifyAsset('Heltec_v3_companion_radio_usb-cmesh-bot-v1.0.0-merged.bin');
    expect(result).toEqual({
      env: 'Heltec_v3_companion_radio_usb',
      platform: 'ESP32',
      variant: 'usb',
      format: 'merged-bin',
      version: 'cmesh-bot-v1.0.0',
    });
  });

  it('parses an ESP32 .bin app image', () => {
    const result = classifyAsset('Heltec_v3_companion_radio_ble-cmesh-bot-v1.0.0.bin');
    expect(result.platform).toBe('ESP32');
    expect(result.variant).toBe('ble');
    expect(result.format).toBe('bin');
    expect(result.version).toBe('cmesh-bot-v1.0.0');
  });

  it('parses an NRF52 .uf2 asset', () => {
    const result = classifyAsset('RAK_4631_companion_radio_usb-cmesh-bot-v1.2.3.uf2');
    expect(result.env).toBe('RAK_4631_companion_radio_usb');
    expect(result.platform).toBe('NRF52');
    expect(result.format).toBe('uf2');
    expect(result.version).toBe('cmesh-bot-v1.2.3');
  });

  it('parses an NRF52 .zip DFU bundle', () => {
    const result = classifyAsset('RAK_4631_companion_radio_ble-cmesh-bot-v1.2.3.zip');
    expect(result.format).toBe('zip');
    expect(result.platform).toBe('NRF52');
  });

  it('parses an RP2040 .uf2 asset', () => {
    const result = classifyAsset('PicoW_companion_radio_usb-cmesh-bot-v1.0.0.uf2');
    expect(result.platform).toBe('RP2040');
    expect(result.variant).toBe('usb');
  });

  it('parses an STM32 build', () => {
    const result = classifyAsset('RAK_3x72_companion_radio_usb-cmesh-bot-v1.0.0.bin');
    expect(result.platform).toBe('STM32');
  });

  it('handles local-build version strings', () => {
    const result = classifyAsset('Heltec_v3_companion_radio_usb-local-d2ad3ac8-merged.bin');
    expect(result.version).toBe('local-d2ad3ac8');
    expect(result.format).toBe('merged-bin');
  });

  it('handles rc/alpha/beta pre-release tags', () => {
    expect(classifyAsset('Heltec_v3_companion_radio_usb-cmesh-bot-v1.0.0-rc.1-merged.bin').version).toBe('cmesh-bot-v1.0.0-rc.1');
    expect(classifyAsset('Heltec_v3_companion_radio_usb-cmesh-bot-v1.0.0-beta.2.uf2').version).toBe('cmesh-bot-v1.0.0-beta.2');
  });

  it('returns UNKNOWN platform for an asset that does not match any env', () => {
    const result = classifyAsset('SHA256SUMS.txt');
    expect(result.env).toBeNull();
    expect(result.platform).toBe('UNKNOWN');
    expect(result.format).toBe('unknown');
    expect(result.version).toBeNull();
  });

  it('matches the longer env when one env name is a prefix of another', () => {
    const result = classifyAsset('Heltec_t114_without_display_companion_radio_usb-cmesh-bot-v1.0.0-merged.bin');
    expect(result.env).toBe('Heltec_t114_without_display_companion_radio_usb');
  });

  it('returns null version when stripped name has no trailing version', () => {
    const result = classifyAsset('Heltec_v3_companion_radio_usb.bin');
    expect(result.env).toBe('Heltec_v3_companion_radio_usb');
    expect(result.version).toBeNull();
  });

  it('classifies every known env correctly with a synthetic name', () => {
    for (const board of BOT_BOARDS) {
      const ext = board.platform === 'NRF52' || board.platform === 'RP2040' ? '.uf2' : '-merged.bin';
      const synthetic = `${board.env}-cmesh-bot-v0.0.1${ext}`;
      const result = classifyAsset(synthetic);
      expect(result.env, synthetic).toBe(board.env);
      expect(result.platform, synthetic).toBe(board.platform);
      expect(result.variant, synthetic).toBe(board.variant);
      expect(result.version, synthetic).toBe('cmesh-bot-v0.0.1');
    }
  });
});

describe('label helpers', () => {
  it('formats platform labels', () => {
    expect(platformLabel('ESP32')).toBe('ESP32');
    expect(platformLabel('NRF52')).toBe('nRF52');
    expect(platformLabel('UNKNOWN')).toBe('Unknown');
  });

  it('formats variant labels', () => {
    expect(variantLabel('usb')).toBe('USB');
    expect(variantLabel('ble')).toBe('BLE');
    expect(variantLabel(null)).toBe('—');
  });

  it('formats format labels', () => {
    expect(formatLabel('merged-bin')).toBe('merged.bin');
    expect(formatLabel('uf2')).toBe('.uf2');
    expect(formatLabel('unknown')).toBe('file');
  });

  it('produces a friendly board display name', () => {
    expect(boardDisplayName('Heltec_v3_companion_radio_usb')).toBe('Heltec v3');
    expect(boardDisplayName('RAK_4631_companion_radio_ble')).toBe('RAK 4631');
  });
});
