# Architecture Research: CoreScope live map replacement

Checked: 2026-05-13

Project: Brownfield replacement of the existing Denver MeshCore `/map` live map with CoreScope from `https://github.com/Kpa-clawbot/CoreScope`, preferably as a git submodule under `vendor/`.

### ITEM-architecture-1: Treat CoreScope as a sidecar application, not a React component import

- **Recommendation:** Add CoreScope as a pinned git submodule under `vendor/CoreScope` and run it as a separate service/container that the Denver site links or redirects to for the canonical live map experience.
- **Rationale:** CoreScope is not a frontend widget. Its documented architecture is a two-process Go system: MQTT ingestor + Go HTTP server, backed by SQLite/in-memory indexes, serving a vanilla JS SPA and WebSocket stream. The local Denver site is a Next.js 16 app with a React Leaflet map currently rendered by `src/app/map/page.tsx` and `src/components/NetworkMap.tsx`. Importing CoreScope into this React tree would require porting its Go API, SQLite store, WebSocket hub, vanilla SPA router, and static assets, defeating the purpose of using CoreScope.
- **Confidence:** HIGH
- **Source:** GitHub README — https://github.com/Kpa-clawbot/CoreScope#architecture; local — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not hand-port CoreScope screens into the existing `NetworkMap` React component; it duplicates CoreScope and violates the “use CoreScope as submodule where practical” constraint. Do not iframe CoreScope inside `/map`; it creates navigation, CSP, sizing, and accessibility problems while hiding CoreScope’s hash-router and WebSocket assumptions.

### ITEM-architecture-2: Make `/map` a handoff route to CoreScope, not a second map implementation

- **Recommendation:** Replace the current `/map` page body with a canonical CoreScope handoff: either a server-side redirect to the CoreScope map host or a lightweight Denver-branded landing shell with a primary CTA to the CoreScope `#/map` or `#/live` view. Any visual redesign of that shell should be delegated to `co-ui`/native Opus UI.
- **Rationale:** The local `/map` page currently owns metadata, hero content, the `NetworkMapWrapper`, GPL attribution, analyzer link, and explanatory panels. If CoreScope is canonical, keeping the existing React Leaflet map creates two map products and two data pipelines. A handoff preserves the Denver site’s navigation and SEO while making CoreScope the single live-map UI.
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx:71-129`; CoreScope client router — `https://github.com/Kpa-clawbot/CoreScope/blob/master/public/app.js`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not keep `NetworkMapWrapper` as the primary map once CoreScope is enabled. Do not embed CoreScope in the existing page via iframe unless a later product decision explicitly accepts iframe tradeoffs and frame/CSP changes.

### ITEM-architecture-3: Prefer host/subdomain routing over path-prefix proxying

- **Recommendation:** Route CoreScope on its own host, e.g. `map.meshcore.coloradomesh.org` or the existing analyzer host, and have `/map` redirect or link there. If it must live on the same apex domain, use an edge/reverse proxy with host-based routing rather than a path prefix like `/map/*`.
- **Rationale:** CoreScope’s browser code hardcodes root-relative API calls such as `fetch('/api/config/cache')`, `fetch('/api' + path)`, and WebSocket `new WebSocket(`${proto}://${location.host}`)`. The Denver Next app already owns `/api/map/*`, `/api/live-map/*`, `/api/geocode`, and middleware rate-limits `/api/:path*`. Mounting CoreScope under `/map` without modifying CoreScope would make its `/api/*` calls hit the Next app, not CoreScope. A dedicated host lets CoreScope own `/api/*`, static assets, hash routes, and `/ws` cleanly.
- **Confidence:** HIGH
- **Source:** CoreScope source — `https://github.com/Kpa-clawbot/CoreScope/blob/master/public/app.js`, `https://github.com/Kpa-clawbot/CoreScope/blob/master/public/live.js`; local API routes — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/api`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/middleware.ts`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not use a simple Next.js rewrite from `/map/:path*` to CoreScope; it will not fix CoreScope’s absolute `/api` and WebSocket root assumptions. Do not remap all `/api/*` to CoreScope because the Denver site has existing API routes.

