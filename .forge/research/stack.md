# Stack Research: Replace Denver MeshCore Live Map with CoreScope

Project date checked: 2026-05-13

## Findings

### ITEM-stack-1: Keep the existing Denver site on Next.js 16, React 19, TypeScript, Node 24, npm, and Docker

- **Recommendation:** Do not re-platform the Denver MeshCore site. Keep the current Next.js App Router application on Node.js 24, React 19, TypeScript, Tailwind CSS 4, npm, Vitest, Playwright, and the existing Docker standalone runtime; limit the live-map replacement to routing, deployment, configuration, and cleanup work around `/map`.
- **Rationale:** The local repository is already a modern Next.js 16/React 19 app with `output: 'standalone'`, Docker-first deployment, npm lockfile, Vitest, Playwright, and a Node `>=24 <26` engine. Official Next.js 16 docs require Node.js 20.9+ and TypeScript 5.1+, so Node 24 satisfies the framework requirement. Re-platforming would add unnecessary migration risk and distract from the goal: making CoreScope the canonical map/analyzer experience.
- **Confidence:** HIGH
- **Source:** Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`, `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`, `/Users/cjvana/Documents/GitHub/denvermc-org/README.md`; Official docs — https://nextjs.org/docs/app/guides/upgrading/version-16
- **Checked:** 2026-05-13
- **Alternatives rejected:** Rebuilding the site in Go/vanilla JS to match CoreScope is unnecessary; downgrading to older Node/Next versions would fight the current repo and official Next.js support baseline; replacing all map code with new hand-coded React UI is explicitly outside this session's constraints.

### ITEM-stack-2: Treat CoreScope as a separate analyzer application, not a React component library

- **Recommendation:** Run CoreScope as its own service and route users to it as the replacement map/analyzer experience; do not attempt to import CoreScope's frontend files into the Next.js bundle.
- **Rationale:** CoreScope is not packaged as a React library. Its stack is a Go HTTP server, Go MQTT ingestor, SQLite persistence, in-memory indexed packet store, REST API, WebSocket broadcast, and a vanilla JavaScript SPA in `public/`. The existing Denver map is a React Leaflet client component fed by Next API routes; direct replacement by code import would require a large port of CoreScope's routing, APIs, WebSocket lifecycle, CSS, Leaflet plugins, Chart.js usage, and global scripts. A service boundary preserves CoreScope's intended runtime and update path.
- **Confidence:** HIGH
- **Source:** GitHub/WebFetch — https://github.com/Kpa-clawbot/CoreScope; GitHub API — `Kpa-clawbot/CoreScope` `README.md`, `Dockerfile`, `cmd/server/go.mod`, `cmd/ingestor/go.mod`, `public/index.html`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Porting CoreScope into `src/components/NetworkMap.tsx` would discard most upstream value and make future CoreScope updates hard; iframe embedding should be avoided because the current site sends `X-Frame-Options: DENY` and because iframe integration complicates routing, accessibility, auth, CSP, and mobile layout.

### ITEM-stack-3: Add CoreScope as a pinned git submodule under `vendor/corescope`, but deploy a pinned container image unless a source build is required

- **Recommendation:** Add `https://github.com/Kpa-clawbot/CoreScope` as `vendor/corescope` and pin it to the reviewed release commit for v3.7.2 or a newer reviewed release. Use the submodule for source availability, review, config templates, and optional source builds; for production deployment, prefer a pinned GHCR image reference such as `ghcr.io/kpa-clawbot/corescope:v3.7.2` and ideally pin by digest after verification.
- **Rationale:** Git submodules let the Denver repository record the exact upstream CoreScope commit without copying the project or losing upstream history. CoreScope's own docs recommend pre-built GHCR images for most production deployments. A container-image deployment avoids introducing a Go toolchain into the Next.js build and matches CoreScope's supported path. However, the submodule is still valuable for reproducibility, GPL source availability, code review, and future source-build fallback.
- **Confidence:** HIGH
- **Source:** Official docs — https://git-scm.com/docs/gitsubmodules; GitHub API/WebSearch — https://github.com/Kpa-clawbot/CoreScope/releases/tag/v3.7.2, https://github.com/Kpa-clawbot/CoreScope/pkgs/container/corescope, https://github.com/Kpa-clawbot/CoreScope
- **Checked:** 2026-05-13
- **Alternatives rejected:** Vendoring a tarball loses upstream history and update ergonomics; using `latest` without a pinned digest makes deployments non-reproducible; using remote Compose files directly in CI/deploy bypasses local review; copying CoreScope files into `src/` would create a permanent fork.

### ITEM-stack-4: Use CoreScope's SQLite data layer as the canonical live-map storage, isolated from the Next.js site

