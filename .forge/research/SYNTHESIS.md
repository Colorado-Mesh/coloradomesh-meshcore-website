# Research Synthesis

## Status
- Files synthesized: stack.md, pitfalls.md, architecture.md, prior-art.md, codex-analysis.md, PROJECT.md
- Files missing: none
- Overall confidence: HIGH

## Executive Summary
This is a brownfield replacement of the Denver MeshCore site's current Next.js/React Leaflet `/map` experience with CoreScope, a standalone MeshCore analyzer application. The proven implementation path is not to port CoreScope into React, but to vendor it as a pinned git submodule for provenance/review and run it as a separate CoreScope service/container that owns MQTT ingestion, SQLite persistence, REST APIs, WebSockets, and its vanilla JavaScript analyzer UI.

The recommended technical approach is to keep the existing Denver site stack unchanged: Next.js 16, React 19, TypeScript, Node 24, npm, Docker, Vitest, and Playwright. Add CoreScope under `vendor/corescope` or `vendor/CoreScope`, pin the reviewed upstream release commit, deploy a pinned CoreScope GHCR image by tag and preferably digest unless a source build is explicitly required, mount durable `/app/data`, provide a Denver-specific CoreScope config, and route users from `/map` to CoreScope. The strongest routing recommendation is a dedicated CoreScope host/subdomain because CoreScope assumes ownership of root-relative `/api/*`, static assets, and `/ws`; if the product insists on same-origin `/map`, a real reverse proxy must handle assets, REST, WebSocket upgrades, and route collisions deliberately.

Top risks are routing CoreScope under `/map` while its root-relative assets and APIs collide with the Next app, losing WebSocket upgrades through the proxy, publishing more packet/channel/operator data than the current marker map exposes, ignoring the CoreScope license mismatch, and leaving submodule/image versions floating. Prior art strongly supports using CoreScope itself as the canonical runtime, while reusing only operational lessons from Denver's current live map and community MQTT bridge tooling. Adjacent tools such as yellowcooln/meshcore-mqtt-live-map, official MeshCore Map, MeshExplorer, meshcoretomqtt, and triangulation utilities are useful references or feeders, not replacements for CoreScope in this project.

## Key Decisions (resolved by research)
- Keep the Denver site on its current Next.js 16, React 19, TypeScript, Node 24, npm, Docker, Vitest, and Playwright stack; do not re-platform for this work. Source refs: ITEM-stack-1.
- Treat CoreScope as a standalone sidecar analyzer service, not a React component library and not code copied into `src/components/NetworkMap.tsx`. Source refs: ITEM-stack-2, ITEM-architecture-1, ITEM-pitfalls-1, ITEM-prior-art-1.
- Add CoreScope as a pinned git submodule under `vendor/corescope` or `vendor/CoreScope`; do not vendor a tarball or track a moving branch. Source refs: ITEM-stack-3, ITEM-architecture-8, ITEM-pitfalls-2, ITEM-prior-art-6.
- Prefer a pinned CoreScope GHCR release image, ideally digest-pinned, for production deployment unless source-build requirements are explicit. Source refs: ITEM-stack-3, ITEM-stack-11, ITEM-pitfalls-3.
- Let CoreScope own live-map/analyzer data storage and APIs through MQTT ingestion, SQLite, REST, and WebSockets; retire the current Next map data path from the canonical UI. Source refs: ITEM-stack-4, ITEM-stack-6, ITEM-architecture-6, ITEM-pitfalls-9.
- Docker/Compose is the canonical production runtime for CoreScope; Netlify previews should redirect or show a fallback rather than trying to run CoreScope. Source refs: ITEM-stack-10, ITEM-architecture-4.
- Do not use iframe embedding as the primary integration path. Source refs: ITEM-stack-2, ITEM-architecture-1, ITEM-pitfalls-6.
- Treat CoreScope as GPL-3.0 until upstream resolves conflicting license metadata. Source refs: ITEM-stack-9, ITEM-pitfalls-4, ITEM-architecture-10, ITEM-prior-art-1.
- Use CoreScope's own configuration/theme hooks for branding and Denver defaults; do not add new map UI libraries to Denver for this replacement. Source refs: ITEM-stack-7, ITEM-architecture-7.
- Verification must cover both the Next site and the CoreScope service: submodule presence, Compose config, CoreScope health/stats/config, route handoff, WebSocket connectivity, and existing npm gates. Source refs: ITEM-stack-8, ITEM-architecture-11, ITEM-pitfalls-8, ITEM-pitfalls-14.

