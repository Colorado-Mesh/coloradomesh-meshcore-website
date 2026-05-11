# Step 4 Execution Plan: Route Compatibility, Provenance Surfaces, and Smoke Coverage

## Goal
Add exact compatibility redirects from the upstream Flask utility page paths to the canonical local `/tools/*` routes, surface the upstream-generated-data relationship in non-visual copy, and cover both with smoke tests.

## Current Code Observations
- `next.config.js` currently defines global security/cache headers only; no `redirects()` function exists yet.
- Local canonical tool routes are `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb` in `src/lib/site.ts` and the App Router pages.
- Upstream public GET utility blueprints are `/repeater_name_tool`, `/companion_name_tool`, `/prefix_matrix`, and `/serial_usb_tool`, each with `strict_slashes=False`.
- Upstream POST submit routes exist for repeater and companion tools, but local behavior is not API-compatible and should not be redirected in this step.
- Upstream `/contacts` exists, but contacts export was explicitly marked out of scope in the master plan and parity manifest.
- `src/app/tools/page.tsx` already includes an external analyzer card and a “Coming from somewhere else?” panel, making it the safest non-visual location for provenance copy.
- `tests/e2e/smoke.spec.ts` already has critical page, tools hub, serial, prefix, navigation, and axe coverage; it can add redirect/provenance assertions without new infrastructure.

## Files to Change
- `next.config.js` — add `async redirects()` with explicit public utility path mappings.
- `src/app/tools/page.tsx` — import generated provenance and add small upstream-source copy in the existing reference panel.
- `src/lib/parity/manifest.ts` — add a utilities route-compatibility parity item.
- `tests/e2e/smoke.spec.ts` — add smoke checks for representative redirects and visible provenance messaging.

## Ordered Implementation Checklist
1. Add a `UTILITY_COMPATIBILITY_REDIRECTS` constant in `next.config.js` for `/repeater_name_tool`, `/companion_name_tool`, `/prefix_matrix`, and `/serial_usb_tool`, plus trailing-slash variants if needed by Next redirect matching.
2. Add `async redirects()` to `next.config.js` returning those mappings with `permanent: true`, leaving existing headers unchanged.
3. Import `UPSTREAM_UTILITIES_PROVENANCE` in `src/app/tools/page.tsx`, derive a short commit string, and add concise provenance copy/linking in the existing “Coming from somewhere else?” panel.
4. Add a parity manifest item documenting upstream public route sources, local redirect config, and e2e coverage.
5. Add a Playwright test that visits each upstream utility path and asserts the canonical local URL.
6. Add a Playwright assertion on `/tools` for visible upstream provenance copy and the upstream repository link.
7. Run the Step 4 verification commands and fix any failures within this step’s scope.

## Interfaces and Data Contracts
- Canonical routes stay unchanged: `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, `/tools/serial-usb`.
- Compatibility source paths are exact public GET page paths only: `/repeater_name_tool`, `/companion_name_tool`, `/prefix_matrix`, `/serial_usb_tool`.
- Redirects are permanent only for exact page-path mappings and must not include `/contacts`, `/submit`, API endpoints, static files, or upstream internals.
- Provenance copy uses `UPSTREAM_UTILITIES_PROVENANCE` from `@/lib/upstream-utilities`; runtime code still does not import from `vendor/`.
- External provenance link must use `target="_blank"` and `rel="noopener noreferrer"`.

## Verification Plan
- Automated:
  - `npm run test:e2e -- --grep "tools|navigation|critical page smoke"`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
- Manual:
  - Start the dev server and visit `/repeater_name_tool`, `/companion_name_tool`, `/prefix_matrix`, and `/serial_usb_tool` in Chromium.
  - Confirm each lands on the matching `/tools/*` route without iframe/proxy behavior.
  - Confirm `/tools` shows the upstream provenance note and external link without console errors.
- Regression:
  - Existing global security headers remain in `headers()`.
  - Existing active nav behavior remains covered by navigation smoke tests.
  - No runtime source imports from `vendor/meshcore-utilities-site`.

## Stop Conditions
- Pause before redirecting `/contacts`, POST `/submit`, static/data paths, or any ambiguous upstream route.
- Pause if local canonical pages would need behavioral API compatibility for upstream POST contracts.
- Pause if adding provenance requires visual redesign rather than text-level scaffolding.
- Pause if Next redirect behavior strips query strings that are required for a confirmed upstream flow.