- **Recommendation:** Let CoreScope own packet ingestion, decoding, retention, node state, analytics, and SQLite persistence in `/app/data/meshcore.db`; mount a persistent bind volume or named volume for `/app/data`; keep the Denver Next.js app stateless for this feature except for redirects/proxy settings and documentation.
- **Rationale:** CoreScope is designed around SQLite persistence plus an in-memory packet store with indexes for low-latency API reads. The current Denver site has no database; it fetches an analyzer node API or an optional sidecar and normalizes map snapshots in memory. Reusing the old map store would block CoreScope features such as packet replay, node analytics, channel decode, observer analytics, route tracing, and WebSocket live updates.
- **Confidence:** HIGH
- **Source:** GitHub/WebFetch — https://github.com/Kpa-clawbot/CoreScope, https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md; Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/map/config.ts`, `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/live-map/client.ts`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Adding Postgres/Supabase is unnecessary for the initial replacement and unsupported by CoreScope; forcing CoreScope to consume only the current `/api/map/nodes` snapshot would reduce it to a static node map and lose its analyzer value; sharing SQLite between multiple CoreScope instances should be avoided because SQLite is single-writer oriented.

### ITEM-stack-5: Put a real reverse proxy in front of CoreScope for `/map` or a dedicated analyzer subdomain, with WebSocket support

- **Recommendation:** Use Docker deployment routing to make CoreScope the canonical `/map` experience, preferably through an external reverse proxy or site-level Caddy/nginx/Traefik route that forwards HTTP and WebSocket upgrade traffic to the CoreScope service. If using a dedicated hostname is operationally easier, make `/map` issue a permanent or temporary redirect to that hostname and update navigation/canonical metadata accordingly.
- **Rationale:** CoreScope serves a full SPA plus REST and WebSocket endpoints. Reverse proxying is the clean boundary for that stack. CoreScope's own container includes Caddy, but Denver already has a Next.js web container and security headers; running a single deployment-level proxy avoids nested proxy confusion. CoreScope docs specifically call out WebSocket upgrade headers when behind an external proxy.
- **Confidence:** MEDIUM
- **Source:** GitHub/WebFetch — https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md; Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/netlify.toml`, `/Users/cjvana/Documents/GitHub/denvermc-org/compose.yaml`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Next.js-only rewrites are risky for a full analyzer app with WebSockets and many root-relative assets; iframe embedding is not the right canonical replacement; leaving the old React Leaflet map at `/map` and linking to CoreScope elsewhere fails the project goal.

### ITEM-stack-6: Feed CoreScope raw MeshCore MQTT packets, not just normalized node snapshots

- **Recommendation:** Configure CoreScope `mqttSources` for the Colorado MeshCore packet feed, with server-side credentials, appropriate topics, `defaultRegion`/`regions`, optional IATA filters, and optional `geo_filter`. Disable CoreScope's internal Mosquitto only if Colorado already supplies an external broker; otherwise expose or bridge MQTT deliberately.
- **Rationale:** CoreScope's value comes from ingesting raw MeshCore packets, decoding them, storing observations, and broadcasting packet events. The current Denver site defaults to `https://analyzer.meshcore.coloradomesh.org/api/nodes`, which is enough for markers but not enough for CoreScope's packet feed, live VCR replay, channel chat, observer status, route analytics, and node analytics.
- **Confidence:** HIGH
- **Source:** GitHub API/WebFetch — https://github.com/Kpa-clawbot/CoreScope/blob/master/config.example.json, https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md; Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/.env.example`, `/Users/cjvana/Documents/GitHub/denvermc-org/compose.live-map.yaml`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Continuing to operate the current `yellowcooln/meshcore-mqtt-live-map` sidecar as the canonical backend duplicates CoreScope; browser-side MQTT is inappropriate for credentials and reliability; using sample/demo data in production should remain disabled.

### ITEM-stack-7: Use CoreScope's configuration/theme hooks for branding; do not add new map UI libraries to Denver

- **Recommendation:** For visual integration, configure CoreScope through `/app/data/config.json`, `/app/data/theme.json`, its branding fields, and its built-in theme customizer/export flow. Keep Denver's Tailwind/React map components only as removable legacy code or temporary fallback until routing is switched.
- **Rationale:** CoreScope already ships Leaflet 1.9.4, marker clustering, Leaflet heat, Chart.js, and a substantial vanilla JS UI. Adding React Leaflet, Mapbox, Deck.gl, or a new design-system layer in Denver would not affect CoreScope unless its upstream frontend is forked. The project constraint also says frontend UI/design implementation should be delegated to `co-ui`/native Opus UI rather than hand-coded here.
- **Confidence:** HIGH
- **Source:** GitHub API — `Kpa-clawbot/CoreScope` `public/index.html`, `config.example.json`; Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx`, `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Adding Mapbox GL/MapLibre/deck.gl now would be unused by CoreScope; rebuilding CoreScope in React would create a fork; keeping two separate public map UIs would confuse operators.