## Questions for User

### Q-1: Should CoreScope be public, member-only, or partially restricted?

- **Category:** scope
- **Why it matters:** CoreScope exposes more than the current marker map, including packets, channels, observer health, route traces, analytics, and possibly exact coordinates or decrypted channel content.
- **Default recommendation:** Launch with public map/analyzer views only after a privacy/security review, deny public admin/write/debug endpoints, and avoid configuring channel keys unless operator consent is explicit.
- **Source refs:** ITEM-pitfalls-11, ITEM-pitfalls-12, ITEM-architecture-7
- **Priority:** HIGH

### Q-2: What should be the canonical public URL: `/map` on the Denver site, a dedicated CoreScope subdomain, or both?

- **Category:** technical
- **Why it matters:** CoreScope assumes origin-root ownership of `/api/*`, static assets, and `/ws`, while the Denver Next app already owns `/map` and several `/api/*` routes.
- **Default recommendation:** Use a dedicated CoreScope host/subdomain and make Denver `/map` a clear redirect or handoff route to CoreScope's `/#/map` or `/#/live` view.
- **Source refs:** ITEM-architecture-2, ITEM-architecture-3, ITEM-stack-5, ITEM-pitfalls-5
- **Priority:** HIGH

### Q-3: Which MQTT broker, topics, credentials, and observer sources should feed CoreScope?

- **Category:** technical
- **Why it matters:** CoreScope's value depends on raw MeshCore packets, not just Denver's existing normalized `/api/nodes` snapshot.
- **Default recommendation:** Configure CoreScope `mqttSources` against the Colorado MeshCore broker/feed with server-side credentials and topics matching `meshcore/+/+/packets`; do not expose broker credentials to the browser.
- **Source refs:** ITEM-stack-6, ITEM-pitfalls-9, ITEM-prior-art-7, ITEM-architecture-7
- **Priority:** HIGH

### Q-4: Should CoreScope run from the pinned GHCR image or be built from the submodule in Denver CI/deployment?

- **Category:** technical
- **Why it matters:** Images are upstream-supported and avoid adding Go/Mosquitto/Caddy build complexity, while source builds increase control but also toolchain and maintenance risk.
- **Default recommendation:** Use the pinned GHCR release image by tag and digest for production, while keeping the submodule for source review, GPL source availability, config reference, and future source-build fallback.
- **Source refs:** ITEM-stack-3, ITEM-stack-11, ITEM-stack-12, ITEM-architecture-4
- **Priority:** HIGH

### Q-5: Which CoreScope release/commit should be pinned for the first launch?

- **Category:** constraints
- **Why it matters:** Floating `latest` or tracking `master` can silently change production behavior; submodule and image pins must match the reviewed version.
- **Default recommendation:** Pin CoreScope v3.7.2 or the newest reviewed release available at implementation time, record the submodule SHA and image digest, and require smoke tests for upgrades.
- **Source refs:** ITEM-stack-3, ITEM-pitfalls-3, ITEM-architecture-8
- **Priority:** HIGH

### Q-6: What Denver/Colorado map defaults and ingestion filters should be configured?

- **Category:** ux
- **Why it matters:** CoreScope examples are Bay Area/SJC-oriented and may default to the wrong center, region names, IATA filters, or geofilter behavior.
- **Default recommendation:** Configure Colorado map center `39.5501,-105.7821`, zoom around `7`, Denver/Colorado branding, reviewed regions, and no restrictive IATA/geofilter until live Colorado packet ingestion is proven.
- **Source refs:** ITEM-architecture-7, ITEM-pitfalls-10, ITEM-stack-7
- **Priority:** HIGH

### Q-7: What tile provider and attribution policy should CoreScope use?

- **Category:** constraints
- **Why it matters:** Tile providers impose usage limits, attribution requirements, API key handling, and policy constraints that can break or block the public map if ignored.
- **Default recommendation:** Start with CoreScope's supported CARTO/OSM-style configuration only if attribution is visible and expected traffic is modest; otherwise use a paid/self-hosted provider configured through CoreScope, not hard-coded in Denver.
- **Source refs:** ITEM-pitfalls-15, ITEM-stack-7, ITEM-codex supplemental lines 143-145
- **Priority:** MEDIUM

