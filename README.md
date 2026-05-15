# Colorado MeshCore

Colorado MeshCore is the public website for Colorado Mesh's MeshCore community. It provides project information, getting-started guides, a live network map, and utilities for configuring repeaters, companion nodes, prefixes, and serial USB access.

## Features

- **Live network map** — CoreScope served directly at `/map` from the same Docker container, with a Colorado Mesh minimal live-map shell and full analyzer access.
- **MeshCore tools** — Repeater naming, companion naming, PrefixMatrix, and serial USB helpers.
- **Guides and use cases** — Community onboarding, repeater setup, emergency communication, and related MeshCore content.
- **Colorado Mesh branding** — Site copy and assets aligned with the Colorado MeshCore network.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Web app | Next.js 16, React 19 | App Router pages and API routes |
| Styling | Tailwind CSS 4 | Utility-first styling |
| Maps | CoreScope, Leaflet | Docker-served live network analyzer at `/map` |
| Content | MDX | Blog and guide content |
| Runtime | Node.js 24, Go 1.22, nginx, supervisord, Docker | One-container Next + CoreScope production runtime |

## Quick Start

### Prerequisites

- Node.js 24 or 25, matching the `package.json` engine range
- npm

### Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify

```bash
npm run lint
npm run typecheck
npm run build
```

## Docker Runtime

Build and run the standalone Docker image:

```bash
git submodule update --init --recursive
docker build -t colorado-meshcore-site:local .
docker run --rm -p 3000:3000 --env-file .env.example colorado-meshcore-site:local
```

Or run with Compose:

```bash
cp .env.example .env
docker compose up --build
```

Production uses one container. nginx listens on public port `3000`, sends the normal site to the Next standalone server on `127.0.0.1:3001`, and sends `/map`, CoreScope assets, CoreScope APIs, and WebSocket upgrades to CoreScope on `127.0.0.1:3002`. `supervisord` runs nginx, Next, CoreScope server, and the optional CoreScope ingestor. CoreScope stores SQLite data in `/app/corescope/data`, mounted by Compose as the `corescope-data` volume.

`/map` is Docker-owned CoreScope, not the old in-app React map. Loading `/map` defaults to `/map#/live` and applies the local `corescope-overlay/` shell during the Docker build. The minimal Colorado Mesh live-map view hides CoreScope chrome by default, while the **Full analyzer** control exposes the stock CoreScope routes such as `#/packets`, `#/nodes`, `#/channels`, `#/analytics`, and `#/perf`.

CoreScope `config.json` is generated at container startup from environment variables and written only inside the container. Leave MQTT password empty for a no-secret local startup; with the default `CORESCOPE_ENABLE_INGESTOR=auto`, the ingestor starts only when a usable broker plus credentials are present. Retention defaults mark nodes inactive after 7 days, remove observers after 14 days, and prune packet history after 30 days. Do not commit real MQTT credentials, API keys, channel keys, or generated CoreScope configs.

Run the container smoke test after building an image:

```bash
npm run docker:smoke -- --image colorado-meshcore-site:local
```

The smoke test starts a temporary container, verifies the Next site, CoreScope `/map`, overlay asset injection, CoreScope health/config/stats/node/packet endpoints, preserved Next `/api/map/*` compatibility endpoints, and the root WebSocket route.

