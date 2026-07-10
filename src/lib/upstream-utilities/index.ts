import provenance from './generated/provenance.json';
import recommendedSettings from './generated/recommended-settings.json';
import channels from './generated/channels.json';
import airports from './generated/airports.json';
import municipalities from './generated/municipalities.json';
import unincorporatedAreas from './generated/unincorporated_areas.json';
import counties from './generated/counties.json';
import mountains from './generated/mountains.json';
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

export interface UpstreamChannel {
  name: string;
  description: string;
  order: number;
  key: string;
  url: string;
}

export interface UpstreamRegionCodes {
  three_letter: string;
  five_letter: string;
  seven_letter: string;
  fourteen_letter: string;
}

export interface UpstreamAirport {
  name: string;
  iata_code: string;
}

export interface UpstreamNamedLocation {
  name: string;
  abbreviations: UpstreamRegionCodes;
}

export interface UpstreamSerialStep {
  type: 'send' | 'wait';
  command?: string;
  delayMs?: number;
  lineEnding?: string;
  order: number;
}

export interface UpstreamSerialAction {
  id: string;
  label: string;
  description: string;
  steps: UpstreamSerialStep[];
  confirm: boolean;
  confirmMessage: string;
  lineEnding?: string;
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
export const UPSTREAM_UTILITIES_CHANNELS = channels as UpstreamChannel[];
export const UPSTREAM_UTILITIES_AIRPORTS = airports as UpstreamAirport[];
export const UPSTREAM_UTILITIES_MUNICIPALITIES = municipalities as UpstreamNamedLocation[];
export const UPSTREAM_UTILITIES_UNINCORPORATED_AREAS = unincorporatedAreas as UpstreamNamedLocation[];
export const UPSTREAM_UTILITIES_ALL_CITIES = UPSTREAM_UTILITIES_MUNICIPALITIES.concat(UPSTREAM_UTILITIES_UNINCORPORATED_AREAS);
export const UPSTREAM_UTILITIES_MOUNTAINS = mountains as UpstreamNamedLocation[];
export const UPSTREAM_UTILITIES_COUNTIES = counties as UpstreamNamedLocation[];
export const UPSTREAM_UTILITIES_SERIAL_COMMAND_PROFILE = serialCommandProfile as UpstreamSerialCommandProfile;
export const UPSTREAM_UTILITIES_SERIAL_COMMAND_SCHEMA = serialCommandSchema;
export const UPSTREAM_UTILITIES_PROVENANCE = provenance as UpstreamUtilitiesProvenance;