### Q-8: How long should packets, nodes, traces, and analytics be retained?

- **Category:** risk
- **Why it matters:** Retention affects SQLite growth, privacy exposure, backup requirements, stale-map behavior, and operational readiness checks.
- **Default recommendation:** Use conservative CoreScope retention initially, back up `/app/data`, show data age, and tune retention only after observing packet volume and operator privacy expectations.
- **Source refs:** ITEM-stack-4, ITEM-pitfalls-14, ITEM-pitfalls-11
- **Priority:** MEDIUM

### Q-9: Which old Denver live-map endpoints or compatibility paths must remain after launch?

- **Category:** scope
- **Why it matters:** Existing users or integrations may depend on `/api/map/*`, `/api/live-map/*`, metadata, sitemap entries, or links to `/map`.
- **Default recommendation:** Preserve `/map` as the stable human-facing entry point, deprecate old data endpoints only after checking consumers, and update sitemap/metadata/attribution rather than keeping the old React Leaflet map public.
- **Source refs:** ITEM-architecture-6, ITEM-pitfalls-17, ITEM-prior-art-3
- **Priority:** MEDIUM

### Q-10: Should Netlify previews link to production CoreScope, show a fallback page, or disable the live analyzer preview entirely?

- **Category:** constraints
- **Why it matters:** CoreScope requires a long-running service, MQTT, SQLite, WebSockets, and persistent volumes that do not fit Netlify's preview model.
- **Default recommendation:** For previews, make `/map` show a clear fallback/handoff to the deployed analyzer host; do not attempt to run CoreScope on Netlify functions.
- **Source refs:** ITEM-stack-10, ITEM-pitfalls-2
- **Priority:** MEDIUM

### Q-11: Are local CoreScope patches acceptable, or must all changes be upstreamed?

- **Category:** prior-art
- **Why it matters:** Local submodule edits complicate updates, GPL/source provenance, and release verification; some fixes such as CSP asset vendoring or path-prefix support may require upstream changes if demanded.
- **Default recommendation:** Avoid local patches for initial launch; configure CoreScope externally and open upstream issues/PRs for reusable changes.
- **Source refs:** ITEM-prior-art-6, ITEM-pitfalls-2, ITEM-pitfalls-18
- **Priority:** MEDIUM

### Q-12: Should CoreScope be allowed to load third-party browser assets from CDNs, or should those assets be vendored?

- **Category:** risk
- **Why it matters:** Denver's current CSP is strict, and CoreScope uses third-party assets such as Leaflet, leaflet-heat, Chart.js, and Swagger UI from CDN paths.
- **Default recommendation:** Prefer vendoring third-party browser assets inside the CoreScope image/submodule for production; if CDN use remains, add narrowly scoped CSP allowances and SRI checks.
- **Source refs:** ITEM-pitfalls-7, ITEM-stack-12
- **Priority:** HIGH

### Q-13: What reverse proxy stack will terminate TLS and route WebSockets to CoreScope?

- **Category:** technical
- **Why it matters:** WebSocket failures are likely if `Upgrade`/`Connection` headers, host/path preservation, HTTP/1.1, and timeouts are not configured correctly.
- **Default recommendation:** Use a deployment-level Caddy/nginx/Traefik route to the CoreScope service with explicit WebSocket support, and run CoreScope with bundled Caddy disabled if the outer proxy owns TLS.
- **Source refs:** ITEM-stack-5, ITEM-architecture-5, ITEM-architecture-9, ITEM-pitfalls-8
- **Priority:** HIGH

### Q-14: What exact data should be redacted, blacklisted, or consent-gated before public launch?

- **Category:** risk
- **Why it matters:** The move from a marker map to a full analyzer may expose exact coordinates, observer IDs, channel messages, traces, and operational internals.
- **Default recommendation:** Define node/observer blacklist policy, avoid public channel keys, review `geo_filter`, and update privacy copy before switching navigation to CoreScope.
- **Source refs:** ITEM-pitfalls-11, ITEM-pitfalls-12, ITEM-architecture-7
- **Priority:** HIGH

### Q-15: Who will own CoreScope operational maintenance after launch?

