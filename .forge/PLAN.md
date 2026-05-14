# Forge Implementation Plan

## Overview
Replace the existing in-app React Leaflet `/map` with CoreScope served directly from the same Docker container as the current Next.js site. The Docker image will build the Next standalone app and CoreScope Go binaries from a pinned submodule, supervise all required processes in one container, and put a local reverse proxy on port 3000 so normal site routes go to Next while `/map`, CoreScope assets, CoreScope APIs, and WebSocket traffic go to CoreScope. A tracked overlay/patch layer will make `/map` default to a Colorado Mesh live-map experience with minimal/fullscreen polish while preserving access to the full CoreScope analyzer.

## Technical Decisions
- Keep the existing app stack: Next.js 16, React 19, TypeScript, Tailwind 4, Node 24, npm, Docker standalone output, Vitest, Playwright.
- Add CoreScope as `vendor/CoreScope` using a pinned git submodule commit; Dependabot already supports weekly `gitsubmodule` updates.
- Build CoreScope from the submodule inside this repo's Docker build so the final runtime remains one container and does not depend on pulling a second runtime image.
- Use a multi-process single-container runtime with `supervisord` and `nginx`:
  - Next app listens internally on `127.0.0.1:3001`.
  - CoreScope server listens internally on `127.0.0.1:3002`.
  - CoreScope ingestor runs from the same generated config.
  - nginx listens on public `:3000` and routes traffic to the right internal process.
- Generate CoreScope `config.json` at container startup from environment variables so MQTT credentials are never committed.
- Keep current Next `/api/map/*` and `/api/live-map/*` endpoints available for tools and compatibility unless a later cleanup proves they are unused.
- Route CoreScope-owned endpoints (`/map`, CoreScope static assets, `/ws`, `/api/config/*`, `/api/stats`, `/api/nodes*`, `/api/packets*`, `/api/channels*`, `/api/analytics/*`, `/api/audio-lab/*`, `/api/observers*`, `/api/iata-coords`, `/api/traces/*`, `/api/perf*`, `/api/spec`, `/api/docs`, `/api/health*`, `/api/admin/*`, `/api/debug/*`) to CoreScope. This route list is informed by the live analyzer `/perf` page.
- Delegate the visual Colorado Mesh CoreScope overlay/minimal fullscreen mode to `co-ui`/Opus UI.

## Implementation Steps

### Step 1: Add and verify the CoreScope submodule
**Goal:** Vendor CoreScope source in this repo without copying upstream code into application files.
**Why now:** Docker, config, patches, and verification all need a stable submodule path.
**Dependencies:** Existing `.gitmodules`, existing `vendor/meshcore-utilities-site`, existing Dependabot gitsubmodule setup.
**Files:** `.gitmodules`, `vendor/CoreScope`, `scripts/check-corescope-submodule.mjs`, `package.json`.
**Existing code to inspect first:** `.gitmodules`, `.github/dependabot.yml`, `scripts/check-utilities-submodule.mjs`, `package.json` scripts.
**Implementation plan:**
1. Add `https://github.com/Kpa-clawbot/CoreScope` as a git submodule at `vendor/CoreScope`.
2. Create `scripts/check-corescope-submodule.mjs` modeled after the utilities checker.
3. Check that the submodule path exists, is not empty, and contains expected files: `Dockerfile`, `config.example.json`, `cmd/server/go.mod`, `cmd/ingestor/go.mod`, `public/index.html`, `public/live.js`, `public/app.js`, and `LICENSE`.
4. Add `corescope:check-submodule` to `package.json`.
5. Confirm `.github/dependabot.yml` weekly `gitsubmodule` configuration covers this new submodule without additional config.
**Contracts and interfaces:** `npm run corescope:check-submodule` exits non-zero with a clear message if the submodule was not initialized.
**State/data changes:** Adds a gitlink under `vendor/CoreScope`; no runtime data yet.
**Edge cases:** Missing submodule after fresh clone, empty directory, upstream structure drift after Dependabot update.
**Acceptance criteria:** Submodule is present and checker passes locally.
**Verification commands:** `npm run corescope:check-submodule`; `git submodule status vendor/CoreScope`; `npm run lint` if package script edit needs validation.
**Manual validation:** None beyond confirming the checked-out submodule has the expected source tree.
**Risks:** Missing submodule in Docker builds can create confusing failures; checker gives an early explicit failure.
**Out of scope for this step:** Docker runtime, config generation, CoreScope UI changes.

