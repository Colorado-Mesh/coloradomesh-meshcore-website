# Step 6 Execution Plan: Final sound-mode coverage, Docker smoke, docs, and integration review

## Goal
Verify the full map sound feature across static assets, Docker routing, and operator documentation, then run final review.

## Current Code Observations
- `scripts/docker-smoke.mjs` already builds confidence in Docker `/map` by checking overlay injection, CoreScope APIs, compatibility APIs, and WebSocket routing.
- The Docker smoke currently checks shell/zoom/default-route assets but does not check `denvermc-sound.js` or `/sound/orchestral/...` static files.
- `README.md` describes CoreScope `/map`, runtime env, retention, channel keys, and Docker smoke, but does not mention browser-local sound modes or bundled orchestral samples.
- `tests/e2e/smoke.spec.ts` covers the non-Docker fallback `/map` route and site navigation; it can also mount the overlay scripts in a browser harness to assert sound DOM/localStorage contracts without requiring Docker or audible playback.
- Step 5 already added `getState().ensemble` and browser-smoked lazy sample loading with Chrome DevTools.

## Files to Change
- `.forge/steps/step-6-plan.md` — focused execution plan for this step.
- `scripts/docker-smoke.mjs` — assert Docker serves sound overlay script, manifest, attribution, and curated sample files.
- `README.md` — document browser-local sound modes, opt-in behavior, localStorage persistence, and no extra server requirement.
- `tests/e2e/smoke.spec.ts` — add browser harness coverage for sound default Off, persisted locked mode, volume persistence, logo asset, and old audio suppression.
- `.forge/reviews/final-claude-review.json` — final Forge review artifact after verification.

## Ordered Implementation Checklist
1. Extend Docker smoke's `/map` overlay asset checks to include `denvermc-sound.js` and explicitly fetch the sound overlay script.
2. Add Docker smoke checks for `/sound/orchestral/manifest.json`, manifest role/sample shape, and all sample URLs referenced by the manifest.
3. Add Docker smoke checks for `/sound/orchestral/ATTRIBUTION.md` and expected provenance text.
4. Add browser harness coverage that mounts the overlay scripts and asserts default Off, persisted locked mode, volume persistence, correct logo asset, and old CoreScope audio suppression.
5. Update README map/runtime notes with concise sound-mode behavior: default Off, explicit browser unlock, localStorage mode/volume, sample assets bundled under `/sound/orchestral`, no server-side audio service or secrets.
6. Run static checks, unit/e2e where practical, Docker build, Docker smoke, and final browser/manual checks.
7. Stage specific Step 6 files, request final Forge review, save the review artifact, fix findings if any, and commit.

## Interfaces and Data Contracts
- Docker smoke should assert `manifest.version` exists, `manifest.samples` is a non-empty array, `manifest.roles.messages/node/priority` are arrays, and every sample has `id`, `url`, `rootNote`, `license`, `sourceUrl`, and `attribution`.
- Static sample URLs in `manifest.json` must be reachable in Docker and return a non-empty response.
- Browser harness tests should assert UI/static contracts only, not audible playback or real hardware.
- README must describe sound as browser-local and opt-in; no environment variable or server process is required.

## Verification Plan
- Automated: `npm run lint`; `npm run typecheck`; `npm run test:unit`; `PLAYWRIGHT_PORT=4323 npx playwright test tests/e2e/smoke.spec.ts --project=chromium --workers=1`; `docker build -t colorado-meshcore-site:local .`; `npm run docker:smoke -- --image colorado-meshcore-site:local`; `git diff --check`. Parallel Playwright runs on this branch exposed an existing Next dev-server `/guides/getting-started` JSON parse overlay; the same route passes in isolation and in the serial full smoke run.
- Manual/browser: run the Docker container or static CoreScope public harness, verify default Off, select each mode, confirm Ensemble loads `/sound/orchestral` only after unlock, and confirm no duplicate old CoreScope audio controls.
- Regression: CoreScope submodule stays clean; existing `/api/map/*`, `/api/nodes`, `/api/packets`, `/ws`, and `/map` smoke expectations still pass; no secrets are added to docs or image defaults.

## Stop Conditions
- If Docker is unavailable or Docker build fails for unrelated environment reasons, record the blocker and do not claim Docker smoke success.
- If tests reveal Docker static routing cannot serve sample files, fix routing/overlay copy before final review.
- If README changes drift into visual/UI design guidance, keep them operator-focused and avoid styling work in this session.
