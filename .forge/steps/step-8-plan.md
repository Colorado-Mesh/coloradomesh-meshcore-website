# Step 8 Execution Plan: Pragmatic blocking CI hardening and Docker runtime smoke

## Goal
Enforce the existing lint, typecheck, unit, Playwright smoke, accessibility, Lighthouse, build, and Docker runtime checks in CI without adding publishing behavior to pull requests.

## Current Code Observations
- `.github/workflows/ci.yml` currently runs `npm ci`, lint, typecheck, build, and a Docker build-only smoke; it does not run unit tests, Playwright smoke, axe, Lighthouse, or container runtime curl checks.
- `.github/workflows/security.yml` already runs `npm audit --audit-level=high` on pushes, PRs, and a weekly schedule.
- `.github/workflows/docker-release.yml` only publishes on releases, semver tags, or manual dispatch, so Step 8 should not change release/push semantics unless a reusable smoke helper is needed.
- `package.json` already exposes `lint`, `typecheck`, `test:unit`, `test:e2e`, `test:a11y`, `test:lighthouse`, and `build`.
- `.lighthouserc.json` starts `npm run start` and audits `/`, `/map`, and `/tools` with blocking category budgets.
- `Dockerfile` builds a Next standalone image and runs `node server.js` on port 3000.
- `compose.yaml` includes an opt-in `live-map` profile and a `web` service healthcheck against `/api/map/stats`.
- `.dockerignore` already excludes `.forge`, `.forge.bak.*`, test results, Lighthouse reports, local env files, and VCS/tooling artifacts.

## Files to Change
- `.github/workflows/ci.yml` — split/expand CI jobs to include install, lint/typecheck/unit/build, Playwright smoke, a11y, Lighthouse, Docker build, and Docker run curl smoke without publishing.
- `package.json` — add a Docker runtime smoke script if a local helper is cleaner than inline CI.
- `scripts/docker-smoke.mjs` — optional helper to run a built image, wait for readiness, curl key routes, assert map API/runtime behavior, and clean up containers.
- `src/lib/parity/manifest.ts` — update CI parity coverage refs to implemented.
- `.forge/steps/step-8-plan.md` — this execution plan.

## Ordered Implementation Checklist
1. Add a small Node-based Docker smoke helper that starts a named container from a supplied image tag, injects deterministic demo/sample env, waits for `/api/map/runtime`, validates `/`, `/api/map/snapshot`, and `/api/map/runtime`, checks source/warning JSON expectations, and removes the container in `finally`.
2. Add an npm script such as `docker:smoke` to run the helper locally and from CI with an overridable image tag.
3. Update `.github/workflows/ci.yml` to run lint, typecheck, unit tests, build, Playwright critical smoke, Playwright a11y, Lighthouse, Docker build, and Docker runtime smoke in clear jobs.
4. Use Node 24 with npm caching for Node jobs and Playwright browser installation only where browser jobs require it.
5. Keep Docker PR behavior non-publishing: build local tags only, do not log in, do not push, and do not change `docker-release.yml` triggers.
6. Update `src/lib/parity/manifest.ts` so `ci-pr-quality-gates` records implemented status and coverage refs for workflow checks and Docker smoke.
7. Run local verification commands that are practical in this environment, including workflow-adjacent scripts and Docker smoke if Docker is available.

## Interfaces and Data Contracts
- `npm run docker:smoke -- --image <tag>` should validate a locally available Docker image and exit non-zero on runtime failures.
- CI should keep all PR jobs read-only/non-publishing; no GHCR login or push in `.github/workflows/ci.yml`.
- Docker smoke should assert HTTP success and minimal JSON shape for `/api/map/snapshot` and `/api/map/runtime` without relying on external live-map services.
- Playwright smoke in CI should run Chromium only using the existing `playwright.config.ts` web server.

## Verification Plan
- Automated: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, targeted Playwright smoke as feasible, `npm run test:a11y` or known issue documentation, `npm run test:lighthouse` if stable locally, `docker build -t colorado-meshcore-site:ci-smoke .`, `npm run docker:smoke -- --image colorado-meshcore-site:ci-smoke` if Docker daemon is available.
- Manual: inspect CI workflow triggers/permissions to ensure PR checks do not publish, log into registries, or touch release workflows.
- Regression: `.dockerignore` still excludes `.forge.bak.*`; existing release workflow behavior remains unchanged.

## Stop Conditions
- If Docker is unavailable locally, implement and syntax-check the smoke helper but record Docker runtime validation as not performed locally.
- If existing known `/map` axe issues make `npm run test:a11y` fail, do not hide the failure; keep CI intent aligned with Step 8 and record the known Step 9 follow-up or fix only if scoped.
- If Lighthouse budgets fail for product/UI reasons, avoid weakening budgets silently; inspect whether the failure is environment noise or a real regression before changing thresholds.