### Step 2: Build and supervise Next + CoreScope in one Docker container
**Goal:** Produce one Docker image/container that runs the Next site, CoreScope server, CoreScope ingestor, and nginx routing.
**Why now:** The user does not have host/Linode proxy access, so the container must own all internal routing.
**Dependencies:** Step 1 submodule and checker.
**Files:** `Dockerfile`, `docker/nginx.conf`, `docker/supervisord.conf`, `docker/start.sh`, `.dockerignore`, `compose.yaml`, `README.md` runtime section if needed.
**Existing code to inspect first:** `Dockerfile`, `compose.yaml`, `.dockerignore`, CoreScope `Dockerfile`, CoreScope `docker/supervisord-go-no-mosquitto-no-caddy.conf`, CoreScope `cmd/server` flags, CoreScope `cmd/ingestor` flags.
**Implementation plan:**
1. Add a Go build stage to compile `corescope-server` and `corescope-ingestor` from `vendor/CoreScope`.
2. Keep the existing Next dependency/build stages and standalone output.
3. Update the runtime image to install `nginx`, `supervisor`, and any small runtime packages needed for startup health checks.
4. Copy the CoreScope binaries, `vendor/CoreScope/public`, `channel-rainbow.json`, and generated/templated config location into the runtime image.
5. Add `docker/supervisord.conf` with programs for nginx, Next, CoreScope server, and CoreScope ingestor.
6. Add `docker/nginx.conf` to listen on `3000`, proxy root site traffic to Next on `3001`, and proxy CoreScope traffic to `3002`.
7. Add `docker/start.sh` to render CoreScope config, prepare writable data/log directories, then start supervisord.
8. Update `compose.yaml` to mount a durable CoreScope data volume and expose the same public port as before.
**Contracts and interfaces:** Public container port remains `3000`; Next internal `PORT=3001`; CoreScope server internal `3002`; CoreScope data lives under a documented volume path such as `/app/corescope/data`.
**State/data changes:** Adds persistent CoreScope SQLite storage via Docker volume; no committed database.
**Edge cases:** Next health checks must target the nginx public port or internal Next route intentionally; CoreScope ingestor must not crash-loop endlessly when MQTT credentials are absent without clear logs; nginx must preserve WebSocket upgrade headers for `/ws`.
**Acceptance criteria:** `docker build` succeeds, `docker compose config` succeeds, and a container can serve the Next home page plus CoreScope health/config endpoints through port `3000`.
**Verification commands:** `npm run corescope:check-submodule`; `docker compose config`; `docker build -t colorado-meshcore-site:corescope .`; existing `npm run build`.
**Manual validation:** Run the image locally and check `http://localhost:3000/` returns the site while `http://localhost:3000/api/healthz` or `http://localhost:3000/api/stats` returns CoreScope data.
**Risks:** Single-container process supervision is more complex than the old one-process image; use supervisor and nginx rather than ad hoc shell backgrounding.
**Out of scope for this step:** Visual overlay/minimal mode design.

