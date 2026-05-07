'use client';

import { useId } from 'react';
import type { MapDisplayPreferences } from './preferences';

interface MapPreferencesPanelProps {
  preferences: MapDisplayPreferences;
  onUpdate: (partial: Partial<MapDisplayPreferences>) => void;
  onReset: () => void;
  hydrated: boolean;
}

const SIZE_OPTIONS: Array<{ value: MapDisplayPreferences['markerSize']; label: string }> = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export default function MapPreferencesPanel({
  preferences,
  onUpdate,
  onReset,
  hydrated,
}: MapPreferencesPanelProps) {
  const labelsId = useId();
  const legendId = useId();
  const statsId = useId();
  const advancedId = useId();

  return (
    <div
      className="cm-prefs"
      role="region"
      aria-label="Map display preferences"
      data-testid="map-preferences"
    >
      <div className="cm-prefs__head">
        <span className="cm-prefs__title">Display</span>
        <span className="cm-prefs__sub" aria-hidden>
          Stored locally
        </span>
      </div>
      <div className="cm-prefs__row">
        <label htmlFor={labelsId} className="cm-prefs__toggle">
          <input
            id={labelsId}
            type="checkbox"
            checked={preferences.showLabels}
            onChange={(event) => onUpdate({ showLabels: event.target.checked })}
            disabled={!hydrated}
          />
          <span>Marker labels</span>
        </label>
        <label htmlFor={legendId} className="cm-prefs__toggle">
          <input
            id={legendId}
            type="checkbox"
            checked={preferences.showLegend}
            onChange={(event) => onUpdate({ showLegend: event.target.checked })}
            disabled={!hydrated}
          />
          <span>Legend</span>
        </label>
        <label htmlFor={statsId} className="cm-prefs__toggle">
          <input
            id={statsId}
            type="checkbox"
            checked={preferences.showStatsOverlay}
            onChange={(event) => onUpdate({ showStatsOverlay: event.target.checked })}
            disabled={!hydrated}
          />
          <span>Stats overlay</span>
        </label>
        <label htmlFor={advancedId} className="cm-prefs__toggle">
          <input
            id={advancedId}
            type="checkbox"
            checked={preferences.showAdvancedPanels}
            onChange={(event) => onUpdate({ showAdvancedPanels: event.target.checked })}
            disabled={!hydrated}
          />
          <span>Operator panels</span>
        </label>
      </div>

      <fieldset className="cm-prefs__sizes" disabled={!hydrated}>
        <legend className="cm-prefs__sizes-label">Marker size</legend>
        <div className="cm-prefs__sizes-row" role="group" aria-label="Marker size">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate({ markerSize: option.value })}
              aria-pressed={preferences.markerSize === option.value}
              className={`cm-prefs__size${
                preferences.markerSize === option.value ? ' cm-prefs__size--active' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="button" onClick={onReset} className="cm-prefs__reset" disabled={!hydrated}>
        Reset display
      </button>
    </div>
  );
}