## Runtime Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL for metadata and canonical links. |
| `WEB_PORT` | No | Compose host port mapped to container port `3000`; defaults to `3000`. |
| `CORESCOPE_ENABLE_INGESTOR` | No | Start CoreScope's ingestor when usable MQTT credentials are configured; defaults to `auto`. |
| `CORESCOPE_API_KEY` | No | Optional CoreScope API key, stored only in generated container config. |
| `CORESCOPE_BRAND_SITE_NAME` | No | CoreScope brand name; defaults to `Colorado Mesh CoreScope`. |
| `CORESCOPE_BRAND_TAGLINE` | No | CoreScope brand tagline. |
| `CORESCOPE_DEFAULT_REGION` | No | Default CoreScope region key; defaults to `CO`. |
| `CORESCOPE_REGIONS_JSON` | No | JSON object of CoreScope region labels; defaults to `{"CO":"Colorado, US"}`. |
| `CORESCOPE_MAP_CENTER_LAT` / `CORESCOPE_MAP_CENTER_LON` | No | CoreScope map center; defaults to Colorado. |
| `CORESCOPE_MAP_ZOOM` | No | CoreScope map zoom; defaults to `7`. |
| `CORESCOPE_TILE_URL` | No | CoreScope tile URL template. |
| `CORESCOPE_MQTT_BROKER` | No | Optional full CoreScope MQTT broker URL; overrides server/port/transport when set. |
| `CORESCOPE_MQTT_SERVER` / `CORESCOPE_MQTT_PORT` | Yes for live ingest | MQTT broker host and port; defaults to the Colorado Mesh broker on `1883`. |
| `CORESCOPE_MQTT_TRANSPORT` / `CORESCOPE_MQTT_TLS_ENABLED` | No | Broker transport and TLS mode; defaults to secure WebSocket MQTT (`wss://`). |
| `CORESCOPE_MQTT_TOPICS` | Yes for live ingest | Comma-separated MQTT topics; defaults to `meshcore/#`. |
| `CORESCOPE_MQTT_USERNAME` / `CORESCOPE_MQTT_PASSWORD` | Yes for authenticated live ingest | CoreScope MQTT credentials. Prefer runtime env or mount the password at `CORESCOPE_MQTT_PASSWORD_FILE` (image default: `/run/secrets/corescope_mqtt_password`); do not bake secrets into the image. |
| `CORESCOPE_BOOTSTRAP_NODES` / `CORESCOPE_BOOTSTRAP_NODES_URL` | No | Seed the local CoreScope DB with public analyzer node locations at startup so fresh VPS volumes show nodes immediately; defaults enabled. |
| `CORESCOPE_MQTT_SOURCE_NAME` | No | Name for the default MQTT source; defaults to `coloradomesh`. |
| `CORESCOPE_MQTT_REGION` | No | Region tag for the default MQTT source; defaults to `CO`. |
| `CORESCOPE_MQTT_IATA_FILTER` | No | Optional observer IATA filter for the default MQTT source. |
| `CORESCOPE_MQTT_REJECT_UNAUTHORIZED` | No | TLS certificate validation flag; defaults to `true`. |
| `CORESCOPE_MQTT_CONNECT_TIMEOUT_SEC` | No | MQTT connect timeout; defaults to `45`. |
| `CORESCOPE_MQTT_SOURCES_JSON` | No | Advanced JSON array override for multiple CoreScope MQTT sources. |
| `CORESCOPE_CHANNEL_KEYS_JSON` / `CORESCOPE_CHANNEL_KEYS_JSON_FILE` | No | Optional channel-key JSON object, or a mounted file containing it, used to decrypt group text so message contents appear on the map; defaults to the well-known MeshCore `Public` key. |
| `CORESCOPE_HASH_CHANNELS` | No | Optional CoreScope hash-channel list for channels whose keys are derived from their names; defaults to `#bot,#testing,#emergency,#wardriving`. |
| `CORESCOPE_OBSERVER_IATA_WHITELIST` | No | Optional observer whitelist. |
| `CORESCOPE_NODE_BLACKLIST` | No | Optional node blacklist. |
| `CORESCOPE_OBSERVER_BLACKLIST` | No | Optional observer blacklist. |
| `CORESCOPE_RETENTION_NODE_DAYS` / `CORESCOPE_RETENTION_OBSERVER_DAYS` / `CORESCOPE_RETENTION_PACKET_DAYS` / `CORESCOPE_RETENTION_METRICS_DAYS` | No | CoreScope retention windows; defaults are nodes inactive after `7` days, observers removed after `14` days, packet history pruned after `30` days, and metrics pruned after `30` days. |
| `CORESCOPE_PACKET_STORE_MAX_MEMORY_MB` / `CORESCOPE_PACKET_STORE_RETENTION_HOURS` | No | CoreScope packet-store limits; defaults to `256` MB and `168` hours to stay safe on small VPS instances. |
| `MESHCORE_MAP_TILE_URL` / `MESHCORE_MAP_TILE_ATTRIBUTION` | No | Legacy Next `/api/map/runtime` tile values for compatibility endpoints. |
| `MESHCORE_MAP_SAMPLE_DATA` / `MESHCORE_MAP_DEMO_MODE` | No | Legacy Next map demo flags; defaults to `false`. |
| `MESHCORE_LIVE_MAP_API_URL` | No | Legacy Next `/api/map/*` compatibility source; defaults to the same-container CoreScope `/api/nodes`. |
| `MESHCORE_LIVE_MAP_API_TOKEN` | No | Optional server-side token for protected compatibility API sources. |
| `MESHCORE_LIVE_MAP_ALLOW_PRIVATE_URLS` | No | Required for trusted internal compatibility API URLs; Compose defaults to `true`. |
| `MESHCORE_LIVE_MAP_PUBLIC_TOKEN_PROXY_ENABLED` | No | Allow public compatibility proxy endpoints to use the API token; defaults to `false`. |
| `MESHCORE_LIVE_MAP_API_REFRESH_SECONDS` | No | Minimum compatibility API refresh interval; defaults to `30`. |
| `MESHCORE_MAP_HISTORY_ENABLED` | No | Reserved for future map history support. |