- **Category:** constraints
- **Why it matters:** CoreScope introduces a stateful service with image/submodule upgrades, SQLite backups, broker credentials, health checks, retention tuning, and incident response.
- **Default recommendation:** Assign an operator role and document a release-update workflow with digest pinning, smoke tests, backups, and rollback steps.
- **Source refs:** ITEM-stack-8, ITEM-stack-12, ITEM-pitfalls-14, ITEM-architecture-11
- **Priority:** MEDIUM

## Technical Direction

### Stack
- Keep the current Denver stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Node `>=24 <26`, npm, Docker standalone output, Vitest, Playwright, Lighthouse/CI smoke patterns. Do not switch to Codex-suggested Node 22, pnpm, Vite, or React assumptions for this repo.
- Add CoreScope as a pinned public HTTPS git submodule under `vendor/corescope` or `vendor/CoreScope`. Use the existing utilities submodule pattern as the model for verification.
- Deploy CoreScope as a separate service/container. Prefer `ghcr.io/kpa-clawbot/corescope:<reviewed-version>@<digest>` for production; use source builds from the submodule only if required and only after reviewing the Go toolchain and upstream build files.
- Use CoreScope's SQLite data layer with durable `/app/data`; the Denver Next app should remain stateless for this feature except for route handoff, metadata, navigation, and documentation.
- Feed CoreScope raw MeshCore MQTT packets via server-side config. Do not use browser MQTT or the old normalized snapshot as the canonical source.
- Use CoreScope configuration/theme files for Denver branding, map defaults, regions, broker settings, retention, blacklists, and tile settings. Do not add new Denver-side map libraries for this replacement.

### Architecture
- Boundary: Denver Next.js owns the site shell, navigation, SEO/metadata, sitemap, redirects/handoff, and general deployment docs. CoreScope owns analyzer UI, live map UI, MQTT ingestion, decode/storage, APIs, WebSocket broadcast, analytics, and SQLite persistence.
- Runtime: Compose should define a separate CoreScope service, durable data volume, Denver-specific config mount, secrets injection for broker/API keys, and health checks. Avoid merging CoreScope into the existing Next Docker image.
- Routing: Prefer host/subdomain routing so CoreScope can own `/`, `/api/*`, `/ws`, and static assets. Make Denver `/map` a redirect or lightweight handoff to CoreScope. If same-origin path routing is required, plan explicit reverse-proxy rules for root-relative assets, API namespace collisions, WebSocket upgrades, and CSP/header differences.
- Proxy: Use a real outer proxy such as Caddy/nginx/Traefik or the existing deployment proxy. Disable CoreScope's bundled Caddy when the outer proxy terminates TLS. Disable bundled Mosquitto only if an external broker/source is configured.
- Migration: Retire `NetworkMapWrapper` and the old Next data path from the public canonical experience after CoreScope launch. Keep compatibility endpoints/status checks only if known consumers require them.

### Prior Art to Leverage
- CoreScope itself is the canonical replacement: use its upstream runtime, API, WebSocket model, Docker image, and OpenAPI spec rather than rebuilding its UI.
- Denver's current live map should provide hardening lessons: SSRF/private address protections, response limits, diagnostics thinking, env-based config, and attribution discipline. Its React Leaflet UI should be retired as the canonical product.
- The existing `vendor/meshcore-utilities-site` submodule and `scripts/check-utilities-submodule.mjs` pattern should be copied for CoreScope with a dedicated checker.
- `meshcoretomqtt` and `meshcore-packet-capture` are the appropriate observer/feed layer; document compatibility rather than building capture into the Denver site.
- `yellowcooln/meshcore-mqtt-live-map` remains useful for migration/endpoint comparison but should not remain the canonical runtime.
- Official MeshCore Map and uploader tooling should remain external ecosystem links or separate operational tasks, not the Denver live analyzer replacement.
- Triangulation tools and MeshExplorer are future/adjacent references only, not first-launch scope.

