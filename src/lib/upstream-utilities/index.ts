import provenance from './generated/provenance.json';
import recommendedSettings from './generated/recommended-settings.json';
import regions from './generated/regions.json';
import serialCommandProfile from './generated/serial-command-profile.json';
import serialCommandSchema from './generated/serial-command-schema.json';

export interface UpstreamRecommendedSettings {
  radio_settings: {
    frequency: number;
    bandwidth: number;
    spreading_factor: number;
    coding_rate: number;
    tx_power: number;
  };
}

export interface UpstreamRegionCodes {
  three: string;
  five: string;
  seven: string;
  fourteen: string;
}

export interface UpstreamAirportRegion {
  name: string;
  city: string;
  code: string;
}

export interface UpstreamNamedRegion {
  name: string;
  codes: UpstreamRegionCodes;
}

export interface UpstreamRegions {
  airports: UpstreamAirportRegion[];
  cities: UpstreamNamedRegion[];
  counties: UpstreamNamedRegion[];
  regions: UpstreamNamedRegion[];
  alternatives: UpstreamNamedRegion[];
}

export interface UpstreamSerialStep {
  type: 'send' | 'wait';
  command?: string;
  delayMs?: number;
  order: number;
}

export interface UpstreamSerialAction {
  id: string;
  label: string;
  description: string;
  steps: UpstreamSerialStep[];
  confirm: boolean;
  confirmMessage: string;
}

export interface UpstreamSerialCommandProfile {
  name: string;
  description: string;
  serial: {
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: string;
    flowControl: string;
    defaultLineEnding: string;
  };
  actions: UpstreamSerialAction[];
}

export interface UpstreamUtilitiesProvenance {
  upstreamRepository: string;
  upstreamUrl: string;
  submodulePath: string;
  upstreamCommit: string;
  sources: Array<{
    kind: string;
    upstreamPath: string;
    generatedPath: string;
  }>;
}

export const UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS = recommendedSettings as UpstreamRecommendedSettings;
export const UPSTREAM_UTILITIES_REGIONS = regions as UpstreamRegions;
export const UPSTREAM_UTILITIES_SERIAL_COMMAND_PROFILE = serialCommandProfile as UpstreamSerialCommandProfile;
export const UPSTREAM_UTILITIES_SERIAL_COMMAND_SCHEMA = serialCommandSchema;
export const UPSTREAM_UTILITIES_PROVENANCE = provenance as UpstreamUtilitiesProvenance;