### ITEM-architecture-4: Use Docker Compose layering for CoreScope deployment

- **Recommendation:** Add a CoreScope service in Compose using `build.context: ./vendor/CoreScope` or the published image, keep it behind a profile such as `corescope`, and layer production settings with an override file. Mount durable CoreScope data at `/app/data` and a Denver-specific `config.json` into `/app/config.json`.
- **Rationale:** The current repository already uses `compose.yaml`, `compose.live-map.yaml`, and a `web` service for the Next app. CoreScope’s Dockerfile builds the Go server, ingestor, static SPA, Mosquitto, Caddy, and supervisor-managed processes; its README recommends a prebuilt image or source build with `/app/data` mounted. Docker Compose’s documented merge model supports environment-specific service layering without duplicating the main web service.
- **Confidence:** HIGH
- **Source:** Local compose — `/Users/cjvana/Documents/GitHub/denvermc-org/compose.yaml`, `/Users/cjvana/Documents/GitHub/denvermc-org/compose.live-map.yaml`; CoreScope Docker — https://github.com/Kpa-clawbot/CoreScope/blob/master/Dockerfile; Docker docs — https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not copy CoreScope’s built static files into the Next `public/` directory; the static files depend on CoreScope’s API and WebSocket server. Do not make the Next container run CoreScope processes; keep process ownership and health checks separate.

### ITEM-architecture-5: Disable CoreScope’s bundled Caddy/Mosquitto only when an outer proxy/broker owns those roles

- **Recommendation:** For a deployment behind the existing site reverse proxy, run CoreScope with `DISABLE_CADDY=true`; set `DISABLE_MOSQUITTO=true` only when CoreScope ingests from an external MQTT broker/source and does not need the bundled local broker.
- **Rationale:** CoreScope’s entrypoint selects supervisor configs based on `DISABLE_CADDY` and `DISABLE_MOSQUITTO`. The no-Caddy supervisor runs Mosquitto, the ingestor, and the Go server directly on port 3000. This aligns with an architecture where the Denver deployment’s outer proxy terminates TLS and routes a map subdomain to CoreScope.
- **Confidence:** HIGH
- **Source:** CoreScope Docker entrypoint/supervisor — https://github.com/Kpa-clawbot/CoreScope/blob/master/docker/entrypoint-go.sh, https://github.com/Kpa-clawbot/CoreScope/blob/master/docker/supervisord-go-no-caddy.conf
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not expose CoreScope’s bundled Caddy publicly if the Denver deployment already terminates TLS; double proxies complicate headers, WebSocket upgrades, and certificates. Do not disable Mosquitto unless MQTT sources are configured to avoid silently running a live UI with no packet ingest.

### ITEM-architecture-6: Move live-map data ownership from Next API adapters to CoreScope APIs

- **Recommendation:** Treat CoreScope as the authoritative map/analyzer API and retire the Next `/api/map/*` and `/api/live-map/*` data path from the live-map UI. Keep old endpoints only as compatibility/status fallbacks until consumers are removed.
- **Rationale:** The Denver app currently normalizes `MESHCORE_LIVE_MAP_API_URL` or MQTT data into `MapSnapshot` through `src/lib/map/store.ts`, then renders with React Leaflet. CoreScope exposes a larger analyzer API surface (`/api/nodes`, `/api/packets`, `/api/stats`, `/api/config/map`, `/api/observers`, `/api/analytics/*`, `/ws`) and expects its frontend to consume those endpoints directly. Maintaining a parallel Next normalization layer would duplicate logic and risk inconsistent node status, regions, packet history, and route playback.
- **Confidence:** HIGH
- **Source:** Local store — `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/store.ts`; CoreScope routes — https://github.com/Kpa-clawbot/CoreScope/blob/master/cmd/server/routes.go
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not adapt every CoreScope endpoint into the existing `ApiResponse<T>` wrapper; CoreScope already has a public API contract and SPA. Do not keep the current `/api/live-map/*` proxy as the primary source for CoreScope; it is designed around the previous `meshcore-mqtt-live-map` service, not CoreScope’s packet analyzer.

