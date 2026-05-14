# Prior Art Research: CoreScope Live Map Replacement

Project: Replace the Denver MeshCore site's current live map experience with CoreScope, preferably as a git submodule under `vendor/` and integrated into the existing brownfield deployment.

### ITEM-prior-art-1: CoreScope upstream is the strongest canonical replacement

- **URL:** https://github.com/Kpa-clawbot/CoreScope
- **What it does well:** CoreScope is an actively maintained, self-hosted MeshCore analyzer with MQTT ingestion, real-time packet decoding, live packet feed, map/live views, channel chat, packet tracing, node analytics, observers, OpenAPI docs, and prebuilt GHCR Docker images for amd64/arm64. Its architecture is purpose-built for an analyzer replacement: Go ingestor + Go HTTP server + SQLite persistence + in-memory indexed packet store + vanilla JS frontend.
- **What it lacks:** It is a full standalone application, not a drop-in React/Next component. Submodule integration should therefore treat it as an upstream service/artifact, not code to inline into the Next.js app. License metadata conflicts in upstream docs: GitHub metadata and `LICENSE` are GPL-3.0, while README currently says MIT; treat it as GPL-3.0 until upstream clarifies.
- **What we can learn:** Use CoreScope as the canonical analyzer/live-map runtime, preferably mounted as `vendor/CoreScope` and deployed as a sidecar/service behind the Denver site or reverse proxy. Avoid porting its UI into the Next app by hand; link, proxy, iframe, or route traffic to the CoreScope service and keep Denver-specific shell work minimal.
- **License:** GPL-3.0 based on GitHub license metadata and repository `LICENSE`; README has contradictory MIT text.
- **Confidence:** HIGH
- **Source:** GitHub CLI + README/LICENSE — https://github.com/Kpa-clawbot/CoreScope
- **Checked:** 2026-05-13

### ITEM-prior-art-2: CoreScope public instance and OpenAPI spec provide a live contract to integrate against

- **URL:** https://analyzer.00id.net/api/docs
- **What it does well:** The public instance exposes product navigation for Map, Live, Packets, Channels, Nodes, Traces, Observers, Analytics, and Perf. Its OpenAPI spec documents REST endpoint groups for stats, health, nodes, observers, packets, traces, channels, analytics, config, cache, theme, and region data.
- **What it lacks:** The fetched OpenAPI paths did not expose a WebSocket/SSE endpoint, so REST docs alone are not enough to implement real-time push integration. CoreScope's README claims WebSocket broadcast, but consumers should verify the route from source or runtime before proxying it.
- **What we can learn:** During implementation, use `/api/spec` as the compatibility gate for REST integrations and smoke tests. For the Denver site, REST endpoints can replace or supplement existing `/api/map/*` and `/api/live-map/*` polling paths, while WebSocket routing should be validated separately from CoreScope source/runtime.
- **License:** N/A for live service; upstream project license applies.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://analyzer.00id.net/api/spec
- **Checked:** 2026-05-13

### ITEM-prior-art-3: Denver's current live map is a mature local integration but should be retired as UI

- **URL:** /Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx
- **What it does well:** The existing Denver site already has a brownfield live-map integration: a Next.js `/map` page, `NetworkMap` React/Leaflet UI, `/api/map/*` and `/api/live-map/*` routes, environment-based runtime config, upstream proxy hardening, SSRF/private-address checks, response size/time limits, token handling, diagnostics panels, local fallback behavior, and Docker compose wiring for `yellowcooln/meshcore-mqtt-live-map`.
- **What it lacks:** It is a custom Next/React map surface rather than the full CoreScope analyzer. It duplicates live-map UI and proxy responsibilities that CoreScope already owns, and it lacks CoreScope's broader packet feed, channel, trace, observer, and analytics experience.
- **What we can learn:** Preserve the hardening and operational lessons, but do not keep building the custom Leaflet UI as the canonical experience. Replace the public `/map` destination with a CoreScope-backed experience and keep only thin compatibility routes/status checks if needed for SEO, health checks, redirects, or legacy consumers.
- **License:** Current map attribution states GPL-3.0 derivative of `yellowcooln/meshcore-mqtt-live-map`.
- **Confidence:** HIGH
- **Source:** Local repo — /Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx
- **Checked:** 2026-05-13

### ITEM-prior-art-4: yellowcooln/meshcore-mqtt-live-map is the current community live-map baseline, not the future target

- **URL:** https://github.com/yellowcooln/meshcore-mqtt-live-map
- **What it does well:** Provides a live MeshCore traffic map with FastAPI backend, MQTT subscription over TCP/WebSockets/TLS, official MeshCore decoder integration, WebSocket updates, Leaflet UI, route lines, history, peers, coverage, weather, LOS, PWA support, `/snapshot`, `/stats`, `/api/nodes`, `/peers/{id}`, and a Docker image. The Denver repo's current API/proxy shape aligns closely with this project's endpoints.
- **What it lacks:** It is map-centric and Python/FastAPI-based, not a full analyzer. It does not provide the same breadth of CoreScope packet analytics, channel UI, observer analytics, OpenAPI contract, or Go in-memory packet-store performance model.
- **What we can learn:** Use this as a compatibility reference for migration, especially for endpoint parity and env var mapping. Do not invest further in this as the canonical runtime if the goal is to replace the map with CoreScope.
- **License:** GPL-3.0
- **Confidence:** HIGH
- **Source:** GitHub CLI README/repo metadata — https://github.com/yellowcooln/meshcore-mqtt-live-map
- **Checked:** 2026-05-13