### ITEM-stack-8: Verification stack should cover both the existing site and CoreScope as a service

- **Recommendation:** Keep the Denver verification gates `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, and Playwright smoke/a11y tests. Add deployment verification that starts CoreScope, checks `/api/stats`, `/api/health` or `/api/spec`, verifies the `/map` route reaches CoreScope, and verifies WebSocket connectivity through the chosen proxy.
- **Rationale:** The local repo already has lint, TypeScript, Vitest, Playwright, Lighthouse CI, and Docker smoke patterns. CoreScope has its own Go, Node, and Playwright tests upstream, but the Denver integration risk is mostly routing, headers, container health, data volume, MQTT configuration, and WebSocket proxying. Service-level smoke tests catch those risks without importing CoreScope's entire upstream test suite into Denver's npm workflow.
- **Confidence:** HIGH
- **Source:** Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`, `/Users/cjvana/Documents/GitHub/denvermc-org/playwright.config.ts`, `/Users/cjvana/Documents/GitHub/denvermc-org/vitest.config.ts`; GitHub/WebFetch — https://github.com/Kpa-clawbot/CoreScope, https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md
- **Checked:** 2026-05-13
- **Alternatives rejected:** Relying only on `next build` will not prove CoreScope works; importing CoreScope's full test matrix into Denver CI may be slow and brittle; skipping WebSocket verification would miss the most likely proxy integration failure.

### ITEM-stack-9: Treat CoreScope as GPL-3.0 for stack and deployment decisions

- **Recommendation:** Treat CoreScope as GPL-3.0-licensed unless upstream resolves the README/license inconsistency; keep source availability prominent and make the submodule/update workflow part of compliance. Update Denver's map attribution from the old `yellowcooln/meshcore-mqtt-live-map` lineage to CoreScope once replacement is complete.
- **Rationale:** GitHub repository metadata and the `LICENSE` file identify CoreScope as GPL-3.0, while the README currently says MIT. The license file is the safer authority for compliance planning. The existing Denver map page already displays GPL source attribution for its current upstream-derived map, so compliance-aware attribution is already part of the stack.
- **Confidence:** HIGH
- **Source:** GitHub API/WebFetch — https://github.com/Kpa-clawbot/CoreScope, https://github.com/Kpa-clawbot/CoreScope/blob/master/LICENSE; Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Assuming MIT because of the README is unsafe; hiding CoreScope source or failing to publish the exact vendored revision creates avoidable compliance risk; removing attribution entirely would regress the current practice.

### ITEM-stack-10: Docker production is the canonical deployment target; Netlify previews can only provide a fallback or redirect

- **Recommendation:** Implement the production replacement in the Docker/Compose deployment path. For Netlify previews, either redirect `/map` to a deployed CoreScope instance or show a clear fallback page explaining that the live analyzer requires the Docker runtime.
- **Rationale:** CoreScope is a long-running server/ingestor with SQLite, MQTT, WebSockets, and persistent volumes. That does not fit static/secondary Netlify previews. The Denver repo already says Docker is the primary runtime and Netlify is a secondary preview path, so the stack decision should reflect that hierarchy.
- **Confidence:** HIGH
- **Source:** Local repo — `/Users/cjvana/Documents/GitHub/denvermc-org/README.md`, `/Users/cjvana/Documents/GitHub/denvermc-org/netlify.toml`, `/Users/cjvana/Documents/GitHub/denvermc-org/compose.yaml`; GitHub/WebFetch — https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md
- **Checked:** 2026-05-13
- **Alternatives rejected:** Trying to run CoreScope on Netlify functions is a poor fit for persistent MQTT/WebSocket/SQLite workloads; keeping a separate React map only for previews increases divergence; blocking the production replacement on preview parity is unnecessary.

### ITEM-stack-11: Be cautious with CoreScope source builds because upstream currently builds with Go 1.22

- **Recommendation:** Prefer the reviewed GHCR release image initially. If Denver must build CoreScope from the submodule, first verify or patch the build to a supported Go release line in a fork or upstream PR, then run CoreScope's Go tests and integration smoke tests.
- **Rationale:** CoreScope's current Dockerfile uses `golang:1.22-alpine`. Official Go policy supports each major release only until two newer major releases exist; Go 1.22 became unsupported when Go 1.24 shipped. That does not block using CoreScope as a product, but it is a stack risk if Denver starts owning source builds.
- **Confidence:** MEDIUM
- **Source:** Official docs — https://go.dev/doc/devel/release#policy; GitHub API — `Kpa-clawbot/CoreScope` `Dockerfile`, `Dockerfile.go`, `cmd/server/go.mod`, `cmd/ingestor/go.mod`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Blindly building the submodule in Denver CI would silently adopt an unsupported Go toolchain; rewriting CoreScope in Node to avoid Go is unjustified; ignoring the issue is acceptable only if Denver treats CoreScope as an externally supplied image and monitors upstream updates.

