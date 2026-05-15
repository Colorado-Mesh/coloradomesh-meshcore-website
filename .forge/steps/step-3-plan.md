# Step 3 Execution Plan: Mobile overlay polish and site-wide logo update

## Goal
Delegate and verify the visual/frontend implementation that makes the CoreScope map overlay polished on 320–430px portrait screens and replaces the site-wide logo with a local vendored copy of the updated Colorado Mesh icon.

## Current Code Observations
- `corescope-overlay/denvermc-shell.js` currently uses `BRAND_LOGO_SRC = '/brand/linux/256x256.png'`, builds the sound selector inline in the top bar, and appends the sound controls before Focus/Analyzer/Site actions.
- `corescope-overlay/denvermc-shell.css` currently keeps sound select/volume controls inline at phone widths; at `max-width: 420px` it hides only the volume label and narrows the select, which still squeezes the top bar.
- The overlay already owns body mode classes (`denvermc-minimal`, `denvermc-analyzer`, `denvermc-focus`) and can add mobile-only sheet state without editing `vendor/CoreScope`.
- `src/lib/constants.ts` exposes `BRAND.logoPath`/`SITE_LOGO_PATH` as `/brand/linux/256x256.png`; `BrandMark.tsx` uses that constant for the main site navigation.
- `src/app/layout.tsx` and `public/manifest.json` still point metadata, apple icon, and PWA icons at the old brand assets.
- `tests/e2e/smoke.spec.ts` already mounts the overlay, asserts the current logo path, sound controls, and has separate mobile navigation tests that can be extended for the new mobile sheet/logo behavior.

## Files to Change
- `corescope-overlay/denvermc-shell.js` — add mobile sound trigger/sheet behavior, Escape/backdrop close, route/mode synchronization, and update overlay logo path.
- `corescope-overlay/denvermc-shell.css` — replace cramped inline phone controls with polished portrait-safe top bar and bottom sheet styling.
- `public/brand/**` — vendor the updated Colorado Mesh logo locally from the provided GitHub source and generated icon sizes if needed.
- `src/lib/constants.ts` — update the site-wide logo source of truth to the new same-origin asset path.
- `src/app/layout.tsx` — update metadata/apple/open graph icon references where practical.
- `public/manifest.json` — update PWA icon paths to local new-logo assets where practical.
- `tests/e2e/smoke.spec.ts` — update logo expectations and add mobile sound sheet assertions.

## Ordered Implementation Checklist
1. Run `co-ui` from the repo root with a concise handoff for Opus UI to implement the visual/mobile/logo work; this Codex-backed session must not directly implement the frontend visual changes.
2. Ask Opus UI to vendor the new logo as same-origin local files, never as runtime GitHub image URLs, and to keep all user-facing labels as “Colorado Mesh.”
3. Ask Opus UI to move phone-width sound controls into a bottom sheet opened by a compact topbar trigger while preserving desktop inline controls and all existing `window.__coloradoMeshSound` behavior.
4. Ask Opus UI to implement accessible sheet close behavior via explicit close button, backdrop, and Escape without trapping normal map use unnecessarily.
5. Ask Opus UI to tune 320, 360, 390/393, and 430px portrait layouts, including topbar touch targets, safe-area spacing, analyzer/minimal/focus collisions, and CoreScope live controls.
6. Review Opus changes for scope, no `vendor/CoreScope` edits, no secret exposure, same-origin assets, and unchanged sound localStorage/API contracts.
7. Update or confirm Playwright coverage for the new logo path and mobile sound sheet open/close behavior.
8. Run the Step 3 targeted Playwright command, browser viewport screenshot checks, lint, and typecheck before staging.

## Interfaces and Data Contracts
- Existing sound API and storage contracts stay unchanged: `window.__coloradoMeshSound`, `setMode(mode, { userGesture })`, `setVolume(value)`, `subscribe(listener)`, `coloradoMesh.map.soundMode`, and `coloradoMesh.map.soundVolume`.
- Desktop users keep a visible sound mode select, volume slider, and status in the top bar.
- Mobile portrait users get a compact sound trigger in the top bar and a bottom sheet containing the same mode select, volume slider, and status text.
- The bottom sheet must close via explicit close control, Escape, and backdrop click; it should not appear in focus mode unless Opus keeps a deliberate minimal sound affordance.
- Logo references should resolve to local same-origin paths under `public/brand/`; no remote GitHub image URL should be used at runtime.

## Verification Plan
- Automated: `PLAYWRIGHT_PORT=4324 npx playwright test tests/e2e/smoke.spec.ts --project=chromium --workers=1 --grep "map sound|mobile|logo"`
- Automated: `npm run lint`
- Automated: `npm run typecheck`
- Manual/browser: inspect local map at 320, 360, 390, and 430px portrait; open/close sound sheet; switch sound modes/volume; toggle analyzer/minimal/focus; verify no topbar, sheet, live header, live controls, or map zoom collisions.
- Regression: rerun the full map sound targeted suite from Step 2 if mobile changes touch existing sound control selectors or behavior.

## Stop Conditions
- Pause if Opus UI cannot run or cannot edit; produce a handoff prompt for `/handoff-opus-ui` instead of implementing visual changes directly in Codex.
- Pause if the GitHub logo cannot be fetched or converted into local assets without using a runtime remote URL.
- Pause if mobile sheet implementation would require changing `window.__coloradoMeshSound` API semantics or sound localStorage keys.
- Pause if any change requires editing `vendor/CoreScope` directly.
