# Step 1 Execution Plan: Add overlay sound asset plumbing, branding corrections, and non-visual shell integration seams

## Goal
Make the build/runtime able to serve new sound overlay assets and correct the map logo/favicon foundations before adding sound behavior.

## Current Code Observations
- `scripts/apply-corescope-overlay.mjs` currently copies a flat list of overlay assets and injects `denvermc-leaflet-zoom.js`, `denvermc-default-route.js`, `denvermc-shell.css`, and `denvermc-shell.js`.
- `docker/nginx.conf` proxies `/map` and a narrow allowlist of CoreScope root `.js/.css` assets, currently including `denvermc-default-route`, `denvermc-leaflet-zoom`, and `denvermc-shell`, but not a sound overlay or `/sound/` assets.
- `corescope-overlay/denvermc-shell.js` currently sets `BRAND_LOGO_SRC = '/logo.png'`, while the main-site header `BrandMark` uses `SITE_LOGO_PATH`, currently `/brand/linux/256x256.png`.
- `src/components/Navigation.tsx` uses `BrandMark size="md" href="/" ariaLabel={`${SITE_NAME} — Home`}`; the map brand link should match the same `/` target and main-site asset.
- `src/app/layout.tsx` already points metadata icons to `/brand/win/colorado-mesh.ico`, `/brand/linux/16x16.png`, `/brand/linux/32x32.png`, and `/brand/linux/256x256.png`; public root favicon files may still need checking/replacement if stale.
- `vendor/CoreScope/public/live.js:2366` calls `MeshAudio.sonifyPacket(consolidated)`, confirming the later sound bridge can wrap the CoreScope public seam without editing vendor files.

## Files to Change
- `scripts/apply-corescope-overlay.mjs` — add sound overlay asset injection/copying and optional recursive sample asset copy support.
- `docker/nginx.conf` — proxy the new sound overlay asset(s) and `/sound/` static sample/provenance files to CoreScope.
- `corescope-overlay/denvermc-shell.js` — switch the map shell logo source to the main-site header asset and align the accessible label/title.
- `corescope-overlay/denvermc-sound.js` — create a no-playback bootstrap/test seam for later steps.
- `src/app/layout.tsx` and public favicon files — only change if current favicon routing/assets are demonstrably not using the correct brand logo.

## Ordered Implementation Checklist
1. Verify whether public root favicon files differ from the correct brand favicon/icon assets using file metadata/hashes; only replace or reroute if they are stale.
2. Create `corescope-overlay/denvermc-sound.js` with a safe no-audio bootstrap that exposes `window.__coloradoMeshSound` and a backwards-compatible internal alias if needed.
3. Update `scripts/apply-corescope-overlay.mjs` to inject/copy `denvermc-sound.js` after `denvermc-shell.js` and support recursive copy of `corescope-overlay/sound/` to public `/sound/` when present.
4. Update `docker/nginx.conf` to proxy `denvermc-sound.js` and `/sound/` assets to CoreScope without broadening unrelated routes.
5. Update `corescope-overlay/denvermc-shell.js` so `BRAND_LOGO_SRC` uses `/brand/linux/256x256.png` and the brand `aria-label`/title matches the main-site home behavior.
6. Run overlay application and validation commands.
7. Stage only Step 1 files and run the Forge Claude step review.

## Interfaces and Data Contracts
- New static overlay script: `/denvermc-sound.js?v=denvermc`.
- New optional static sample/provenance prefix: `/sound/...` served from CoreScope public output.
- `window.__coloradoMeshSound` bootstrap shape: `{ version, status, getState() }` initially no-op/no-audio.
- Logo asset path: `/brand/linux/256x256.png`.

## Verification Plan
- Automated: `npm run corescope:apply-overlay`; `npm run lint`; `npm run typecheck`; `git diff --check`.
- Manual: inspect generated CoreScope public `index.html` for `denvermc-sound.js` injection and verify bootstrap/global in browser if a dev/server check is available.
- Regression: existing `/map` overlay assets still inject once, map shell still loads, and favicon metadata still resolves to Colorado Mesh brand assets.

## Stop Conditions
- If favicon files need image conversion but no reliable local tool exists, stop and ask rather than committing a guessed binary asset.
- If adding `/sound/` proxy would conflict with existing Next routes, stop and narrow the route instead of broadening the proxy.
- If any change requires visual layout/CSS decisions, delegate that portion to Opus UI rather than editing visual styling directly in this Codex-backed session.