### Step 3: Generate Colorado Mesh CoreScope runtime config from environment
**Goal:** Make the bundled CoreScope instance configurable for Colorado Mesh and able to match the existing analyzer when secrets are supplied.
**Why now:** CoreScope cannot show the right network without MQTT/source config, map defaults, branding, and retention settings.
**Dependencies:** Step 2 startup script and runtime paths.
**Files:** `scripts/render-corescope-config.mjs` or `docker/render-corescope-config.mjs`, `docker/start.sh`, `compose.yaml`, `.env.example`, `README.md` runtime environment table.
**Existing code to inspect first:** CoreScope `config.example.json`, current `compose.yaml` live-map env vars, `.env.example`, `src/lib/constants.ts` brand values.
**Implementation plan:**
1. Add a config renderer that writes `/app/corescope/config.json` at startup.
2. Include Colorado Mesh branding: `siteName`, tagline, logo/favicon paths where practical, and Colorado-focused home/footer links.
3. Include Colorado map defaults: center `39.5501,-105.7821`, zoom around `7`, default region/regions for Colorado if known.
4. Map env vars into `mqttSources`, including broker URL, topics, username, password, TLS/rejectUnauthorized, region, and IATA filters.
5. Keep secrets only in environment variables and never in committed JSON.
6. Support no-secrets startup with clear logs and an empty/no-ingest config so local Docker still starts.
7. Document the exact env vars needed to replicate `analyzer.meshcore.coloradomesh.org` once credentials are available.
**Contracts and interfaces:** Env vars such as `CORESCOPE_MQTT_BROKER`, `CORESCOPE_MQTT_TOPICS`, `CORESCOPE_MQTT_USERNAME`, `CORESCOPE_MQTT_PASSWORD`, `CORESCOPE_DEFAULT_REGION`, `CORESCOPE_MAP_CENTER_LAT`, `CORESCOPE_MAP_CENTER_LON`, `CORESCOPE_MAP_ZOOM`, and `CORESCOPE_API_KEY` are server-only.
**State/data changes:** Startup writes generated config inside the container; no secrets committed.
**Edge cases:** JSON escaping for passwords/topics, missing credentials, multiple topics, optional channel keys, region filters, and avoiding browser exposure of MQTT secrets.
**Acceptance criteria:** Generated config is valid JSON, CoreScope server reads it, and the map config endpoint returns Colorado defaults.
**Verification commands:** Node-based unit check for config renderer if added; `docker run`/`docker compose` smoke against `/api/config/map`, `/api/config/client`, `/api/config/regions`.
**Manual validation:** Inspect generated config inside a local container with dummy env vars and verify secrets are not exposed in Next-rendered pages.
**Risks:** Exact analyzer MQTT secrets are unknown; implementation must support them without requiring them for local build/test.
**Out of scope for this step:** Recreating historical analyzer data without access to its database.

