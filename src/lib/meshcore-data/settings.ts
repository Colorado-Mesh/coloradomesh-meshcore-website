export interface MeshCoreRadioSettings {
  frequency: number;
  bandwidth: number;
  spreadingFactor: number;
  codingRate: number;
  txPower: number;
}

export interface MeshCoreSettingsProvenance {
  source: string;
  sourcePath: string;
  adaptedAt: string;
}

export const MESHCORE_SETTINGS_PROVENANCE: MeshCoreSettingsProvenance = {
  source: 'Colorado-Mesh/meshcore-utilities-site',
  sourcePath: 'static/data/recommended_settings.json',
  adaptedAt: '2026-05-07',
};

export const COLORADO_MESH_RADIO_SETTINGS: MeshCoreRadioSettings = {
  frequency: 910525,
  bandwidth: 62500,
  spreadingFactor: 7,
  codingRate: 8,
  txPower: 22,
};

export function buildRadioSettingsJson(settings = COLORADO_MESH_RADIO_SETTINGS) {
  return {
    frequency: settings.frequency,
    bandwidth: settings.bandwidth,
    spreading_factor: settings.spreadingFactor,
    coding_rate: settings.codingRate,
    tx_power: settings.txPower,
  };
}

export function formatRadioFrequencyKHz(frequency: number): string {
  return `${(frequency / 1000).toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} MHz`;
}

export function formatRadioBandwidthHz(bandwidth: number): string {
  return `${(bandwidth / 1000).toLocaleString('en-US', {
    maximumFractionDigits: 1,
  })} kHz`;
}

export const COLORADO_MESH_RADIO_COMMANDS = [
  `set freq ${COLORADO_MESH_RADIO_SETTINGS.frequency}`,
  `set radio bw ${COLORADO_MESH_RADIO_SETTINGS.bandwidth} sf ${COLORADO_MESH_RADIO_SETTINGS.spreadingFactor} cr ${COLORADO_MESH_RADIO_SETTINGS.codingRate}`,
  `set tx ${COLORADO_MESH_RADIO_SETTINGS.txPower}`,
] as const;
