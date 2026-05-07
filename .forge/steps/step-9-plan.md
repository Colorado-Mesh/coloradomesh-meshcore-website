# Step 9 Execution Plan: Final parity audit, browser/UI validation, and maintainer report

## Goal
Validate the complete Forge pass across automated checks, parity status, browser behavior, Docker runtime behavior, and final review readiness without adding new product scope.

## Current Code Observations
- The Forge diff now spans the parity foundation, map runtime/API contracts, live-map proxy routes, Opus-delegated map UI, settings JSON exports, 4-character PrefixMatrix, guarded serial settings apply, Nominatim proxy, CI hardening, and Docker smoke.
- `src/lib/parity/manifest.ts` marks repeater/companion settings JSON, PrefixMatrix, serial settings apply, live-map API consumer, Docker sidecar topology, and CI gates as implemented; contacts export remains out-of-scope; full visual map UI parity is still marked planned despite Step 4 UI work being present.
- `.github/workflows/ci.yml` is read-only and now runs quality, Playwright smoke, accessibility, Lighthouse, and Docker runtime smoke jobs without publishing images.
- `.github/workflows/security.yml` keeps npm audit and adds PR-only dependency review with read-only permissions.
- `scripts/docker-smoke.mjs` starts a supplied image, validates `/`, `/api/map/runtime`, and `/api/map/snapshot`, and asserts demo/sample source and warning semantics.
- `compose.yaml` keeps the live-map service behind an opt-in profile and exposes runtime map/live-map env on the web service.
- Local fresh `next dev` Playwright startup is blocked by an unrelated existing same-repo dev server, so browser automation should use production server ports or explicit existing-server URLs unless that process is intentionally stopped.

## Files to Change
- `.forge/steps/step-9-plan.md` — this execution plan.
- `.forge/reviews/final-claude-review.json` — final Forge review artifact after validation.
- `src/lib/parity/manifest.ts` — only if final audit finds inaccurate statuses or coverage refs.
- Source/workflow files — only for validation defects discovered during this step.

## Ordered Implementation Checklist
1. Run the full practical automated suite: lint, typecheck, unit tests, production build, targeted Playwright smoke/a11y against a known-current production server, Lighthouse, Docker build, Docker smoke, and Compose config.
2. Run grep guards for stale direct Nominatim browser calls, exposed server tokens in client code, old map API usage, public contacts export, and accidental `.forge.bak` staging/inclusion.
3. Browser-validate key golden paths with Chrome DevTools: home, `/map`, `/tools`, `/tools/prefix-matrix`, `/tools/serial-usb`, and map/source diagnostics; inspect console/network for obvious runtime errors and credential leakage.
4. Validate Docker runtime manually through the smoke helper and, if needed, direct browser/API checks against the container image.
5. Update parity manifest only for factual mismatches found during the final audit.
6. Stage only Step 9 artifacts/fixes, run final Forge reviewer over the complete diff and verification notes, save the final review JSON, and fix any blocking findings.
7. Commit Step 9 if changes beyond review artifacts are required; otherwise leave only approved final artifacts staged/committed according to Forge flow.

## Interfaces and Data Contracts
- `GET /api/map/runtime` must expose only public map runtime config, source labels, warnings, and feature availability.
- `GET /api/map/snapshot` remains the canonical map snapshot contract consumed by browser map and PrefixMatrix flows.
- Browser code must call site-local APIs (`/api/map/*`, `/api/live-map/*`, `/api/geocode`) rather than protected upstream service URLs or direct Nominatim.
- Docker smoke must remain local/non-publishing and must clean up containers on success or failure.
- PR workflows must remain read-only and non-publishing.

## Verification Plan
- Automated: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, production-server Playwright smoke/a11y, `npm run test:lighthouse`, `docker build -t colorado-meshcore-site:final .`, `npm run docker:smoke -- --image colorado-meshcore-site:final`, `docker compose config`.
- Manual/browser: use Chrome DevTools against a known-current local server to exercise `/`, `/map`, `/tools`, `/tools/prefix-matrix`, and `/tools/serial-usb`; check console and network requests.
- Regression: confirm `.forge.bak.1778125252/` remains untracked and unstaged; confirm no PR workflow publishes images; confirm contacts export remains out-of-scope.

## Stop Conditions
- If automated checks fail for product/code defects, fix the defect within existing scope and rerun relevant checks before review.
- If a failure requires new product scope or a visual/aesthetic UI implementation change, stop and delegate UI work to Opus UI rather than editing visual frontend code in this session.
- If Docker is unavailable or browser automation cannot run due local process conflicts, record the exact blocker and use the closest already-verified production/server alternative rather than weakening CI intent.
- If grep/browser checks reveal exposed secrets or direct protected upstream browser fetches, fix before final review.