## Detailed Planning Implications
- Sequence the implementation as infrastructure-first: submodule + checker, configuration template, Compose service, proxy/handoff route, security/privacy hardening, verification gates, then cleanup of old map UI.
- File boundaries should likely include: `.gitmodules`, `vendor/corescope` or `vendor/CoreScope`, `scripts/check-corescope-submodule.mjs`, `package.json` script additions, a CoreScope Compose override such as `compose.corescope.yaml` or changes to existing Compose files, a Denver-specific CoreScope config template under a non-secret config path, `.env.example` additions, `/map` page/handoff changes, navigation/sitemap/metadata updates, and Playwright or smoke-test additions.
- Do not hand-code a visual CoreScope UI in the current session. If the `/map` handoff shell needs new visual design, delegate it to `co-ui`/native Opus UI per project constraints.
- Add a submodule verification contract: path exists, not empty, expected files exist (`Dockerfile`, `config.example.json`, `cmd/server`, `cmd/ingestor`, `public`, `LICENSE`), gitlink resolves, and the SHA is recorded.
- Add deployment verification contracts: `docker compose config` renders, CoreScope starts, `/api/healthz` is ready, `/api/config/map` returns Denver config, `/api/stats` has plausible counts, `/api/spec` is reachable, and `wss://<host>/ws` connects.
- Add browser verification: Denver navigation reaches CoreScope, `/map` handoff works on desktop/mobile, CoreScope `/#/map` and `/#/live` render, map tiles and attribution appear, and live updates work.
- Add security gates: admin/write/debug endpoints are protected or denied at the proxy, strong API keys are server-side only, CORS is not broadened unnecessarily, CSP is compatible with CoreScope assets/WebSockets, and privacy copy is updated.
- Preserve release hygiene: pin image tag and digest, pin submodule SHA, do not use `latest`, require release notes and smoke tests for updates, and avoid local submodule edits unless intentionally upstreamed.
- Treat Netlify as preview-only: implement redirect/fallback behavior rather than trying to run the analyzer there.
- Plan rollback: keep old map code available until CoreScope route, data ingest, and privacy checks are verified; after launch, remove or hide the old UI deliberately.

## Risk Register
- **CRITICAL — Wrong integration model:** Importing or copying CoreScope into the Next React map will break runtime assumptions and create a fork. Mitigation: sidecar service and route handoff only. Source refs: ITEM-pitfalls-1, ITEM-stack-2, ITEM-architecture-1.
- **CRITICAL — Missing submodule in CI/deploy:** Submodule path can be empty unless initialized. Mitigation: public HTTPS submodule, explicit init in CI/build, dedicated checker. Source refs: ITEM-pitfalls-2, ITEM-architecture-8, ITEM-prior-art-6.
- **CRITICAL — Route/API/asset collisions:** CoreScope root-relative assets and `/api/*` calls can hit the Next app instead. Mitigation: dedicated host/subdomain or carefully designed edge proxy, not simple `/map` rewrite. Source refs: ITEM-pitfalls-5, ITEM-architecture-3.
- **CRITICAL — CSP blocks CoreScope:** CDN scripts/styles or WebSockets can be blocked. Mitigation: vendor assets or add narrowly scoped CSP/SRI and WebSocket allowances. Source refs: ITEM-pitfalls-7.
- **CRITICAL — WebSocket upgrade failure:** Live updates may silently fail behind proxy. Mitigation: explicit proxy upgrade headers/timeouts and `wss://.../ws` smoke test. Source refs: ITEM-pitfalls-8, ITEM-stack-5.
- **CRITICAL — Empty/misleading Denver map:** CoreScope may ingest no Colorado packets or wrong data if broker/topics/defaults are misconfigured. Mitigation: configure MQTT sources, map defaults, region/geofilter, and verify `/api/stats` plus marker counts. Source refs: ITEM-pitfalls-9, ITEM-pitfalls-10, ITEM-stack-6.
- **CRITICAL — Overexposure of analyzer data:** Public CoreScope may expose channels, traces, observers, coordinates, or admin surfaces beyond current expectations. Mitigation: product/privacy review, blacklists, no public channel keys, proxy denies for admin/write/debug endpoints. Source refs: ITEM-pitfalls-11, ITEM-pitfalls-12.
- **CRITICAL — License mismatch mishandled:** README/package license conflicts with repository `LICENSE`. Mitigation: treat as GPL-3.0, preserve attribution/source links, ask upstream for clarification if permissive use matters. Source refs: ITEM-pitfalls-4, ITEM-stack-9.
- **CRITICAL — Single-container bloat/state loss:** Combining Next and CoreScope in one image risks process supervision and persistence failures. Mitigation: separate CoreScope service and durable volume. Source refs: ITEM-pitfalls-13, ITEM-architecture-4.
- **MODERATE — Floating release/image:** `latest` or moving branch changes production unexpectedly. Mitigation: pin submodule SHA and image digest; update via PR with smoke tests. Source refs: ITEM-pitfalls-3, ITEM-stack-12.
- **MODERATE — Shallow health checks:** HTTP 200 can hide disconnected MQTT or empty DB. Mitigation: readiness plus stats/freshness smoke checks and backups/retention policy. Source refs: ITEM-pitfalls-14.
- **MODERATE — Tile policy/attribution problems:** Missing attribution or excess public tile usage can violate policies. Mitigation: explicit tile config, visible attribution, paid/self-hosted provider if needed. Source refs: ITEM-pitfalls-15.
- **MINOR — SEO/link/attribution regressions:** Existing `/map` metadata and links can become stale. Mitigation: update metadata, sitemap, navigation, and attribution during launch. Source refs: ITEM-pitfalls-17, ITEM-architecture-10.
- **MINOR — macOS case collision in submodule docs:** CoreScope docs can collide on case-insensitive filesystems. Mitigation: do not edit upstream docs locally; rely on Linux CI/GitHub raw URLs for release verification. Source refs: ITEM-pitfalls-18.

