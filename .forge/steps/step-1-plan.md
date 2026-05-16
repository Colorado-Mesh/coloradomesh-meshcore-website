# Step 1 Execution Plan: Rebuild event admission and burst-safe sequencing

## Goal
Fix the map sound engine so discrete accents are admitted through real dedupe/token-bucket/coalescing decisions while density still responds to busy traffic.

## Current Code Observations
- `corescope-overlay/denvermc-sound.js` already has density ingestion, token buckets, dedupe state, a bounded music queue, active voice caps, and diagnostics.
- `routeEvent` currently computes `accentAllowed = acceptDedupe(event, now) && acceptBucket(event, now)` but calls `markPlayed(event)` regardless, so dedupe/throttle counters do not actually gate cue playback.
- `enqueueMusicalEvent` always records `coalesced: false`; existing queue trimming increments `sequencerState.coalesced` but there is no explicit burst-summary cue path.
- `tests/e2e/smoke.spec.ts` includes a test that currently asserts same-id deduped events all schedule; this encodes the bug and must change.
- Existing sound tests use a fake AudioContext and inspect `window.__coloradoMeshSound.getState()`, which is the right verification seam for Step 1.

## Files to Change
- `corescope-overlay/denvermc-sound.js` — add structured admission, coalescing/burst summary state, bounded queue diagnostics, and route gating.
- `tests/e2e/smoke.spec.ts` — update/add map sound tests for dedupe/coalescing and bounded burst behavior.
- `.forge/steps/step-1-plan.md` — this execution plan.
- `.forge/reviews/claude-step-1.json` — review output after staging.

## Ordered Implementation Checklist
1. Add admission/coalescing diagnostics to counters and sequencer state without removing existing fields.
2. Add a small bounded coalescing state keyed by lane/type that can summarize repeated denied accents into occasional burst events.
3. Change `enqueueMusicalEvent`/`markPlayed` to accept cue metadata such as `coalesced`, `burstCount`, and `admissionReason`.
4. Replace `routeEvent` playback logic so dedupe/token-bucket denial prevents one-to-one enqueueing and only an allowed or coalesced burst cue can schedule.
5. Update the same-id Playwright test to assert bounded scheduling and coalescing instead of expecting every duplicate to play.
6. Add or strengthen a burst test so density rises, routed/ingested counts remain correct, and queue/voices/timers stay bounded.
7. Run targeted map sound Playwright tests and lint for the touched test file.
8. Stage specific files, run Forge reviewer, address findings, and commit Step 1.

## Interfaces and Data Contracts
- Public API remains `window.__coloradoMeshSound` and compatibility alias `window.__denvermcMapSound`.
- `getState()` keeps existing fields and may add `counters.admitted`, `counters.coalesced`, `counters.burstAccents`, `counters.queueTrimmed`, and `sequencer.lastAdmission`/`lastBurst`.
- `routeEvent(event)` and `injectTestEvent(eventOrPacket)` remain public and return booleans.
- Sound events remain metadata-only and use existing fields: id, type, priority/emergency/replay flags, observationCount, hopCount, intensity, seed, timestamp.

## Verification Plan
- Automated: `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "map sound"`
- Automated: `npm run lint -- tests/e2e/smoke.spec.ts`
- Regression: Sound Off default, gesture unlock, density updates, upstream audio suppression, and cleanup caps must still pass existing map sound smoke tests.
- Manual: Use the public sound API in a browser harness to inject a burst and confirm diagnostics show density plus bounded coalesced accents.

## Stop Conditions
- Pause if the change would require adding UI controls or changing mode names.
- Pause if the current test harness cannot observe the new admission behavior without major non-audio UI rewrites.
- Pause if fixing admission requires changing the public sound API shape instead of only adding diagnostics.