## API Overview

Docker routes CoreScope-owned API paths to CoreScope, including `/api/config/*`, `/api/health*`, `/api/stats`, `/api/nodes*`, `/api/packets*`, `/api/channels*`, `/api/analytics/*`, `/api/audio-lab/*`, `/api/observers*`, `/api/traces/*`, `/api/perf*`, the protected `/api/admin/prune` endpoint, and `/api/debug/*`. Existing Next compatibility APIs stay available under `/api/map/*` and `/api/live-map/*` for tools that still call them.

| Endpoint | Owner | Method | Description |
|----------|-------|--------|-------------|
| `/map` | CoreScope | GET | Same-origin CoreScope app, defaulting to the live map. |
| `/ws` and root WebSocket upgrades | CoreScope | WS | CoreScope live updates. |
| `/api/healthz` | CoreScope | GET | CoreScope readiness. |
| `/api/config/map` | CoreScope | GET | CoreScope map defaults. |
| `/api/stats` | CoreScope | GET | CoreScope network counters. |
| `/api/map/nodes` | Next compatibility | GET | Current map node snapshot for older site tooling. |
| `/api/map/stats` | Next compatibility | GET | Current map-derived network summary for older site tooling. |

Legacy observer, cleanup, and Discord webhook APIs have been removed. Removed routes intentionally return 404 instead of redirecting.

## CoreScope Update Workflow

CoreScope lives in `vendor/CoreScope` as a git submodule. Dependabot can open submodule update PRs; validate them without editing upstream files directly:

```bash
git submodule update --init --recursive
npm run corescope:check-submodule
npm run lint
npm run typecheck
npm run test:unit
npm run build
docker build -t colorado-meshcore-site:corescope-check .
npm run docker:smoke -- --image colorado-meshcore-site:corescope-check
```

Then browser-test `/map` in Docker. Confirm `/map` redirects to `/map#/live`, the Colorado Mesh minimal shell hides the stock feed/legend by default, **Full analyzer** exposes CoreScope's native routes, **Minimal map** returns to the clean live-map view, and browser console/network output does not show missing assets or broken CoreScope APIs.

## Project Structure

```text
denvermc-org/
├── content/                    # MDX blog and guide content
├── corescope-overlay/          # Local CoreScope shell assets injected at Docker build time
├── docker/                     # nginx, supervisord, and container startup config
├── public/                     # Static assets
├── scripts/                    # Verification and CoreScope config/overlay helpers
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/map/            # Preserved compatibility API routes
│   │   ├── map/                # Non-Docker fallback page; Docker /map is CoreScope
│   │   ├── tools/              # MeshCore utility pages
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Shared constants, map contracts, and utilities
├── vendor/CoreScope            # CoreScope git submodule
├── compose.yaml                # One-container Docker Compose service
├── Dockerfile                  # Production standalone image
├── next.config.js
└── package.json
```

## Community

- **Discord**: [discord.gg/Tuuv9hGPnX](https://discord.gg/Tuuv9hGPnX)
- **MeshCore**: [meshcore.io](https://meshcore.io)
- **LetsMesh**: [letsmesh.net](https://letsmesh.net)

## Contributing

Contributions are welcome. Please run linting, type checking, and the production build before opening a pull request.

## License

This project is part of the Colorado MeshCore community initiative.

## Acknowledgments

Colorado Mesh acknowledges that this site and the majority of its content was originally developed by @cj-vana as part of DenverMC before merging with Colorado Mesh. His efforts to document and promote MeshCore in the Denver area were instrumental in the origins of the statewide MeshCore network.