## Conflicts & Tradeoffs
- **Canonical `/map` vs CoreScope origin-root assumptions:** The project wants CoreScope to replace the Denver `/map`, but CoreScope is easiest and safest on a dedicated host because it owns `/api/*`, root static assets, and `/ws`. Tradeoff: a subdomain is operationally clean but less seamless; path-prefix/same-origin routing preserves URL shape but requires complex proxying and testing. Source refs: ITEM-architecture-2, ITEM-architecture-3, ITEM-stack-5, ITEM-pitfalls-5.
- **Submodule source availability vs production image deployment:** User preference and GPL/source review favor a submodule, while production reliability favors a pinned upstream GHCR image. Resolution: do both; submodule for provenance/review/source, image digest for runtime. Source refs: ITEM-stack-3, ITEM-stack-11, ITEM-architecture-4, ITEM-pitfalls-3.
- **Full analyzer replacement vs privacy-minimized live map:** CoreScope's strength is a rich analyzer surface, but the current map is primarily markers plus warnings. User must decide exposure level before launch. Source refs: ITEM-pitfalls-11, ITEM-prior-art-1, ITEM-prior-art-3.
- **Strict Denver security headers vs CoreScope upstream browser dependencies:** Denver CSP and X-Frame-Options are strict; CoreScope may rely on CDN assets and WebSockets. Resolution: avoid iframe, prefer asset vendoring or scoped route/host headers. Source refs: ITEM-pitfalls-6, ITEM-pitfalls-7, ITEM-stack-7.
- **Docker production parity vs Netlify preview expectations:** CoreScope requires persistent server runtime; Netlify previews cannot provide full parity. Resolution: Docker is canonical; previews redirect or fallback. Source refs: ITEM-stack-10, ITEM-pitfalls-2.
- **Supplemental Codex static-artifact suggestion vs Claude research service-boundary conclusion:** Codex suggested building/copying CoreScope static output into the site if appropriate, but primary research shows CoreScope's UI depends on its Go APIs, SQLite, MQTT, and WebSocket server. Resolution: do not copy static files into Next `public/`; run CoreScope as a service. Source refs: codex-analysis.md lines 51-65, ITEM-architecture-4, ITEM-stack-2.
- **Supplemental Codex stack suggestions vs local repo reality:** Codex suggested Node 22, pnpm, Vite, and React if applicable; local research confirms the repo is Node 24/npm/Next 16 and CoreScope is Go/vanilla JS. Resolution: keep local repo stack and CoreScope native stack. Source refs: codex-analysis.md lines 49-55, ITEM-stack-1, ITEM-stack-2.

## Confidence Assessment
| Dimension | Status | Confidence | Notes |
|-----------|--------|------------|-------|
| stack | complete | HIGH | Strong local repo and upstream evidence; only route/proxy details need deployment-specific confirmation. |
| pitfalls | complete | HIGH | Comprehensive critical risks identified across routing, security, data, license, CI, and operations. |
| architecture | complete | HIGH | Clear service-boundary recommendation; host/subdomain routing is strongly supported. |
| prior-art | complete | HIGH | CoreScope is the right canonical target; adjacent tools are useful feeders or references only. |
| codex-analysis | complete | MEDIUM | Supplemental only; useful for broad questions but conflicts with primary evidence on stack/static artifact assumptions. |
