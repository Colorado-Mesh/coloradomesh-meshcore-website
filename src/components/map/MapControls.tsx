'use client';

import { useId } from 'react';
import type { MapNodeRole, MapNodeStatus } from '@/lib/types';
import { ROLE_PALETTE, STATUS_LABEL } from './markers';

interface MapControlsProps {
  query: string;
  onQueryChange: (next: string) => void;
  availableRoles: MapNodeRole[];
  selectedRoles: Set<MapNodeRole>;
  onToggleRole: (role: MapNodeRole) => void;
  availableStatuses: MapNodeStatus[];
  selectedStatuses: Set<MapNodeStatus>;
  onToggleStatus: (status: MapNodeStatus) => void;
  onClear: () => void;
  matchCount: number;
  totalCount: number;
  filtersActive: boolean;
}

const ROLE_ORDER: MapNodeRole[] = [
  'gateway',
  'repeater',
  'router',
  'room_server',
  'companion',
  'node',
  'unknown',
];

const STATUS_ORDER: MapNodeStatus[] = ['online', 'stale', 'offline', 'unknown'];

export default function MapControls({
  query,
  onQueryChange,
  availableRoles,
  selectedRoles,
  onToggleRole,
  availableStatuses,
  selectedStatuses,
  onToggleStatus,
  onClear,
  matchCount,
  totalCount,
  filtersActive,
}: MapControlsProps) {
  const searchId = useId();
  const orderedRoles = ROLE_ORDER.filter((role) => availableRoles.includes(role));
  const orderedStatuses = STATUS_ORDER.filter((status) => availableStatuses.includes(status));
  const noRoleFilter = selectedRoles.size === 0;
  const noStatusFilter = selectedStatuses.size === 0;

  return (
    <div className="cm-controls" role="region" aria-label="Map filters">
      <div className="cm-controls__row">
        <div className="cm-controls__search">
          <label htmlFor={searchId} className="cm-controls__search-label">
            <span className="cm-controls__search-icon" aria-hidden>
              ⌕
            </span>
            <span className="sr-only">Search nodes by name or public key</span>
          </label>
          <input
            id={searchId}
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Filter by name or public key…"
            className="cm-controls__input"
            aria-label="Filter by node name or public key"
          />
          {query && (
            <button
              type="button"
              className="cm-controls__clear-input"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div
          className="cm-controls__match"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          title={
            filtersActive
              ? `${matchCount} of ${totalCount} located nodes match the active filters`
              : `${totalCount} located nodes`
          }
        >
          <span className="cm-controls__match-count">{matchCount}</span>
          <span className="cm-controls__match-divider" aria-hidden>
            /
          </span>
          <span className="cm-controls__match-total">{totalCount}</span>
          <span className="cm-controls__match-label">{filtersActive ? 'matched' : 'plotted'}</span>
        </div>

        {filtersActive && (
          <button type="button" className="cm-controls__clear" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>

      {(orderedRoles.length > 0 || orderedStatuses.length > 0) && (
        <div className="cm-controls__filters">
          {orderedRoles.length > 0 && (
            <fieldset className="cm-controls__group">
              <legend className="cm-controls__group-label">Role</legend>
              <div className="cm-controls__chips" role="group" aria-label="Filter by role">
                {orderedRoles.map((role) => {
                  const palette = ROLE_PALETTE[role];
                  const active = selectedRoles.has(role) || noRoleFilter;
                  const explicit = selectedRoles.has(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onToggleRole(role)}
                      className={`cm-chip${explicit ? ' cm-chip--active' : ''}${
                        !active ? ' cm-chip--inactive' : ''
                      }`}
                      aria-pressed={explicit}
                      style={
                        explicit
                          ? {
                              borderColor: palette.color,
                              boxShadow: `0 0 0 1px ${palette.glow}`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="cm-chip__swatch"
                        style={{ background: palette.color }}
                        aria-hidden
                      />
                      <span className="cm-chip__label">{palette.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {orderedStatuses.length > 0 && (
            <fieldset className="cm-controls__group">
              <legend className="cm-controls__group-label">Status</legend>
              <div className="cm-controls__chips" role="group" aria-label="Filter by status">
                {orderedStatuses.map((status) => {
                  const explicit = selectedStatuses.has(status);
                  const active = explicit || noStatusFilter;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onToggleStatus(status)}
                      className={`cm-chip cm-chip--status cm-chip--status-${status}${
                        explicit ? ' cm-chip--active' : ''
                      }${!active ? ' cm-chip--inactive' : ''}`}
                      aria-pressed={explicit}
                    >
                      <span className="cm-chip__label">{STATUS_LABEL[status]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