### Step 4: Route `/map` to CoreScope and preserve the rest of the site
**Goal:** Make `/map` serve CoreScope directly from the same public origin while the existing site still works.
**Why now:** This is the visible replacement of the old map.
**Dependencies:** Steps 2 and 3.
**Files:** `docker/nginx.conf`, `next.config.js` only if headers need route-specific adjustments, `src/app/map/page.tsx` if a non-Docker fallback needs to stop presenting the old map, `src/lib/constants.ts`, `src/lib/site.ts`, sitemap/metadata files if copy changes are needed.
**Existing code to inspect first:** `src/app/map/page.tsx`, `src/components/NetworkMapWrapper.tsx`, `src/lib/site.ts`, `src/app/sitemap.ts`, `next.config.js`, current CoreScope network requests from `https://analyzer.meshcore.coloradomesh.org/#/live`.
**Implementation plan:**
1. In nginx, route exact `/map` and `/map/` to CoreScope HTML.
2. Route CoreScope root static assets (`/*.css`, CoreScope `/*.js`, `/vendor/*`, `/favicon.svg`, `/geofilter-builder.html`, etc.) to CoreScope when they match upstream asset names.
3. Route CoreScope API and WebSocket paths to CoreScope while leaving existing Next `/api/map/*` and `/api/live-map/*` available.
4. Ensure WebSocket proxy headers and timeouts are configured for `/ws`.
5. Update the Next `/map` fallback so non-Docker development does not keep advertising the old React Leaflet map as the canonical production map.
6. Update any copy/metadata that still describes the old yellowcooln/React map as the public map source.
7. Keep navigation links pointing to `/map`, not the external analyzer host.
**Contracts and interfaces:** Public `/map` is same-origin CoreScope; public `/` and other site routes are Next; public `/api/map/*` remains Next compatibility; CoreScope `/api/*` routes are available for CoreScope UI.
**State/data changes:** None beyond routing.
**Edge cases:** CoreScope root-relative assets can be accidentally served by Next; Next API route collisions must be explicitly ordered; hash route `#/live` is client-side and cannot be supplied by server rewrite alone.
**Acceptance criteria:** Loading `http://localhost:3000/map` displays CoreScope, not `NetworkMapWrapper`; navigation back to the site still works; CoreScope fetches its static assets and APIs from the same origin successfully.
**Verification commands:** `docker compose config`; local container smoke checks with `curl` for `/`, `/map`, `/api/config/map`, `/api/stats`, `/api/map/nodes`; existing `npm run build`.
**Manual validation:** Browser-load `/map` and monitor network/console for missing assets, API 404s, CSP blocks, or WebSocket failures.
**Risks:** Root asset and API collisions are the highest-risk part of direct same-origin serving; nginx route ordering must be tested in Docker, not just Next dev.
**Out of scope for this step:** Final visual minimal/fullscreen polish.

### Step 5: Add Colorado Mesh minimal/fullscreen CoreScope overlay via co-ui
**Goal:** Make `/map` feel like a polished Colorado Mesh live map rather than the stock analyzer shell, while preserving a path to full analyzer tools.
**Why now:** Runtime integration must exist first so Opus UI can test the actual page.
**Dependencies:** Steps 2-4 and working Docker local route.
**Files:** A tracked overlay/patch area such as `corescope-overlay/`, Docker build/start scripts that copy or inject overlay files into CoreScope `public`, and any CoreScope config/theme values needed for the shell.
**Existing code to inspect first:** CoreScope `public/index.html`, `public/app.js`, `public/live.js`, `public/live.css`, `public/style.css`, `public/nav-drawer.js`, current screenshot/snapshot of `https://analyzer.meshcore.coloradomesh.org/#/live`.
**Implementation plan:**
1. Delegate visual implementation to `co-ui` with a precise prompt: create a Colorado Mesh redesigned `/map` CoreScope shell/minimal mode using overlay files, not direct submodule edits.
2. Add overlay CSS/JS that defaults `/map` to the live view, hides/collapses nonessential CoreScope chrome for fullscreen map mode, and adds a clear “Open full analyzer” control.
3. Preserve access to full CoreScope routes (`#/packets`, `#/nodes`, `#/channels`, `#/analytics`, etc.).
4. Keep the overlay update-friendly: do not edit files inside `vendor/CoreScope`; copy/inject overlay assets during Docker build or startup.
5. Test desktop and mobile viewport behavior in the browser.
6. Ensure CoreScope accessibility basics remain intact: visible focus states, usable controls, and no keyboard trap.
**Contracts and interfaces:** `/map` defaults to live/minimal mode; a user can switch/open full analyzer; overlay files are local repo files and survive submodule updates.
**State/data changes:** No data changes.
**Edge cases:** Upstream DOM/class changes can break CSS selectors after Dependabot updates; overlay verification should catch missing selectors or broken minimal mode.
**Acceptance criteria:** Browser shows a fullscreen/minimal Colorado Mesh live map by default and a working path to full analyzer.
**Verification commands:** `npm run build`; Docker browser smoke; Playwright check for `/map` rendering and no console errors where practical.
**Manual validation:** Use browser on `/map`; check the golden path and mobile viewport; verify full analyzer control opens CoreScope’s normal routes.
**Risks:** This is visual frontend work and must be delegated to Opus UI in this Codex-backed session.
**Out of scope for this step:** Rewriting CoreScope internals or porting CoreScope to React.

