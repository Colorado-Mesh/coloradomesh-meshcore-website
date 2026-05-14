# Step 2 Execution Plan: Build and supervise Next + CoreScope in one Docker container

## Goal
Produce a single Docker image that runs the existing Next.js site, CoreScope server, optional CoreScope ingestor, and nginx on the public container port `3000`.

## Current Code Observations
- The existing Dockerfile builds only the Next standalone app and runs `node server.js` on public port `3000`.
- CoreScope ships Go binaries for `cmd/server` and `cmd/ingestor`, and upstream supervisord examples run the server with `-config-dir`, `-db`, `-public`, and `-port` flags.
- CoreScope server opens SQLite read-only and expects the database schema to exist, while the ingestor applies schema migrations before connecting to MQTT.
- CoreScope ingestor exits when no MQTT source connects, so local no-secret startup needs the ingestor disabled until runtime config is available.
- The repo has no local `docker/` config directory yet.

## Files to Change
- `Dockerfile` — add a CoreScope Go build stage, install nginx/supervisor/sqlite in runtime, and copy CoreScope assets/binaries.
- `docker/nginx.conf` — route public `:3000` requests to Next or CoreScope by path.
- `docker/supervisord.conf` — supervise nginx, Next, CoreScope server, and optional CoreScope ingestor.
- `docker/start.sh` — prepare CoreScope config/data paths, initialize an empty SQLite schema for no-secret startup, and launch supervisord.
- `compose.yaml` — expose the same public port, add CoreScope env defaults, and persist CoreScope data.
- `.forge/steps/step-2-plan.md` — this execution plan.

## Ordered Implementation Checklist
1. Add a CoreScope Go builder stage that compiles `corescope-server` and `corescope-ingestor` from `vendor/CoreScope`.
2. Keep the Next standalone build stage intact.
3. Install nginx, supervisor, sqlite, CA certs, and timezone data in the final runtime image.
4. Copy Next standalone output, CoreScope binaries, CoreScope public assets, and CoreScope config seed files into the runtime image.
5. Add nginx routing for `/map`, CoreScope APIs, `/ws`, and known CoreScope root assets while preserving Next routes and Next `/api/map/*` / `/api/live-map/*` compatibility.
6. Add supervisor programs for nginx, Next, CoreScope server, and CoreScope ingestor.
7. Default `CORESCOPE_ENABLE_INGESTOR=false` so local no-secret Docker smoke tests still start cleanly.
8. Add startup preparation for CoreScope config, data directory, and an empty SQLite schema that CoreScope server can read before ingestion is configured.
9. Update Compose to use the new internal ports and a `corescope-data` volume.

## Interfaces and Data Contracts
- Public container port stays `3000`.
- nginx listens on `:3000`.
- Next listens internally on `127.0.0.1:3001`.
- CoreScope server listens internally on `127.0.0.1:3002`.
- CoreScope data lives at `/app/corescope/data/meshcore.db` on the `corescope-data` volume.
- CoreScope ingestor is opt-in for this step through `CORESCOPE_ENABLE_INGESTOR=true`.

## Verification Plan
- `npm run corescope:check-submodule`
- `docker compose config`
- `sh -n docker/start.sh`
- `docker build -t colorado-meshcore-site:corescope-step2 .`
- If the image builds, run a local container smoke against `/`, `/map`, `/api/health`, and `/api/config/map`.

## Stop Conditions
- Pause if CoreScope binaries fail to build from the pinned submodule.
- Pause if the single-container runtime cannot start without MQTT credentials.
- Pause if nginx route ordering breaks existing Next `/api/map/*` compatibility.
