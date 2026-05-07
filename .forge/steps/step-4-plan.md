# Step 4 Execution Plan: Full in-site live-map UI/UX parity through Opus UI delegation

## Goal
Deliver the user-facing `/map` parity pass against `meshcore-mqtt-live-map` using the stable Step 2-3 server contracts, while keeping visual/frontend implementation delegated to native Opus UI.

## Current Code Observations
- `src/app/map/page.tsx` already renders the map page, attribution, explanatory panels, and `NetworkMapWrapper`, but the hero meta still references stale `/api/map/nodes · /api/map/stats` copy instead of the canonical snapshot/runtime and live-map proxy contracts.
- `src/components/NetworkMap.tsx` is a browser-only React Leaflet implementation with marker plotting, role/status filters, popups, runtime tile config, and loading/error/empty states. It currently does not expose upstream-style operator panels for live-map status, feature availability, coverage, LOS, weather, peer history, or share/deep-link state.
- `src/components/NetworkMapWrapper.tsx` dynamically imports the Leaflet map on the client, which must be preserved to avoid server-side Leaflet imports.
- `src/hooks/useMapSnapshot.ts` fetches only `API_ROUTES.MAP_SNAPSHOT` and `API_ROUTES.MAP_RUNTIME`, returning nodes, stats, connection, source, warnings, features, runtime config, error, loading, and refresh state.
- Step 3 added scoped browser-safe local proxy routes under `/api/live-map/*`, plus `API_ROUTES.LIVE_MAP_STATUS`, `LIVE_MAP_SNAPSHOT`, `LIVE_MAP_STATS`, `LIVE_MAP_NODES`, `LIVE_MAP_COVERAGE`, `LIVE_MAP_LOS`, `LIVE_MAP_LOS_ELEVATIONS`, and `LIVE_MAP_WEATHER_RADAR_COUNTRY_BOUNDS` constants.
- `src/lib/map/types.ts` defines `MapSnapshot`, `MapRuntimePublicConfig`, `MapConnectionStatus`, `MapSnapshotWarning`, and `MapAdvancedFeature`; these are the client-facing data contracts the UI must use.
- `src/lib/live-map/types.ts` records proxied endpoints as `snapshot`, `stats`, `nodes`, `peers`, `los`, `los-elevations`, `coverage`, and `weather-radar-country-bounds`, with `websocket`, `debug`, and `turnstile` deferred.
- Existing map subcomponents cover only controls, legend, stats overlay, popup details, and marker palette. They do not yet show source diagnostics/warnings, advanced endpoint availability, optional feature panels, or operator guidance for unavailable sidecar/live-map routes.
- Upstream `meshcore-mqtt-live-map` UI behavior inspected from `/tmp/meshcore-mqtt-live-map/backend/static/app.js` includes layer toggles, labels/node sizing preferences, localStorage-backed options, linked-device deep links, peer/history/route details, coverage, LOS, weather/radar affordances, and disabled/degraded states for optional backends.

## Files to Change
- `.forge/steps/step-4-plan.md` — this execution plan.
- `src/app/map/page.tsx` — update map-page copy/meta and any non-secret operator guidance around the new contracts.
- `src/components/NetworkMap.tsx` — Opus-owned map UI parity implementation while preserving client-only Leaflet behavior and server API contracts.
- `src/components/NetworkMapWrapper.tsx` — adjust wrapper props only if Opus needs additional browser-safe map options.
- `src/components/map/*` — Opus-owned components for diagnostics, layers, source warnings, advanced panels, peer/coverage/LOS/weather affordances, empty/error/loading states, and accessibility improvements.
- `src/hooks/useMapSnapshot.ts` — add browser-safe helper hooks for local `/api/live-map/*` endpoints only if needed; do not change backend semantics.
- `src/app/globals.css` — Opus-owned styling changes only.
- `tests/e2e/smoke.spec.ts` — update smoke/a11y coverage for the richer map UI, using stable visible copy and no protected upstream dependency.