### ITEM-prior-art-5: Official MeshCore Map is a public registry, not a local live analyzer

- **URL:** https://github.com/meshcore-dev/map.meshcore.io
- **What it does well:** The official MeshCore Map is a static Vue/Leaflet frontend backed by `https://map.meshcore.io/api/v1/nodes`. The MeshCore blog describes search, filtering, clustering, QR/contact links, shareable URLs, iframe embedding, freshness colors, manual uploads, and an auto-uploader flow for infrastructure nodes.
- **What it lacks:** It is an internet map/registry with day-scale freshness, not local RF packet monitoring. It does not replace CoreScope-style packet traces, observer health, channel decoding, route replay, or near-real-time local diagnostics.
- **What we can learn:** Keep official map links as an external ecosystem reference, but do not use it as the Denver live-map replacement. If Denver wants public node registration, use the official uploader path separately from CoreScope.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** GitHub CLI + WebFetch — https://blog.meshcore.io/2026/04/04/meshcore-map
- **Checked:** 2026-05-13

### ITEM-prior-art-6: Existing Denver vendor submodule pattern should be copied for CoreScope

- **URL:** /Users/cjvana/Documents/GitHub/denvermc-org/.gitmodules
- **What it does well:** The repo already vendors `Colorado-Mesh/meshcore-utilities-site` as a submodule under `vendor/meshcore-utilities-site` and has a verification script that checks the submodule exists, is non-empty, contains required upstream files, and resolves to a valid commit SHA.
- **What it lacks:** The script is specific to utilities and does not yet generalize submodule checks. There is no CoreScope submodule entry or CoreScope readiness check yet.
- **What we can learn:** Add CoreScope as a pinned submodule under `vendor/corescope` or `vendor/CoreScope`, then add a dedicated `scripts/check-corescope-submodule.mjs` and npm script. Check for upstream files that prove it is usable (`Dockerfile`, `config.example.json`, `cmd/server`, `cmd/ingestor`, `public`, `proto`, `LICENSE`) and record the pinned commit in review notes.
- **License:** N/A for integration pattern.
- **Confidence:** HIGH
- **Source:** Local repo — /Users/cjvana/Documents/GitHub/denvermc-org/.gitmodules and /Users/cjvana/Documents/GitHub/denvermc-org/scripts/check-utilities-submodule.mjs
- **Checked:** 2026-05-13

### ITEM-prior-art-7: meshcoretomqtt and meshcore-packet-capture are the right observer ingestion layer

- **URL:** https://github.com/Cisien/meshcoretomqtt
- **What it does well:** `meshcoretomqtt` is the established Python bridge for Repeaters/RoomServers connected over serial/USB, publishing status/packets/debug topics such as `meshcore/{IATA}/{PUBLIC_KEY}/packets`. `agessaman/meshcore-packet-capture` complements it for Companion radios via BLE/serial/TCP and can publish packet/RF telemetry to MQTT. Both projects support broker credentials, TLS/WebSockets or multi-broker patterns relevant to feeding CoreScope.
- **What it lacks:** These are capture/bridge tools, not web map replacements. They require operator hardware and firmware/runtime setup outside the Denver website deployment.
- **What we can learn:** Do not build packet capture into the Denver Next.js site. Document CoreScope's expected MQTT topic/config and rely on these observer tools or existing Colorado Mesh broker feeds to populate CoreScope.
- **License:** MIT for both `Cisien/meshcoretomqtt` and `agessaman/meshcore-packet-capture`.
- **Confidence:** HIGH
- **Source:** GitHub CLI README/repo metadata — https://github.com/Cisien/meshcoretomqtt and https://github.com/agessaman/meshcore-packet-capture
- **Checked:** 2026-05-13

### ITEM-prior-art-8: Community deployments like CT Mesh validate the standalone live-map deployment model

- **URL:** https://meshcore-map.ctmesh.org/
- **What it does well:** CT Mesh presents a live MeshCore map whose visible UI states that markers update in real time from an MQTT broker. It exposes operator controls for node sizing, dark/topo layers, units, labels, heat/coverage, weather, history, peers, hops, LOS, route details, and propagation estimates.
- **What it lacks:** It appears to be a deployed map instance rather than a reusable integration package. The page does not by itself answer deployment, license, or API-contract questions.
- **What we can learn:** Live MeshCore mapping is commonly deployed as a dedicated web app/service fed by MQTT, not embedded as a hand-coded component inside a broader site. Denver should follow that pattern for CoreScope: separate service, clear reverse proxy/subpath, and simple navigation from the main site.
- **License:** N/A for deployed site.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://meshcore-map.ctmesh.org/
- **Checked:** 2026-05-13

