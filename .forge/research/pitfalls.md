# Pitfalls Research: Replacing Denver MeshCore live map with CoreScope

Checked: 2026-05-13

### ITEM-pitfalls-1: Treating CoreScope as a drop-in React component

- **What goes wrong:** The replacement starts by importing CoreScope files into `src/components/NetworkMap.tsx` or copying CoreScope `public/*.js` into the Next.js bundle, then build/runtime breaks because CoreScope is a standalone vanilla-JS SPA backed by a Go API and WebSocket server, not a React component library.
- **Root cause:** The current Denver site is a Next.js App Router app with a React Leaflet component under `/map`; CoreScope serves its own `public/index.html`, hash router (`#/map`, `#/live`, etc.), REST endpoints under `/api/*`, and WebSocket connections from its Go server.
- **Prevention:** Integrate CoreScope as a sidecar application and route `/map` (or a scoped prefix) to that running service. Keep the submodule as source provenance and deployment input; do not port the UI by hand unless a separate UI implementation is delegated.
- **Severity:** CRITICAL
- **Phase relevance:** Architecture and implementation planning
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx`, `/tmp/CoreScope/README.md`, `/tmp/CoreScope/public/index.html`, `/tmp/CoreScope/cmd/server/main.go`
- **Checked:** 2026-05-13

### ITEM-pitfalls-2: Submodule exists locally but is empty in CI, Docker, or Netlify

- **What goes wrong:** Local builds work after cloning CoreScope manually, but CI/deploy builds fail or deploy an empty `/vendor/CoreScope` because the parent repository only records a gitlink and the build environment never initializes submodules.
- **Root cause:** Git submodules are pinned commit references; normal clones can leave submodule directories empty unless `--recurse-submodules` or `git submodule update --init --recursive` is run. Docker builds copy only the initialized build context; Netlify supports submodules but has caveats around private/SSH and nested submodules.
- **Prevention:** Add CoreScope with a public HTTPS submodule URL under `vendor/corescope`, pin a release commit, and make verification explicit: `git submodule update --init --recursive` before `npm run build` and before `docker build`. Add a repo script similar to `utilities:check-submodule` that fails when the CoreScope path is missing or detached at an unexpected SHA.
- **Severity:** CRITICAL
- **Phase relevance:** Repository setup, CI, deployment
- **Confidence:** HIGH
- **Source:** Official docs — https://git-scm.com/book/en/v2/Git-Tools-Submodules; https://docs.netlify.com/build/git-workflows/repo-permissions-linking/
- **Checked:** 2026-05-13

### ITEM-pitfalls-3: Floating `latest` image or moving branch silently changes the map

- **What goes wrong:** Production behavior changes after a redeploy because the compose file pulls `ghcr.io/kpa-clawbot/corescope:latest` or a submodule update tracks `master` rather than a reviewed commit/release.
- **Root cause:** CoreScope is actively releasing; GitHub showed `v3.7.2` as latest on 2026-05-06, with recent map/runtime changes. Submodules pin commits, but container tags like `latest` move.
- **Prevention:** Pin both the submodule SHA and the runtime image tag/digest. Prefer a release tag such as `v3.7.2` after smoke testing, and update via an explicit PR that includes CoreScope release notes, API smoke tests, and map route verification.
- **Severity:** MODERATE
- **Phase relevance:** Deployment and release management
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/Kpa-clawbot/CoreScope/releases
- **Checked:** 2026-05-13

### ITEM-pitfalls-4: License metadata mismatch is ignored

- **What goes wrong:** The site updates attribution from the old `meshcore-mqtt-live-map` GPL notice to “CoreScope MIT/ISC” based on README/package metadata, then later discovers the repository `LICENSE` is GPL-3.0.
- **Root cause:** CoreScope has conflicting license signals: the GitHub repo and root `LICENSE` indicate GPL-3.0, while `package.json` says ISC and the README says MIT. The authoritative repository license file is GPL-3.0 unless clarified upstream.
- **Prevention:** Treat CoreScope as GPL-3.0 for compliance until upstream clarifies. Preserve notices, publish source/submodule commit references, and avoid copying CoreScope code into proprietary/non-GPL components. Ask upstream to resolve README/package metadata before relying on a permissive interpretation.
- **Severity:** CRITICAL
- **Phase relevance:** Legal/review gate before implementation
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/Kpa-clawbot/CoreScope; https://raw.githubusercontent.com/Kpa-clawbot/CoreScope/master/LICENSE; https://raw.githubusercontent.com/Kpa-clawbot/CoreScope/master/package.json
- **Checked:** 2026-05-13

### ITEM-pitfalls-5: Routing CoreScope at `/map` without accounting for root-relative assets and APIs

- **What goes wrong:** `/map` loads a blank page or partially styled shell because CoreScope’s HTML requests `/style.css`, `/app.js`, `/api/config/map`, `/api/nodes`, and `ws(s)://host/` from the origin root, colliding with the Denver Next app and its existing `/api/*` routes.
- **Root cause:** CoreScope is designed to own the origin root; it uses root-relative assets/API calls and a hash router. The Denver site already uses `/map` and `/api/map/*`/`/api/live-map/*` under the same origin.
- **Prevention:** Prefer a reverse-proxy mount on a dedicated subdomain (`map.denvermeshcore...` or `corescope...`) or run CoreScope at the site root for `/map` only with carefully rewritten asset/API/WebSocket paths. Do not proxy only `/map` and assume assets follow; test every CoreScope tab and `/api/docs` under the final URL.
- **Severity:** CRITICAL
- **Phase relevance:** Routing and deployment design
- **Confidence:** HIGH
- **Source:** Local code — `/tmp/CoreScope/public/index.html`, `/tmp/CoreScope/public/app.js`, `/tmp/CoreScope/cmd/server/routes.go`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/api/*`
- **Checked:** 2026-05-13

### ITEM-pitfalls-6: Existing security headers block iframe-based embedding

- **What goes wrong:** A quick integration uses `<iframe src="...CoreScope...">`, but the frame is blocked by `X-Frame-Options: DENY` or by CSP `frame-ancestors 'none'`; if the iframe points cross-origin, additional CSP and cookie/origin problems appear.
- **Root cause:** The Denver Next config and Netlify config intentionally deny framing for every path. CoreScope itself is a full application, not a widget.
- **Prevention:** Do not use iframe embedding as the primary replacement. Use reverse proxy/routing so CoreScope is the page response for the canonical map route, or explicitly scope header exceptions only if a temporary iframe is unavoidable and reviewed.
- **Severity:** MODERATE
- **Phase relevance:** UX/routing implementation
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/netlify.toml`
- **Checked:** 2026-05-13

### ITEM-pitfalls-7: Content Security Policy blocks CoreScope’s CDN dependencies and WebSocket

- **What goes wrong:** CoreScope’s map page renders without Leaflet, heatmap, Chart.js, Swagger UI, or live updates because Denver’s CSP currently allows scripts from `'self'` only and connect hosts are limited to known analyzer/map sources.
- **Root cause:** CoreScope `public/index.html` loads Leaflet, `leaflet-heat`, Chart.js, and Swagger UI from `unpkg.com`; its client opens a WebSocket to the same host, and map tiles come from CARTO. The current site CSP does not include `https://unpkg.com` in `script-src`/`style-src`.
- **Prevention:** Prefer vendoring CoreScope’s third-party browser assets into the CoreScope image/submodule so production CSP can remain mostly `self`. If using CDN assets, explicitly add pinned CDN hosts plus SRI verification and add `wss:`/same-origin WebSocket allowance for the CoreScope route.
- **Severity:** CRITICAL
- **Phase relevance:** Security headers and deployment verification
- **Confidence:** HIGH
- **Source:** Local code and official docs — `/tmp/CoreScope/public/index.html`; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`; https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy; https://leafletjs.com/download.html
- **Checked:** 2026-05-13

### ITEM-pitfalls-8: WebSocket upgrade is lost through the reverse proxy

- **What goes wrong:** CoreScope loads initially but the live packet feed, nav pulse, and map refresh never update; browser console shows WebSocket close/reconnect loops.
- **Root cause:** CoreScope opens `new WebSocket(`${proto}//${location.host}`)` and its Go server upgrades WebSocket requests at `/ws` and also any static path with `Upgrade: websocket`. Reverse proxies must forward `Upgrade` and `Connection` headers and preserve the expected path/host.
- **Prevention:** Configure the deployment proxy with HTTP/1.1 WebSocket upgrade headers and long timeouts. Smoke test `wss://<final-host>/ws` and browser live updates, not just HTTP `/api/stats`.
- **Severity:** CRITICAL
- **Phase relevance:** Deployment and operations
- **Confidence:** HIGH
- **Source:** Local code and CoreScope docs — `/tmp/CoreScope/public/app.js`, `/tmp/CoreScope/cmd/server/main.go`, `/tmp/CoreScope/cmd/server/websocket.go`, `/tmp/CoreScope/docs/deployment.md`
- **Checked:** 2026-05-13

### ITEM-pitfalls-9: Data compatibility assumptions produce an empty or misleading map

- **What goes wrong:** The replacement is deployed but shows no Denver nodes, stale Bay Area defaults, or only packet analytics without the expected current map markers.
- **Root cause:** The Denver map currently consumes normalized node snapshots from `MESHCORE_LIVE_MAP_API_URL` (defaulting to the Colorado analyzer `/api/nodes`). CoreScope expects to ingest MeshCore packets from MQTT topics such as `meshcore/+/+/packets`, stores SQLite state, and exposes its own `/api/nodes` contract. Node fields are similar but not identical.
- **Prevention:** Decide explicitly whether CoreScope will ingest Denver MQTT directly or be adapted to the existing Colorado analyzer feed. Configure MQTT sources, topics, region/default center, and geofilter for Colorado before routing users. Verify with CoreScope `/api/stats`, `/api/nodes?limit=...`, and visible marker counts.
- **Severity:** CRITICAL
- **Phase relevance:** Data integration and acceptance testing
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/store.ts`, `/tmp/CoreScope/config.example.json`, `/tmp/CoreScope/docs/api-spec.md`
- **Checked:** 2026-05-13

### ITEM-pitfalls-10: Region/geofilter defaults leak Bay Area assumptions into Denver

- **What goes wrong:** Jump buttons, map center, filters, or geo filtering default to SJC/SFO/OAK/MRY and Bay Area coordinates, confusing Denver users or dropping/flagging Colorado packets as foreign.
- **Root cause:** CoreScope’s example config and README are Bay Area/SJC-oriented. Its `defaultRegion`, `regions`, `mapDefaults`, `observerIATAWhitelist`, `iataFilter`, and optional `geo_filter` all influence ingestion and UI.
- **Prevention:** Create a Denver-specific `/app/data/config.json` with Colorado map center/zoom, Denver/Colorado region labels, correct MQTT IATA filters (or none if not used), and reviewed geo-filter behavior. Include a test fixture or live smoke check proving Colorado nodes survive ingestion.
- **Severity:** MODERATE
- **Phase relevance:** Configuration and UX acceptance
- **Confidence:** HIGH
- **Source:** Local code — `/tmp/CoreScope/config.example.json`, `/tmp/CoreScope/cmd/server/config.go`, `/tmp/CoreScope/public/map.js`
- **Checked:** 2026-05-13

### ITEM-pitfalls-11: Public analyzer exposes more sensitive data than the current live map

- **What goes wrong:** Replacing the map unintentionally publishes packet feeds, channel messages, observer health, route traces, node analytics, exact coordinates, and possibly decrypted group chat beyond what users expected from the existing marker map.
- **Root cause:** CoreScope is a full packet/network analyzer with channels, packet feed, observers, traces, live route visualization, and channel decryption features. The current `/map` page primarily warns about exact marker coordinates, not full packet analytics exposure.
- **Prevention:** Make a product/security decision before launch: either expose the full analyzer intentionally, limit routing/navigation to map-only surfaces, or deploy CoreScope behind access controls. Configure `nodeBlacklist`, `observerBlacklist`, channel keys, and write/admin API keys carefully; update privacy copy and operator consent language.
- **Severity:** CRITICAL
- **Phase relevance:** Scope, security review, launch readiness
- **Confidence:** HIGH
- **Source:** CoreScope README and local config — `/tmp/CoreScope/README.md`, `/tmp/CoreScope/config.example.json`, `/tmp/CoreScope/docs/api-spec.md`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`
- **Checked:** 2026-05-13

### ITEM-pitfalls-12: Write/admin endpoints are accidentally exposed

- **What goes wrong:** Public users can post packets, hit debug/admin endpoints, or infer operational internals; alternatively, legitimate ingestion fails because the API key is left as the weak example value and is rejected/unsafe.
- **Root cause:** CoreScope has public read endpoints plus API-key-protected write/admin routes such as `POST /api/packets`, `/api/perf/reset`, `/api/admin/prune`, `/api/debug/affinity`, and `/api/backup`. Its config rejects weak default keys, but proxy routing can still expose endpoints broadly.
- **Prevention:** Set a strong API key if any write/admin route is needed, keep it server-side only, and consider reverse-proxy rules that deny public access to admin/debug/write endpoints. Avoid enabling broad CORS; default CoreScope CORS is same-origin unless configured.
- **Severity:** CRITICAL
- **Phase relevance:** Security review and deployment
- **Confidence:** HIGH
- **Source:** Local code — `/tmp/CoreScope/cmd/server/routes.go`, `/tmp/CoreScope/cmd/server/config.go`, `/tmp/CoreScope/cmd/server/cors.go`
- **Checked:** 2026-05-13

### ITEM-pitfalls-13: Collapsing CoreScope into the existing Next Docker image bloats or breaks deployment

- **What goes wrong:** The existing `node:24-alpine` Next standalone Dockerfile is modified to build Go, run Mosquitto, Caddy, SQLite, and Next in one container, causing image bloat, process supervision issues, or missing persistent state.
- **Root cause:** Denver’s current Dockerfile is a single Next.js standalone runtime. CoreScope’s image is a multi-stage Go build with an Alpine runtime that includes Mosquitto, Caddy, supervisor, SQLite persistence under `/app/data`, and exposed ports 80/443/1883.
- **Prevention:** Run CoreScope as a separate service/container and route to it from the edge/reverse proxy. Preserve a persistent volume for `/app/data`; do not make SQLite ephemeral inside the web image.
- **Severity:** CRITICAL
- **Phase relevance:** Deployment architecture
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`, `/tmp/CoreScope/Dockerfile`, `/tmp/CoreScope/docs/deployment.md`
- **Checked:** 2026-05-13

### ITEM-pitfalls-14: Health check only verifies HTTP, not readiness or data freshness

- **What goes wrong:** Deploy marks CoreScope healthy while the in-memory packet store is still warming, MQTT is disconnected, or the DB is empty/locked; users see stale or empty map data.
- **Root cause:** CoreScope has `/api/healthz` gated on background initialization and `/api/stats` for counts; its deployment docs mention health checks, but a shallow HTTP 200 check can miss ingestion and data freshness problems. SQLite can also lock or grow with retention settings.
- **Prevention:** Use `/api/healthz` for readiness, `/api/stats` for runtime counts, and an operator smoke test that checks recent packets/nodes for the Colorado source. Configure retention, memory limits, DB backups, and single-writer deployment.
- **Severity:** MODERATE
- **Phase relevance:** Observability and operations
- **Confidence:** HIGH
- **Source:** Local code and docs — `/tmp/CoreScope/cmd/server/healthz.go`, `/tmp/CoreScope/docs/deployment.md`, `/tmp/CoreScope/config.example.json`
- **Checked:** 2026-05-13

### ITEM-pitfalls-15: Map tile provider policy and attribution are treated as cosmetic

- **What goes wrong:** The public map violates tile service policy, gets blocked, or ships missing/incorrect attribution after replacing Denver’s existing tile config with CoreScope defaults.
- **Root cause:** Denver currently normalizes tile URL/attribution via runtime env. CoreScope defaults to CARTO basemaps and OSM attribution strings; OSM tile policy requires visible attribution, valid Referer/User-Agent behavior, caching, and prohibits bulk/pre-seeded/offline tile downloading.
- **Prevention:** Keep tile provider configuration explicit in CoreScope config, preserve attribution in the map UI, avoid tile proxying unless headers/caching identify the app correctly, and use a commercial/self-hosted provider if expected traffic exceeds public tile norms.
- **Severity:** MODERATE
- **Phase relevance:** Deployment, UX, compliance
- **Confidence:** HIGH
- **Source:** Official docs and local code — https://operations.osmfoundation.org/policies/tiles/; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/config.ts`; `/tmp/CoreScope/public/roles.js`
- **Checked:** 2026-05-13

### ITEM-pitfalls-16: SSR/browser-only map code is reintroduced during any partial port

- **What goes wrong:** A partial “native Next” port of CoreScope’s map code fails with `window is not defined`, Leaflet DOM access errors, hydration mismatch, or broken marker assets.
- **Root cause:** Leaflet and React Leaflet are browser/DOM-dependent. The current Denver map avoids SSR problems by using a client wrapper and dynamic import; CoreScope is plain browser JavaScript loaded by an HTML page.
- **Prevention:** If any native Next integration remains, keep map code behind a Client Component with `next/dynamic(..., { ssr: false })` inside a client file, or avoid porting and proxy the CoreScope SPA. Do not import Leaflet/CoreScope browser modules from Server Components.
- **Severity:** MODERATE
- **Phase relevance:** Frontend implementation
- **Confidence:** HIGH
- **Source:** Official docs and local code — https://nextjs.org/docs/app/guides/lazy-loading; https://react-leaflet.js.org/docs/start-introduction/; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMapWrapper.tsx`
- **Checked:** 2026-05-13

### ITEM-pitfalls-17: Existing `/map` SEO, metadata, and compatibility links disappear without redirects/attribution updates

- **What goes wrong:** External links to `/map`, metadata, JSON-LD license attribution, sitemap coverage, and current copy all become stale or inconsistent after swapping in CoreScope.
- **Root cause:** The current `/map` page is a Next route with metadata, schema, breadcrumbs, source attribution for the old GPL live-map upstream, and explanatory operator content. A reverse-proxied CoreScope SPA will bypass most of that page shell.
- **Prevention:** Preserve `/map` as the canonical URL but update metadata/sitemap/attribution at the edge or via a lightweight landing wrapper if needed. Replace old `meshcore-mqtt-live-map` attribution with CoreScope provenance and provide source links to this repository plus the submodule commit.
- **Severity:** MINOR
- **Phase relevance:** Launch polish and compliance
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/sitemap.ts`
- **Checked:** 2026-05-13

### ITEM-pitfalls-18: Case-insensitive filesystem collisions in the CoreScope submodule are missed

- **What goes wrong:** macOS developers see warnings or missing docs because CoreScope currently contains case-colliding paths (`docs/DEPLOYMENT.md` and `docs/deployment.md`), which can lead to confusing diffs or incomplete local inspection on case-insensitive filesystems.
- **Root cause:** Git can track case-distinct filenames, but default macOS filesystems cannot materialize both in the working tree. The local clone produced a collision warning.
- **Prevention:** Avoid editing CoreScope docs from this repository and perform release verification in Linux CI. If docs must be referenced, use GitHub/raw URLs rather than relying on both files existing locally on macOS.
- **Severity:** MINOR
- **Phase relevance:** Developer workflow and review
- **Confidence:** HIGH
- **Source:** Local clone observation — `git clone https://github.com/Kpa-clawbot/CoreScope.git /tmp/CoreScope` warning on 2026-05-13
- **Checked:** 2026-05-13

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-pitfalls-1 | HIGH | Local code | `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx`; `/tmp/CoreScope/README.md`; `/tmp/CoreScope/public/index.html` |
| ITEM-pitfalls-2 | HIGH | Official docs | https://git-scm.com/book/en/v2/Git-Tools-Submodules; https://docs.netlify.com/build/git-workflows/repo-permissions-linking/ |
| ITEM-pitfalls-3 | HIGH | WebFetch | https://github.com/Kpa-clawbot/CoreScope/releases |
| ITEM-pitfalls-4 | HIGH | WebFetch | https://github.com/Kpa-clawbot/CoreScope; https://raw.githubusercontent.com/Kpa-clawbot/CoreScope/master/LICENSE; https://raw.githubusercontent.com/Kpa-clawbot/CoreScope/master/package.json |
| ITEM-pitfalls-5 | HIGH | Local code | `/tmp/CoreScope/public/index.html`; `/tmp/CoreScope/public/app.js`; `/tmp/CoreScope/cmd/server/routes.go` |
| ITEM-pitfalls-6 | HIGH | Local code | `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/netlify.toml` |
| ITEM-pitfalls-7 | HIGH | Official docs + local code | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy; https://leafletjs.com/download.html; `/tmp/CoreScope/public/index.html` |
| ITEM-pitfalls-8 | HIGH | Local code + docs | `/tmp/CoreScope/public/app.js`; `/tmp/CoreScope/cmd/server/websocket.go`; `/tmp/CoreScope/docs/deployment.md` |
| ITEM-pitfalls-9 | HIGH | Local code | `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/store.ts`; `/tmp/CoreScope/docs/api-spec.md` |
| ITEM-pitfalls-10 | HIGH | Local code | `/tmp/CoreScope/config.example.json`; `/tmp/CoreScope/cmd/server/config.go`; `/tmp/CoreScope/public/map.js` |
| ITEM-pitfalls-11 | HIGH | Local code + README | `/tmp/CoreScope/README.md`; `/tmp/CoreScope/config.example.json`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx` |
| ITEM-pitfalls-12 | HIGH | Local code | `/tmp/CoreScope/cmd/server/routes.go`; `/tmp/CoreScope/cmd/server/config.go`; `/tmp/CoreScope/cmd/server/cors.go` |
| ITEM-pitfalls-13 | HIGH | Local code + docs | `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`; `/tmp/CoreScope/Dockerfile`; `/tmp/CoreScope/docs/deployment.md` |
| ITEM-pitfalls-14 | HIGH | Local code + docs | `/tmp/CoreScope/cmd/server/healthz.go`; `/tmp/CoreScope/docs/deployment.md`; `/tmp/CoreScope/config.example.json` |
| ITEM-pitfalls-15 | HIGH | Official docs + local code | https://operations.osmfoundation.org/policies/tiles/; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/config.ts`; `/tmp/CoreScope/public/roles.js` |
| ITEM-pitfalls-16 | HIGH | Official docs + local code | https://nextjs.org/docs/app/guides/lazy-loading; https://react-leaflet.js.org/docs/start-introduction/; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMapWrapper.tsx` |
| ITEM-pitfalls-17 | HIGH | Local code | `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/sitemap.ts` |
| ITEM-pitfalls-18 | HIGH | Local clone observation | `/tmp/CoreScope` clone warning |