## Ordered Implementation Checklist
1. Delegate implementation to Opus UI via `co-ui` from the repository root with a prompt that includes the contracts, current file list, upstream behavior targets, and the hard rule that protected upstream URLs/tokens must never be fetched or exposed in browser code.
2. Have Opus update `/map` copy so it references `/api/map/snapshot`, `/api/map/runtime`, and local `/api/live-map/*` operator routes rather than stale `/api/map/nodes` and `/api/map/stats` copy.
3. Have Opus extend the map experience with practical upstream parity: source diagnostics, sample/demo warnings, connection state, advanced feature availability, runtime tile/source metadata, layer/label preferences, better marker/popup details, and clear unavailable/deferred messaging for optional live-map features.
4. Have Opus add browser-safe advanced affordances that use only local APIs: live-map status/stats, coverage fallback, LOS input/result panel, weather availability/country-bounds affordance, and peer/deep-link states where route contracts allow it; hide or mark unavailable when data/routes are absent.
5. Have Opus preserve core invariants: `NetworkMapWrapper` remains the only Leaflet import boundary, `NetworkMap` remains client-only, browser requests stay on same-origin site APIs, and all upstream token/error handling stays server-side.
6. Review Opus changes in this session for non-visual correctness: import boundaries, TypeScript contracts, route constants, no direct upstream browser fetches, no secret exposure, no fake parity, and no accidental backend semantic changes.
7. Update Playwright smoke/a11y tests for `/map` to assert the page loads, source/feature diagnostics render, and no basic accessibility regressions are introduced without requiring a configured live-map sidecar.
8. Run automated verification and then perform browser validation on `/map`, including desktop/mobile responsive checks, console/network inspection, filters, popups, advanced panel unavailable states, and stale/sample warning visibility.
9. Stage the Step 4 files, run the Forge reviewer on the staged diff with this plan and verification notes, fix any required findings, and commit only after approval.

## Interfaces and Data Contracts
- `GET /api/map/snapshot` returns `ApiResponse<MapSnapshot>` and remains the primary map data source.
- `GET /api/map/runtime` returns `ApiResponse<MapRuntimePublicConfig>` and is the only source for runtime tile URL/attribution/default center/source warnings exposed to the browser.
- Local live-map routes return `ApiResponse<unknown>` or `ApiResponse<ReturnType<typeof buildLiveMapStatus>>`; UI may call them only through `API_ROUTES` constants or same-origin paths.
- Deferred upstream capabilities must remain visibly deferred/unavailable rather than being presented as working features: WebSocket, debug endpoints, and Turnstile auth.
- UI state can use localStorage for display preferences such as labels/layers/node sizing, but must not store tokens, upstream URLs, MQTT credentials, or generated secrets.
- Leaflet imports must remain inside client-only code paths; server components must not import `leaflet` or `react-leaflet`.
- Browser code must not construct or fetch `MESHCORE_LIVE_MAP_API_URL`, MQTT URLs, or any protected upstream service URL directly.

## Verification Plan
- Automated:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `npm run build`
- Manual:
  - Start the dev server and open `/map` on desktop and mobile widths.
  - Check marker plotting, filters, popups, source diagnostics, sample/demo warnings, advanced live-map feature availability, and optional panel unavailable states.
  - Inspect browser console for hydration/runtime errors.
  - Inspect network requests and confirm browser requests go only to same-origin `/api/map/*` and `/api/live-map/*` routes, never protected upstream URLs or tokens.
- Regression:
  - Existing critical page smoke/a11y tests for `/`, `/map`, and `/tools` continue to pass.
  - The map still works without `MESHCORE_LIVE_MAP_API_URL` configured.
  - Empty/error/loading states remain meaningful for no located nodes, failed snapshot fetches, and unavailable advanced endpoints.

## Stop Conditions
- Pause and ask the user before adding new product scope outside the Step 4 map UI parity pass, such as contacts export, raw MQTT decoding in Next.js, a site-owned database, or production deployment changes.
- Stop and revise the plan if Opus needs backend/API semantic changes beyond consuming the Step 2-3 contracts.
- Stop and fix immediately if any browser bundle, API response, visible copy, or network request exposes upstream credentials, MQTT credentials, protected upstream URLs, or raw token strings.
- Stop if the UI requires live-map sidecar data to render the basic `/map` page; the page must degrade safely when the sidecar is not configured.