### ITEM-stack-12: Harden Compose/image supply-chain handling for a vendored analyzer service

- **Recommendation:** Review CoreScope Compose and Docker configuration as code, run `docker compose config` in verification, avoid unreviewed remote Compose includes, pin images by immutable digest for production, and treat submodule updates as dependency-update PRs with smoke tests.
- **Rationale:** Docker Compose files can mount host paths, expose ports, run privileged containers, and consume secrets. CoreScope's deployment model includes bind mounts for data, optional Caddy config, optional MQTT exposure, and a public container image. That is normal for this stack but should be reviewed like executable deployment code, especially when pulled through a submodule.
- **Confidence:** HIGH
- **Source:** Official docs — https://docs.docker.com/compose/trust-model/, https://docs.docker.com/compose/; GitHub API — `Kpa-clawbot/CoreScope` `docker-compose.example.yml`, `docker-compose.yml`, `Dockerfile`
- **Checked:** 2026-05-13
- **Alternatives rejected:** Running upstream Compose files directly from GitHub is less reviewable; mutable `latest` images are not reproducible; mounting broad host directories or Docker sockets is unnecessary for this integration.

## Current Version Snapshot

| Component | Local/current finding | Recommendation |
|-----------|-----------------------|----------------|
| Denver app runtime | Node `>=24 <26`, Next `^16.2.5`, React `19.2.3`, TypeScript `^5` | Keep; update lockfile only if normal dependency verification passes. |
| Current npm registry checks | Next `16.2.6`, React/React DOM `19.2.6`, Leaflet `1.9.4`, react-leaflet `5.0.0`, mqtt `5.15.1`, TypeScript `6.0.3`, Vitest `4.1.6`, Playwright `1.60.0` | Do not couple CoreScope work to broad dependency upgrades unless tests require it. |
| CoreScope release | v3.7.2, published 2026-05-06, latest visible release at time checked | Pin v3.7.2 or a newer reviewed release; avoid `latest` in production. |
| CoreScope runtime | Go server + Go ingestor + SQLite + vanilla JS SPA + Leaflet/Chart.js + WebSocket + Docker | Run as sidecar/app service. |
| Deployment | Denver Docker primary; Netlify secondary previews | Make Docker canonical for CoreScope; preview fallback/redirect only. |

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-stack-1 | HIGH | Local repo + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; https://nextjs.org/docs/app/guides/upgrading/version-16 |
| ITEM-stack-2 | HIGH | GitHub/WebFetch + GitHub API | https://github.com/Kpa-clawbot/CoreScope |
| ITEM-stack-3 | HIGH | Official docs + GitHub API/WebSearch | https://git-scm.com/docs/gitsubmodules; https://github.com/Kpa-clawbot/CoreScope/releases/tag/v3.7.2 |
| ITEM-stack-4 | HIGH | GitHub/WebFetch + Local repo | https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/live-map/client.ts` |
| ITEM-stack-5 | MEDIUM | GitHub/WebFetch + Local repo | https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js` |
| ITEM-stack-6 | HIGH | GitHub API/WebFetch + Local repo | https://github.com/Kpa-clawbot/CoreScope/blob/master/config.example.json; `/Users/cjvana/Documents/GitHub/denvermc-org/.env.example` |
| ITEM-stack-7 | HIGH | GitHub API + Local repo | `Kpa-clawbot/CoreScope public/index.html`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NetworkMap.tsx` |
| ITEM-stack-8 | HIGH | Local repo + GitHub/WebFetch | `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md |
| ITEM-stack-9 | HIGH | GitHub API/WebFetch + Local repo | https://github.com/Kpa-clawbot/CoreScope/blob/master/LICENSE; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx` |
| ITEM-stack-10 | HIGH | Local repo + GitHub/WebFetch | `/Users/cjvana/Documents/GitHub/denvermc-org/netlify.toml`; https://github.com/Kpa-clawbot/CoreScope/blob/master/docs/deployment.md |
| ITEM-stack-11 | MEDIUM | Official docs + GitHub API | https://go.dev/doc/devel/release#policy; `Kpa-clawbot/CoreScope Dockerfile` |
| ITEM-stack-12 | HIGH | Official docs + GitHub API | https://docs.docker.com/compose/trust-model/; `Kpa-clawbot/CoreScope docker-compose.example.yml` |