### ITEM-prior-art-9: MeshExplorer is a possible alternative, but less aligned than CoreScope

- **URL:** https://github.com/ajvpot/meshexplorer
- **What it does well:** MeshExplorer targets real-time maps, chat, and packet analysis for MeshCore and Meshtastic with a modern responsive UI. It is built with Next.js and supports a `NEXT_PUBLIC_API_URL` split between frontend and API, which resembles the Denver site's technology choices.
- **What it lacks:** It appears less mature for this use case: fewer stars/forks than CoreScope, no license metadata found via GitHub, ClickHouse dependency, and a generic README with limited MeshCore operational detail.
- **What we can learn:** Borrow the idea of frontend/API separation if needed, but do not choose it over CoreScope for this project. CoreScope is more active, MeshCore-specific, operationally documented, and directly requested as the target.
- **License:** Unknown/no license metadata found.
- **Confidence:** MEDIUM
- **Source:** GitHub CLI README/repo metadata — https://github.com/ajvpot/meshexplorer
- **Checked:** 2026-05-13

### ITEM-prior-art-10: MeshCore MQTT triangulator is useful adjunct analytics, not part of the first replacement

- **URL:** https://github.com/brad28b/meshcore_mqtt_triangulator
- **What it does well:** Passively triangulates MeshCore repeaters or advertised nodes from MQTT packet observations using multi-anchor chain-walk, weighted geometric median, optional terrain-aware mode, SQLite collection, and validation tooling. It documents data quality limits around publisher density, GPS correctness, path hash collisions, and sparse edge-of-coverage targets.
- **What it lacks:** It is a CLI/analytics subsystem, not a live-map UI replacement. It needs accumulated MQTT observations and may introduce privacy concerns if used to infer locations for nodes that do not publish exact GPS.
- **What we can learn:** Keep triangulation out of the CoreScope replacement scope unless operators explicitly request it. CoreScope already covers the primary analyzer/map need; triangulation can be a later opt-in operator tool with privacy review.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** GitHub CLI README/repo metadata — https://github.com/brad28b/meshcore_mqtt_triangulator
- **Checked:** 2026-05-13

### ITEM-prior-art-11: MeshCore Map uploader solves official-map publishing, not Denver live-map replacement

- **URL:** https://github.com/recrof/map.meshcore.io-uploader
- **What it does well:** Automatically uploads repeaters or room servers to the official MeshCore map when a Companion hears adverts. It supports USB or host:port Companion access and containerized deployment.
- **What it lacks:** It does not provide live packet visualization, local analyzer UI, route tracing, or CoreScope integration. It targets the official internet map's registry/update workflow.
- **What we can learn:** Treat official-map publishing as a separate operational concern from CoreScope. If Denver wants nodes on map.meshcore.io, use this uploader alongside observer tooling; do not conflate it with replacing `/map`.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** GitHub CLI README/repo metadata — https://github.com/recrof/map.meshcore.io-uploader
- **Checked:** 2026-05-13

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-prior-art-1 | HIGH | GitHub CLI + README/LICENSE | https://github.com/Kpa-clawbot/CoreScope |
| ITEM-prior-art-2 | MEDIUM | WebFetch | https://analyzer.00id.net/api/spec |
| ITEM-prior-art-3 | HIGH | Local repo | /Users/cjvana/Documents/GitHub/denvermc-org/src/app/map/page.tsx |
| ITEM-prior-art-4 | HIGH | GitHub CLI README/repo metadata | https://github.com/yellowcooln/meshcore-mqtt-live-map |
| ITEM-prior-art-5 | HIGH | GitHub CLI + WebFetch | https://github.com/meshcore-dev/map.meshcore.io; https://blog.meshcore.io/2026/04/04/meshcore-map |
| ITEM-prior-art-6 | HIGH | Local repo | /Users/cjvana/Documents/GitHub/denvermc-org/.gitmodules; /Users/cjvana/Documents/GitHub/denvermc-org/scripts/check-utilities-submodule.mjs |
| ITEM-prior-art-7 | HIGH | GitHub CLI README/repo metadata | https://github.com/Cisien/meshcoretomqtt; https://github.com/agessaman/meshcore-packet-capture |
| ITEM-prior-art-8 | MEDIUM | WebFetch | https://meshcore-map.ctmesh.org/ |
| ITEM-prior-art-9 | MEDIUM | GitHub CLI README/repo metadata | https://github.com/ajvpot/meshexplorer |
| ITEM-prior-art-10 | HIGH | GitHub CLI README/repo metadata | https://github.com/brad28b/meshcore_mqtt_triangulator |
| ITEM-prior-art-11 | HIGH | GitHub CLI README/repo metadata | https://github.com/recrof/map.meshcore.io-uploader |
