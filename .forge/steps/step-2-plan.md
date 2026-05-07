# Step 2 Execution Plan: Canonical map snapshot and runtime map config

## Goal
Add a single canonical map snapshot API, a public runtime map configuration API, bearer-token live-map API auth, sample-data warnings, and mechanical client wiring away from split nodes/stats fetches.

## Current Code Observations
- `src/lib/map/store.ts` already builds full `MapSnapshot` objects internally, but only exposes `/api/map/nodes` and `/api/map/stats` routes.
- `src/hooks/useMapSnapshot.ts` fetches nodes and stats independently, which can produce inconsistent client state across refresh cycles.
- `src/lib/map/store.ts` currently sends the live-map API token as a `token` query parameter and also includes `mode=full` in the URL.
- `src/lib/map/types.ts` has no warning, runtime config, or advanced-feature fields on `MapSnapshot`.
- `src/lib/map/config.ts` reads `NEXT_PUBLIC_MAP_TILE_URL` into server runtime config; the browser map uses a hard-coded CARTO tile URL instead of the runtime value.
- `src/components/NetworkMap.tsx` has hard-coded tile URL/attribution constants; Step 2 should only do mechanical runtime-config wiring, not visual redesign.
- `.env.example` and `compose.yaml` still expose `NEXT_PUBLIC_MAP_TILE_URL`; Step 2 should introduce a server runtime map tile variable while preserving fallback behavior.
- Existing map routes return `ApiResponse<T>` and set short public cache headers.

## Files to Change
- `src/lib/constants.ts` — add canonical snapshot/runtime API route constants and runtime env key for server-side map tile URL.
- `src/lib/map/types.ts` — add public runtime config/warning/advanced-feature types and extend `MapSnapshot`.
- `src/lib/map/config.ts` — parse runtime public map config, whitelist browser-safe fields, and support sample-data warning semantics.
- `src/lib/map/store.ts` — add warnings/features to snapshots, use bearer auth for live-map API fetches, keep compatibility node/stat helpers wrapping `getMapSnapshot()`.
- `src/lib/map/index.ts` and `src/lib/types.ts` — export new types/helpers.
- `src/app/api/map/snapshot/route.ts` — add canonical snapshot route.
- `src/app/api/map/runtime/route.ts` — add public runtime map config route.
- `src/app/api/map/nodes/route.ts` and `src/app/api/map/stats/route.ts` — keep wrappers over the canonical snapshot helpers.
- `src/hooks/useMapSnapshot.ts` — fetch `/api/map/snapshot` once and expose warning/runtime-compatible snapshot state.
- `src/components/NetworkMap.tsx` — mechanically consume runtime tile URL/attribution from the hook; no visual redesign.
- `.env.example` and `compose.yaml` — document/use runtime server map tile configuration and sample/demo behavior.
- `src/lib/map/__tests__/config.test.ts` and `src/lib/map/__tests__/store.test.ts` — add contract tests.
- `src/lib/parity/manifest.ts` — update live-map API coverage refs/local refs for the new snapshot/runtime contract.

## Ordered Implementation Checklist
1. Extend map types with `MapRuntimePublicConfig`, `MapSnapshotWarning`, `MapAdvancedFeature`, and `MapSnapshot.features/warnings`.
2. Add config helpers that return whitelisted public runtime map settings: tile URL, attribution, default center/zoom, source labels, sample/demo warning, and feature availability defaults.
3. Change live-map API fetching to send `Authorization: Bearer <token>` when configured and never append the token to URL query parameters.
4. Build sample/live/MQTT/empty snapshots with warnings and feature availability, including a production sample-data warning unless explicit demo/sample mode is set.
5. Add `/api/map/snapshot` and `/api/map/runtime` routes with safe `ApiResponse` payloads and short cache headers.
6. Update existing nodes/stats routes and the `useMapSnapshot` hook so clients use one snapshot fetch while compatibility routes remain available.
7. Wire `NetworkMap` to use runtime tile URL/attribution from the hook in a mechanical way only.
8. Update env/Compose docs from browser-frozen map tile config toward server runtime config, keeping backwards-compatible fallback for existing `NEXT_PUBLIC_MAP_TILE_URL` deployments.
9. Add Vitest tests for config parsing, bearer auth, token non-leakage in URL, sample warning semantics, runtime public config redaction, and nodes/stats wrapper consistency.
10. Run lint, typecheck, unit tests, and build; fix Step 2 issues before staging.

## Interfaces and Data Contracts
- `GET /api/map/snapshot` returns `ApiResponse<MapSnapshot>` with `nodes`, `links`, `routes`, `stats`, `connection`, `source`, `warnings`, and `features`.
- `GET /api/map/runtime` returns `ApiResponse<MapRuntimePublicConfig>` and must only include browser-safe public fields.
- `MESHCORE_LIVE_MAP_API_TOKEN` stays server-only and is sent as `Authorization: Bearer <token>`.
- `MESHCORE_MAP_TILE_URL` is the preferred runtime tile URL; `NEXT_PUBLIC_MAP_TILE_URL` remains a fallback for existing installs.
- `/api/map/nodes` and `/api/map/stats` remain compatibility routes derived from `getMapSnapshot()`.

## Verification Plan
- Automated: `npm run lint`
- Automated: `npm run typecheck`
- Automated: `npm run test:unit`
- Automated: `npm run build`
- Manual/API: Start the app if needed and query `/api/map/snapshot`, `/api/map/runtime`, `/api/map/nodes`, and `/api/map/stats` to confirm payload shapes and no token exposure.
- Regression: Confirm no browser code fetches the upstream live-map API directly and no response includes `MESHCORE_LIVE_MAP_API_TOKEN`.

## Stop Conditions
- Stop before visual/aesthetic map UI changes; Step 2 only allows mechanical runtime wiring.
- Stop if a runtime map setting would require exposing credentials or raw upstream URLs that may be protected.
- Stop if live-map WebSocket/advanced proxy work becomes necessary; that belongs to Step 3.