### ITEM-architecture-7: Create a Denver-specific CoreScope configuration artifact

- **Recommendation:** Add a generated or checked-in non-secret CoreScope config template for Colorado Mesh values, with secrets supplied via deployment environment or mounted private config. Required values include `branding`, `mapDefaults.center`, `mapDefaults.zoom`, `defaultRegion`, `regions`, MQTT sources, optional `geo_filter`, and node/observer blacklist policy.
- **Rationale:** CoreScope’s `config.example.json` defaults are Bay Area/SJC-oriented and include example MQTT sources, regions, map center, branding, hash channels, cache TTL, retention, and geofilter settings. The Denver site currently centralizes Colorado map defaults in env vars (`MESHCORE_MAP_DEFAULT_LATITUDE=39.5501`, longitude `-105.7821`, zoom `7`). Without a Colorado config, CoreScope will present the wrong default geography and region vocabulary.
- **Confidence:** HIGH
- **Source:** CoreScope config — https://github.com/Kpa-clawbot/CoreScope/blob/master/config.example.json; local env — `/Users/cjvana/Documents/GitHub/denvermc-org/.env.example`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/config.ts`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not rely on CoreScope zero-config defaults for production. Do not commit MQTT passwords, API keys, or channel secrets; use mounted secret config or deployment secret injection.

### ITEM-architecture-8: Keep submodule mechanics explicit and pinned

- **Recommendation:** Add CoreScope with `git submodule add https://github.com/Kpa-clawbot/CoreScope vendor/CoreScope`, commit `.gitmodules` plus the submodule pointer, and add a small verification script or documented CI step that runs `git submodule update --init --recursive` before building CoreScope.
- **Rationale:** Git submodules are the right fit for vendored source because the parent repository records an exact CoreScope commit while preserving upstream history. The local repo already uses a `vendor/meshcore-utilities-site` submodule, so the pattern is established. The build and review process must make the pinned revision visible because updating the submodule checkout alone does not update the parent repo.
- **Confidence:** HIGH
- **Source:** Git docs — https://git-scm.com/book/en/v2/Git-Tools-Submodules; local — `/Users/cjvana/Documents/GitHub/denvermc-org/.gitmodules`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not vendor CoreScope by copying files into the repo; it hides upstream history and makes updates painful. Do not track “latest” implicitly in deployment; pin and review a concrete submodule commit.

### ITEM-architecture-9: Use an outer reverse proxy for WebSockets and avoid Next external rewrites for CoreScope traffic

- **Recommendation:** Put Caddy/nginx/Traefik or the existing deployment proxy in front of both services and route the CoreScope host directly to the CoreScope service, including WebSocket upgrade traffic. Keep Next rewrites limited to simple redirects/handoff where possible.
- **Rationale:** Next.js rewrites can proxy external URLs and are useful for incremental adoption, but CoreScope’s WebSocket uses the site root host and its SPA expects root-relative APIs. A real reverse proxy is a better boundary for a second full web app. Next.js self-hosting guidance also recommends a reverse proxy for malformed requests, rate limits, and payload controls; recent Next advisories around external rewrites and WebSocket upgrades make minimizing this surface prudent even though the local app is on a patched Next 16.2.5 line.
- **Confidence:** MEDIUM
- **Source:** Next docs — https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites; WebSearch — https://github.com/vercel/next.js/security/advisories/GHSA-c4j6-fc7j-m34r, https://github.com/vercel/next.js/security/advisories/GHSA-ggv3-7p47-pfv8
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not depend on Next rewrites as the long-term proxy for CoreScope API and WebSocket traffic. Do not expose CoreScope and Next on unrelated public ports without a single canonical URL plan.

### ITEM-architecture-10: Update navigation, metadata, sitemap, and license attribution around CoreScope

