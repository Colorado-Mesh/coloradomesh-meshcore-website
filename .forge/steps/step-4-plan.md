# Step 4 Execution Plan: Port and brand the live network map experience

## Goal
Replace the legacy `/map` experience with a Colorado MeshCore live map page and client map implementation that consume the Step 3 `/api/map/*` contracts instead of legacy Turso `/api/nodes` data, while preserving SSR safety for Leaflet and removing map-page links to `/observer`.

## Current Code Observations
- `src/app/map/page.tsx` still contains Denver MeshCore metadata, Denver copy, and an `/observer` CTA.
- `src/components/NetworkMap.tsx` is a client-only Leaflet component that fetches `/api/nodes`, consumes `NodeWithStats`, detects observer/gateway nodes by Denver-era naming patterns, and renders legacy packet fields.
- `src/components/NetworkMapWrapper.tsx` dynamically imports `NetworkMap` to avoid Leaflet SSR errors and currently types props as `NodeWithStats[]`.
- Step 3 introduced `MapNode`, `MapStats`, `/api/map/nodes`, `/api/map/stats`, and `useMapSnapshot`/`useMapStats` without migrating UI consumers.
- Step 2 introduced reusable brand primitives (`HeroPanel`, `MetricStrip`, `NetworkPanel`, `ToolCard`, `SectionEyebrow`) and the night-sky operations-console visual system.
- This session is Codex-backed, so visual/frontend map/page implementation must be delegated to native Opus 4.7 xhigh via `co-ui` or `/opus-ui`.

## Files to Change
- `.forge/steps/step-4-plan.md` — record this execution plan.
- `src/app/map/page.tsx` — rebrand metadata/JSON-LD and replace legacy page shell/observer CTA with the new live-map layout.
- `src/components/NetworkMap.tsx` — replace legacy `NodeWithStats` map implementation with a `MapNode`-based live map using `/api/map/*` via hooks.
- `src/components/NetworkMapWrapper.tsx` — update wrapper props/loading state to match the new `MapNode` contract.
- Add `src/components/map/LiveMap.tsx` only if Opus chooses to split the implementation; otherwise `NetworkMap.tsx` may remain the dynamic map entrypoint.
- Add map subcomponents such as `MapLegend`, `NodePopup`, `MapToolbar`, `ConnectionStatus`, or `MapStatsOverlay` only if useful for clarity and not over-scoped.
- `src/components/index.ts` — update exports if new map components are added or wrapper signatures change.
- `src/app/globals.css` — add small Leaflet popup/control styling only if required by the implementation.

## Ordered Implementation Checklist
1. Delegate the visual/frontend implementation to Opus UI with a concise handoff covering the existing map files, Step 3 contracts, Step 2 visual primitives, and strict scope boundaries.
2. Ensure the map page metadata, OpenGraph data, JSON-LD web app name/description, and visible copy say Colorado MeshCore/Colorado Mesh and not Denver MeshCore.
3. Remove the `/observer` CTA from `/map` and replace it with relevant links to `/tools`, `/guides/getting-started`, `/start`, or Discord as appropriate.
4. Update the client Leaflet map to consume `MapNode` data from `useMapSnapshot` or explicit `MapNode[]` props, fetching `/api/map/nodes` and `/api/map/stats` only.
5. Render exact node coordinates when present and omit marker rendering for nodes without valid coordinates while surfacing located/visible/online counts in stats overlays.
6. Add marker styling for roles/statuses (`online`, `stale`, `offline`, `unknown`) and popups showing name, role, public key prefix, last heard, firmware/model, battery, radio metrics, route/neighbors when available.
7. Add map-page source/freshness messaging for sample/configured/live data and exact-location public-data notice.
8. Preserve SSR safety by keeping Leaflet inside dynamically imported client components and avoiding browser globals outside client code.
9. Confirm no public map UI fetches `/api/nodes`, `/api/stats`, or `/api/health`.
10. Run automated verification and browser validation for `/map`, including console/network checks.
11. Stage changed Step 4 files, request Forge review, fix findings, save review JSON, and commit.

## Interfaces and Data Contracts
- `NetworkMapWrapper` and any `LiveMap` component use `MapNode[]` and optional `MapStats`, not `NodeWithStats[]`.
- The map client fetches only `API_ROUTES.MAP_NODES` and `API_ROUTES.MAP_STATS` via Step 3 hooks/routes.
- Marker rendering uses `MapNode.coordinates.latitude` and `MapNode.coordinates.longitude` exactly as returned.
- Empty/sample/configured states use `MapStats.source`, `MapStats.connectionState`, and hook loading/error state.
- Route and neighbor display uses `MapNode.route`/`MapNode.neighbors` if present; full route history UI remains out of scope.

## Verification Plan
- Automated: `npm run lint`, `npm run typecheck`, `npm run build`.
- Grep: `grep -R "Denver MeshCore\|/observer\|/api/nodes\|/api/stats\|/api/health" -n src/app/map src/components/NetworkMap.tsx src/components/NetworkMapWrapper.tsx src/components/map || true`.
- Manual/browser: run dev server, open `/map`, verify map renders sample markers, popups open, source/freshness/exact-location copy appears, no observer CTA exists, mobile-width layout remains usable, and console/network show no unexpected errors.
- Network validation: confirm `/map` requests `/api/map/nodes` and `/api/map/stats`, not legacy `/api/nodes`.

## Stop Conditions
- If Opus UI cannot be invoked, pause and produce an Opus handoff prompt instead of doing visual/frontend implementation directly in Codex.
- If Leaflet hydration or browser runtime issues require architectural changes outside the map components/page, pause and update the master plan before expanding scope.
- If implementing WebSocket/SSE/live route streaming becomes necessary, defer it; this step should use the polling contracts from Step 3.
- If the map requires new persistent storage/history, pause because Step 4 is UI/data-contract consumption only.