### Step 6: Add smoke verification and update operational docs
**Goal:** Make future updates safe and document exactly how this one-container CoreScope runtime is operated.
**Why now:** Submodule/overlay updates will come through PRs, so regressions need fast checks.
**Dependencies:** Steps 1-5.
**Files:** `scripts/docker-smoke.mjs` or new `scripts/verify-corescope-runtime.mjs`, `package.json`, `README.md`, `.env.example`, Playwright tests if practical.
**Existing code to inspect first:** `scripts/docker-smoke.mjs`, `scripts/verify-real-map-data.mjs`, `playwright.config.ts`, existing map tests.
**Implementation plan:**
1. Add or extend a smoke script to check `/`, `/map`, CoreScope `/api/healthz`, `/api/config/map`, `/api/stats`, and representative Next `/api/map/nodes` compatibility.
2. Add a WebSocket smoke where practical, or document it as a manual/browser check if the test environment cannot keep CoreScope running.
3. Update README Docker/runtime docs to explain the one-container process model, data volume, environment variables, and update workflow.
4. Update `.env.example` with CoreScope env placeholders and no real secrets.
5. Add notes for Dependabot CoreScope submodule PR validation: run checker, build image, run smoke, browser-test `/map`.
6. Run final verification across lint/typecheck/build/unit tests plus Docker config/build if feasible.
**Contracts and interfaces:** Operators know which env vars are required and which commands validate the runtime.
**State/data changes:** Documentation only; no runtime data committed.
**Edge cases:** Smoke tests must not require real MQTT credentials; they should verify startup/routing even with empty data.
**Acceptance criteria:** Existing checks still pass, Docker runtime checks cover CoreScope routing, and docs describe the deploy/update path clearly.
**Verification commands:** `npm run lint`; `npm run typecheck`; `npm run test`; `npm run build`; `docker compose config`; `docker build -t colorado-meshcore-site:corescope .`; smoke script.
**Manual validation:** Run the Docker image locally, open `/map`, verify no old React map appears, verify CoreScope routes and full analyzer access.
**Risks:** Full live-data validation depends on MQTT credentials not currently available; smoke must distinguish runtime readiness from live packet ingestion.
**Out of scope for this step:** Linode host configuration and DNS changes.

## Cross-Step Integration Checks
- Fresh clone with submodules initialized can build Docker image.
- Docker image exposes one public port, `3000`, and serves both Next and CoreScope correctly.
- `/map` is CoreScope, not the old Next `NetworkMapWrapper`.
- CoreScope static assets load from same origin without root asset collisions.
- CoreScope APIs and `/ws` route to CoreScope; existing `/api/map/*` and `/api/live-map/*` remain available if tools still need them.
- CoreScope config contains Colorado defaults and no committed secrets.
- CoreScope can start without real MQTT credentials for local smoke testing and can ingest when credentials are supplied.
- Dependabot submodule update PRs can be validated with checker/build/smoke.

## Testing Strategy
- Local non-Docker checks: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run corescope:check-submodule`.
- Docker checks: `docker compose config`, `docker build`, container smoke for `/`, `/map`, `/api/config/map`, `/api/stats`, `/api/healthz`, `/api/map/nodes`.
- Browser checks: open `/map`, inspect console/network, verify live/minimal view, verify full analyzer access, verify mobile viewport.
- Review gates: each step gets a staged Claude Forge review before commit; final Forge review checks integration across all steps.

## Out of Scope
- Accessing or changing Linode host-level proxy/DNS configuration.
- Running multiple Docker containers in production.
- Rewriting CoreScope as React components inside the Next app.
- Editing upstream files inside `vendor/CoreScope` directly.
- Committing real MQTT credentials, API keys, channel keys, or production databases.
- Preserving Netlify preview behavior for CoreScope.
