/* denvermc-leaflet-zoom.js — finer Leaflet zoom defaults for /map.
 *
 * Why:
 *   CoreScope creates every Leaflet map (live, analyzer map, node detail,
 *   home mini-map, analytics subpath map) without setting `zoomSnap` or
 *   `zoomDelta`. Leaflet's defaults are 1 / 1, which makes the +/- buttons
 *   and the mousewheel jump a full zoom level per step — coarse for a
 *   metro/state-scale mesh map where operators routinely want to land
 *   between two integer zooms.
 *
 * How:
 *   We patch `L.Map`'s class defaults via `L.Map.mergeOptions` BEFORE any
 *   CoreScope script calls `L.map(...)`. Leaflet is loaded synchronously
 *   from CDN in <head>, and this overlay script is injected into <head>
 *   with `defer`, so by the time we run, `window.L` exists but no map
 *   has been constructed yet (CoreScope maps are constructed from body
 *   scripts on hashchange / DOMContentLoaded).
 *
 * Values:
 *   zoomSnap  : 0.25   wheel/fitBounds snap to quarter zoom levels
 *   zoomDelta : 0.5    +/- buttons and keyboard +/- step by half a level
 *
 *   We intentionally leave `wheelPxPerZoomLevel` and `wheelDebounceTime`
 *   at Leaflet defaults so wheel cadence still feels native; the smaller
 *   snap is what delivers the "finer" feel.
 *
 * Safety:
 *   - Never edits any file under vendor/CoreScope.
 *   - mergeOptions only affects instances that don't pass these options
 *     explicitly. Every CoreScope L.map(...) call audited here does not,
 *     so all of them inherit the finer defaults.
 *   - All current CoreScope maps initialize with integer zooms, which
 *     are valid multiples of 0.25 — no off-grid initial state.
 *   - Leaflet 1.9.4 (the version CoreScope pins) supports fractional
 *     zoom natively; MarkerCluster + Leaflet.heat both handle it.
 *
 * Idempotent across SPA mounts via a single window flag.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;
  if (window.__denvermcLeafletZoomPatched) return;

  var OPTIONS = {
    zoomSnap: 0.25,
    zoomDelta: 0.5,
  };

  function applyPatch(L) {
    if (!L || !L.Map || typeof L.Map.mergeOptions !== 'function') return false;
    if (window.__denvermcLeafletZoomPatched) return true;
    L.Map.mergeOptions(OPTIONS);
    window.__denvermcLeafletZoomPatched = true;
    return true;
  }

  // Fast path: Leaflet is loaded synchronously in <head> ahead of this
  // defer script, so `L` should already be defined when we run.
  if (applyPatch(window.L)) return;

  // Defensive fallback if Leaflet loads later or via async injection —
  // poll for a short, bounded window so we never leave a permanent timer.
  var tries = 0;
  var MAX_TRIES = 40; // ~2s @ 50ms — plenty for any reasonable load order
  var timer = setInterval(function () {
    tries += 1;
    if (applyPatch(window.L) || tries >= MAX_TRIES) {
      clearInterval(timer);
    }
  }, 50);
})();
