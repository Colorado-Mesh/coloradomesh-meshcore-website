'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface MapDisplayPreferences {
  showLabels: boolean;
  showLegend: boolean;
  showStatsOverlay: boolean;
  showAdvancedPanels: boolean;
  markerSize: 'sm' | 'md' | 'lg';
}

export const DEFAULT_MAP_PREFERENCES: MapDisplayPreferences = {
  showLabels: false,
  showLegend: true,
  showStatsOverlay: true,
  showAdvancedPanels: true,
  markerSize: 'md',
};

const STORAGE_KEY = 'cm-map:display-preferences:v1';
const VALID_SIZES: MapDisplayPreferences['markerSize'][] = ['sm', 'md', 'lg'];

function normalize(parsed: Partial<MapDisplayPreferences>): MapDisplayPreferences {
  return {
    showLabels:
      typeof parsed.showLabels === 'boolean' ? parsed.showLabels : DEFAULT_MAP_PREFERENCES.showLabels,
    showLegend:
      typeof parsed.showLegend === 'boolean' ? parsed.showLegend : DEFAULT_MAP_PREFERENCES.showLegend,
    showStatsOverlay:
      typeof parsed.showStatsOverlay === 'boolean'
        ? parsed.showStatsOverlay
        : DEFAULT_MAP_PREFERENCES.showStatsOverlay,
    showAdvancedPanels:
      typeof parsed.showAdvancedPanels === 'boolean'
        ? parsed.showAdvancedPanels
        : DEFAULT_MAP_PREFERENCES.showAdvancedPanels,
    markerSize:
      parsed.markerSize && VALID_SIZES.includes(parsed.markerSize)
        ? parsed.markerSize
        : DEFAULT_MAP_PREFERENCES.markerSize,
  };
}

function readFromStorage(): MapDisplayPreferences {
  if (typeof window === 'undefined') return DEFAULT_MAP_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MAP_PREFERENCES;
    return normalize(JSON.parse(raw) as Partial<MapDisplayPreferences>);
  } catch {
    return DEFAULT_MAP_PREFERENCES;
  }
}

function writeToStorage(value: MapDisplayPreferences) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('cm-map-preferences:update'));
  } catch {
    /* ignore quota / private mode failures */
  }
}

let cachedSnapshot: MapDisplayPreferences | null = null;

function getSnapshot(): MapDisplayPreferences {
  const next = readFromStorage();
  if (
    cachedSnapshot &&
    cachedSnapshot.showLabels === next.showLabels &&
    cachedSnapshot.showLegend === next.showLegend &&
    cachedSnapshot.showStatsOverlay === next.showStatsOverlay &&
    cachedSnapshot.showAdvancedPanels === next.showAdvancedPanels &&
    cachedSnapshot.markerSize === next.markerSize
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return next;
}

function getServerSnapshot(): MapDisplayPreferences {
  return DEFAULT_MAP_PREFERENCES;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('storage', onChange);
  window.addEventListener('cm-map-preferences:update', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('cm-map-preferences:update', onChange);
  };
}

export function useMapPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = typeof window !== 'undefined';

  const update = useCallback((partial: Partial<MapDisplayPreferences>) => {
    const next = { ...readFromStorage(), ...partial };
    writeToStorage(next);
  }, []);

  const reset = useCallback(() => {
    writeToStorage(DEFAULT_MAP_PREFERENCES);
  }, []);

  return { preferences, hydrated, update, reset };
}