- **Recommendation:** Change the Denver site’s Live Map navigation and `/map` metadata to describe CoreScope as the canonical map/analyzer, update attribution links to `Kpa-clawbot/CoreScope`, and ensure source/license text treats CoreScope as GPL-3.0 unless upstream resolves the license contradiction.
- **Rationale:** GitHub metadata and the repository LICENSE identify CoreScope as GPL-3.0, while the README currently says MIT. The current Denver `/map` page already contains GPL attribution for the prior `yellowcooln/meshcore-mqtt-live-map` source. The replacement should not leave stale upstream attribution or schema `isBasedOn` data in place.
- **Confidence:** MEDIUM
- **Source:** GitHub repo metadata — https://github.com/Kpa-clawbot/CoreScope; CoreScope LICENSE — https://github.com/Kpa-clawbot/CoreScope/blob/master/LICENSE; local map page — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx:55-69`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not retain attribution to the previous live-map project as the primary basis for `/map`. Do not assume MIT based on README text until the upstream license mismatch is clarified.

### ITEM-architecture-11: Verification gates should cover submodule, service health, route handoff, and WebSocket behavior

- **Recommendation:** Add review gates for: submodule initialized; Compose config renders; CoreScope container builds/starts; `/api/healthz`, `/api/config/map`, `/api/stats`, and `/#/map` respond; WebSocket connects through the chosen host; Denver `/map` handoff works from desktop/mobile navigation; Next `npm run lint`, `npm run typecheck`, unit tests, and relevant Playwright route tests pass.
- **Rationale:** The integration crosses repo management, deployment, routing, WebSockets, and existing site navigation. The local package already has verification scripts (`lint`, `typecheck`, `test`, `test:e2e`, Docker smoke) and CoreScope has Go, Node, and Playwright tests. A focused integration gate catches the most likely brownfield failures without requiring a full CoreScope test suite on every Denver site change.
- **Confidence:** HIGH
- **Source:** Local package scripts — `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; CoreScope README test suite — https://github.com/Kpa-clawbot/CoreScope#for-developers
- **Checked:** 2026-05-13
- **Alternatives rejected:** Do not validate only the Next build; CoreScope can fail independently. Do not require full upstream CoreScope CI for every Denver content change unless the submodule pointer or CoreScope config changes.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-architecture-1 | HIGH | GitHub + Local code | https://github.com/Kpa-clawbot/CoreScope#architecture; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx` |
| ITEM-architecture-2 | HIGH | Local code + GitHub source | `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`; https://github.com/Kpa-clawbot/CoreScope/blob/master/public/app.js |
| ITEM-architecture-3 | HIGH | GitHub source + Local code | https://github.com/Kpa-clawbot/CoreScope/blob/master/public/live.js; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/api` |
| ITEM-architecture-4 | HIGH | Local code + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/compose.yaml`; https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/ |
| ITEM-architecture-5 | HIGH | GitHub source | https://github.com/Kpa-clawbot/CoreScope/blob/master/docker/entrypoint-go.sh |
| ITEM-architecture-6 | HIGH | Local code + GitHub source | `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/store.ts`; https://github.com/Kpa-clawbot/CoreScope/blob/master/cmd/server/routes.go |
| ITEM-architecture-7 | HIGH | GitHub source + Local code | https://github.com/Kpa-clawbot/CoreScope/blob/master/config.example.json; `/Users/cjvana/Documents/GitHub/denvermc-org/.env.example` |
| ITEM-architecture-8 | HIGH | Official docs + Local code | https://git-scm.com/book/en/v2/Git-Tools-Submodules; `/Users/cjvana/Documents/GitHub/denvermc-org/.gitmodules` |
| ITEM-architecture-9 | MEDIUM | Official docs + WebSearch | https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites; https://github.com/vercel/next.js/security/advisories/GHSA-c4j6-fc7j-m34r |
| ITEM-architecture-10 | MEDIUM | GitHub metadata + Local code | https://github.com/Kpa-clawbot/CoreScope; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx` |
| ITEM-architecture-11 | HIGH | Local code + GitHub README | `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; https://github.com/Kpa-clawbot/CoreScope#for-developers |
