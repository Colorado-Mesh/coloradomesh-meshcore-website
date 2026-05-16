# Forge Implementation Plan

## Overview
Fix the Colorado Mesh CoreScope map by replacing the current packet-drop sound behavior with a density-driven, AudioWorklet-backed sound engine and by polishing the mobile/portrait overlay with a bottom-sheet sound UI and the new site-wide Colorado Mesh logo. The work stays in the existing overlay/patch layer, preserves the single Docker container, keeps sound browser-local/opt-in/metadata-only, and avoids `vendor/CoreScope` edits.

## Technical Decisions
- Keep integration in `corescope-overlay/` and `scripts/apply-corescope-overlay.mjs`; never edit `vendor/CoreScope` directly. Research: ITEM-stack-1, ITEM-architecture-7, ITEM-prior-art-3.
- Use native Web Audio with an AudioWorklet for the continuous density bed because the user explicitly chose Worklet. Keep a bounded non-Worklet fallback for browsers that lack `audioWorklet`. Research: ITEM-stack-6, ITEM-architecture-5; user Q&A decision 11.
- Keep all modes user-selectable: Sound Off, Native+, Generative Key, Orchestral Ensemble, Space Blaster. Retune them so each uses aggregate density and capped accents instead of one cue per packet. User Q&A decision 2.
- Use a procedural Web Audio bed as the always-on sound foundation; orchestral samples remain optional bounded accents. User Q&A decision 9.
- Every valid metadata-only event must feed rolling density before any accent cap/drop. Dropping an accent must never make a busy map quieter. Research: ITEM-pitfalls-1, ITEM-architecture-1, ITEM-prior-art-1.
- Do not pass message text, decoded message bodies, raw payload bytes, or `raw_hex` into sound mapping. Use only metadata such as id/hash, packet type, channel metadata, observations, hops, timestamps, and visible priority/emergency flags. Research: ITEM-architecture-4, ITEM-pitfalls-7; user Q&A decisions 6 and 9.
- On portrait/mobile, top bar must collapse: brand plus compact controls remain visible; mode/volume/details move into a bottom sheet. User Q&A decision 3.
- Visual/mobile/logo file edits must be delegated to native Opus UI via `co-ui` from this Codex-backed session.
- Vendor the new logo locally from `https://github.com/Colorado-Mesh/icons/blob/main/color/mesh-color.png` and update same-origin references across the site. User Q&A decision 4.

## Implementation Steps

### Step 1: Replace drop-first sound routing with metadata-only density ingestion and AudioWorklet bed
**Goal:** Make high traffic sound fuller/denser instead of stopping or thinning out, while preserving opt-in unlock and metadata-only privacy.
**Why now:** The current user-facing failure is in `corescope-overlay/denvermc-sound.js`: dedupe/token buckets/cooldowns run before playback and dropped events do not contribute to any aggregate sound.
**Dependencies:** Existing overlay sound API and CoreScope `MeshAudio.sonifyPacket` interception.
**Files:**
- `corescope-overlay/denvermc-sound.js`
- `corescope-overlay/sound/denvermc-density-worklet.js` (new static worklet module copied by existing `/sound/` directory copy)
**Existing code to inspect first:**
- `corescope-overlay/denvermc-sound.js`: `ensureAudioContext`, `setMode`, `normalizePacket`, `routeEvent`, `acceptDedupe`, `acceptBucket`, `scheduleModeCue`, `playNative`, `playGenerative`, `playEnsemble`, `playBlaster`, `getState`
- `scripts/apply-corescope-overlay.mjs`: existing recursive `sound/` copy behavior
**Implementation plan:**
1. Replace raw-byte intensity derivation in `normalizePacket` with metadata-only intensity/seed inputs; remove `rawHexFromPacket`/`byteAt` from the sound mapping path or keep them unused outside forbidden-field rejection.
2. Add a pure internal `TrafficModel` section that records every valid `SoundEvent` into short rolling buckets by lane/type, including replay/historical events with a softer/replay flag when detectable.
3. Change `routeEvent` order so unlocked/on events always update `TrafficModel` before dedupe/accent caps; dedupe/throttle only controls optional accents and counters.
4. Add `corescope-overlay/sound/denvermc-density-worklet.js` implementing a bounded continuous procedural bed with AudioParams for density, priority, mode palette, and output gain.
5. In `ensureAudioContext`, load the worklet after user gesture unlock, create one `AudioWorkletNode`, connect it through explicit bed/accent/master buses, and expose worklet status in `getState()`.
6. Add a scheduler loop that periodically snapshots `TrafficModel` and updates worklet params using `audioCtx.currentTime`; stop it cleanly on Off, closed context, or mode change as needed.
7. Retune `playNative`, `playGenerative`, `playEnsemble`, and `playBlaster` as capped accents over the bed rather than the primary sound; use density to vary palette/rhythm but keep active source caps.
8. Ensure `stopAllScheduledCues`, mode changes, `suspendAudioContext`, and audio state changes clean up worklet nodes, timers, sources, and counters without leaking or auto-resuming.
**Contracts and interfaces:**
- Existing public API remains: `window.__coloradoMeshSound.getModeOptions()`, `getState()`, `setMode(mode,{userGesture})`, `setVolume(value)`, `isUnlocked()`, `subscribe(listener)`, `normalizePacket(pkt)`, `routeEvent(event)`, `injectTestEvent(eventOrPacket)`, `suppressCoreScopeAudio()`.
- `getState()` gains diagnostic data such as `traffic`, `worklet`, `scheduledSlices`, and accent drop counters for tests.
- Worklet static URL: `/sound/denvermc-density-worklet.js?v=denvermc` or equivalent same-origin path under `/sound/`.
**State/data changes:** Browser localStorage keys remain unchanged. No server, DB, Docker env, or secret changes.
**Edge cases:** AudioWorklet unavailable; worklet module load failure; mode switched before module load resolves; locked/off state; repeated packet IDs; high burst traffic; hidden tab/suspended context; replay traffic; sample manifest unavailable.
**Acceptance criteria:**
- Synthetic high traffic increases density counters/bed gain instead of increasing `lastDroppedReason` as the dominant result.
- Off/locked still produces no audio and creates/resumes no AudioContext outside explicit user gesture.
- Message text/raw payload changes cannot alter normalized sound event fields or density mapping.
- Active sources/timers stay bounded under burst load.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- Targeted Playwright sound tests added in Step 2
**Manual validation:** Use local Docker/browser map, enable each sound mode, inject or wait for busy traffic, confirm high traffic feels fuller rather than silent/thin.
**Risks:** Worklet load can fail on unsupported browsers; mitigate with bounded fallback and diagnostics. Privacy regression through raw payload use; mitigate with tests. Runaway nodes under bursts; mitigate with source/timer caps.
**Out of scope for this step:** Mobile visual polish and logo replacement.

### Step 2: Add sound regression tests for density, privacy, modes, and high-traffic caps
**Goal:** Lock in the new behavior so future changes cannot reintroduce “busy traffic goes silent.”
**Why now:** Step 1 changes core behavior and needs tests before visual/mobile changes.
**Dependencies:** Step 1 sound API diagnostics.
**Files:**
- `tests/e2e/smoke.spec.ts`
- Optional test fixture helpers inside the same file unless a shared helper already exists
**Existing code to inspect first:**
- `tests/e2e/smoke.spec.ts`: `mountMapSoundOverlay`, `getSoundState`, existing sound tests
- `corescope-overlay/denvermc-sound.js`: new diagnostics from Step 1
**Implementation plan:**
1. Extend the harness to stub or allow AudioWorklet behavior deterministically in Chromium without requiring real audible output.
2. Add a synthetic high-traffic test that injects dozens of metadata events quickly and asserts density/ingested counters rise even when accent caps/drop counters rise.
3. Add a privacy test proving `raw_hex`, decoded payload text, and message-body changes do not affect normalized output fields used for sound.
4. Add mode routing tests for Native+, Generative Key, Orchestral Ensemble, and Space Blaster asserting each mode remains selectable, locked until gesture, and reports expected mode/worklet state after gesture simulation where practical.
5. Add cap/cleanup assertions that active sources/timers/worklet state remain bounded after a burst and after switching to Off.
6. Keep existing upstream CoreScope audio suppression tests passing.
**Contracts and interfaces:** Tests should use only public `__coloradoMeshSound` API and visible DOM controls, not private closure internals.
**State/data changes:** None outside browser localStorage in test context.
**Edge cases:** Headless Chromium may not produce real AudioWorklet audio; tests should validate control flow/counters without relying on speakers.
**Acceptance criteria:**
- Automated tests fail if high traffic only increments dropped/throttled counters without aggregate density.
- Automated tests fail if raw payload or decoded text influences normalized sound metadata.
- Existing sound default/persistence/suppression coverage remains intact.
**Verification commands:**
- `PLAYWRIGHT_PORT=4323 npx playwright test tests/e2e/smoke.spec.ts --project=chromium --workers=1 --grep "map sound"`
- `npm run lint`
- `npm run typecheck`
**Manual validation:** Brief browser harness run to inspect `window.__coloradoMeshSound.getState()` after bursts.
**Risks:** Over-specific tests could couple to implementation details; mitigate by asserting public diagnostics and behavior only.
**Out of scope for this step:** Mobile layout screenshots and logo assets.

### Step 3: Delegate mobile/portrait overlay polish and site-wide logo update to Opus UI
**Goal:** Make the map overlay/top bar/sound controls/focus/minimal UI polished on 320–430px portrait screens and update the logo everywhere to the new vendored Colorado Mesh icon.
**Why now:** Visual UI implementation is required, but this Codex-backed session must delegate frontend visual work to Opus UI.
**Dependencies:** Sound controls and state from Steps 1–2.
**Files likely touched by Opus UI:**
- `corescope-overlay/denvermc-shell.js`
- `corescope-overlay/denvermc-shell.css`
- `corescope-overlay/denvermc-sound.js` only if UI state labels need small API support
- `public/brand/**` and/or a new same-origin logo path under `public/brand/`
- `src/lib/constants.ts`
- `src/app/layout.tsx`
- `src/components/brand/BrandMark.tsx`
- `public/manifest.json`
- `tests/e2e/smoke.spec.ts`
- Favicon/apple-touch icon files if the new logo asset should replace existing generated icon outputs
**Existing code to inspect first:**
- `corescope-overlay/denvermc-shell.js`: `buildSoundControls`, `syncSoundControls`, `buildTopbar`, mode/focus application
- `corescope-overlay/denvermc-shell.css`: topbar, sound controls, mobile breakpoints, focus mode offsets
- `src/lib/constants.ts`: `BRAND.logoPath`, `BRAND.iconPath`
- `src/app/layout.tsx`: metadata icons/OpenGraph/Twitter
- `public/manifest.json`: PWA icon paths
**Implementation plan:**
1. Run `co-ui` with a concise handoff asking Opus UI to implement the portrait bottom-sheet sound control, compact topbar, polished 320–430px layout, focus/minimal/analyzer collision fixes, and site-wide logo replacement from the provided GitHub source as a local asset.
2. Require Opus UI to keep user-facing labels as Colorado Mesh, preserve existing sound API behavior, and avoid vendor/CoreScope edits.
3. Review Opus changes for scope, security, and compliance with same-origin logo delivery.
4. Ensure the new bottom sheet has accessible labels, keyboard Escape/backdrop close behavior, focus management that does not trap map use unnecessarily, and quiet sound state announcements.
5. Ensure portrait CSS uses safe-area/dynamic viewport primitives and maintains practical 44px touch targets at 320, 360, 390/393, and 430px widths.
6. Update/extend Playwright expectations for new logo path and mobile sound sheet/open states.
**Contracts and interfaces:**
- Mobile topbar: compact sound trigger remains reachable in minimal/analyzer live views.
- Bottom sheet: contains mode select, volume slider, status; closes via explicit control/Escape/backdrop; does not appear in focus mode unless a deliberate sound affordance remains.
- Logo: same-origin local asset path becomes the site-wide source of truth through constants and overlay shell.
**State/data changes:** Browser localStorage sound keys remain unchanged. Logo assets are vendored static files.
**Edge cases:** 320px portrait; safe-area notches; focus mode; analyzer route; sheet open while route changes; image load failure; old cached favicon/root icon consumers.
**Acceptance criteria:**
- 320–430px portrait screenshots show no overlapping topbar/sound controls/map chrome.
- Sound mode and volume are reachable in the bottom sheet on mobile.
- Desktop topbar remains usable and not regressed.
- New logo appears in main site navigation, map overlay, metadata/manifest icons where practical, and tests reference the new local path.
**Verification commands:**
- `PLAYWRIGHT_PORT=4324 npx playwright test tests/e2e/smoke.spec.ts --project=chromium --workers=1 --grep "map sound|mobile|logo"`
- Browser screenshot checks at 320, 360, 390, and 430px portrait via Chrome DevTools or Playwright
- `npm run lint`
- `npm run typecheck`
**Manual validation:** Open local Docker map in portrait widths, inspect minimal/analyzer/focus, open/close sound sheet, check map drag/zoom remains usable.
**Risks:** UI delegation may alter sound behavior accidentally; mitigate by running Step 2 tests after Opus changes. Remote logo reference could be introduced accidentally; require local asset and same-origin references.
**Out of scope for this step:** Further sound engine tuning beyond small API support for UI labels.

### Step 4: Full integration verification, Docker smoke, listening pass, and Forge reviews
**Goal:** Prove the combined sound engine, mobile UI, logo update, and Docker overlay integration work together before committing/releasing.
**Why now:** The failures are cross-step and subjective/behavioral, so final verification must include browser and listening checks, not just unit tests.
**Dependencies:** Steps 1–3 complete.
**Files:**
- `.forge/steps/step-4-plan.md`
- `.forge/reviews/claude-step-4.json`
- `.forge/reviews/final-claude-review.json`
- Possibly `scripts/docker-smoke.mjs` if static worklet/logo routes need smoke guards
- Possibly `README.md` only if operator-visible behavior changes need documentation
**Existing code to inspect first:**
- `scripts/docker-smoke.mjs`: existing overlay and sound static asset checks
- `docker/nginx.conf`: `/sound/` and static asset routes
- `.forge/PLAN.md` and prior step review artifacts
**Implementation plan:**
1. Extend Docker smoke if needed to fetch the new worklet module and new logo static path without exposing secrets.
2. Run targeted sound/mobile tests, then full lint/type/unit/e2e as practical.
3. Build Docker image and run `npm run docker:smoke -- --image <local-tag>`.
4. Start or reuse a local Docker container and perform a 5–10 minute live or synthetic busy-traffic listening/browser check across all modes, especially high traffic.
5. Use browser/mobile viewport checks at 320, 360, 390/393, and 430px portrait for minimal, analyzer, focus, and sound sheet states.
6. Run Forge final reviewer on all changes since `.forge/.base-ref`, fix findings if any, then produce final summary.
**Contracts and interfaces:** Docker image still serves `/map`, overlay scripts/styles, `/sound/` assets/worklet, and same-origin logo assets through nginx/CoreScope/Next as applicable.
**State/data changes:** None.
**Edge cases:** Docker build cache stale overlay assets; worklet route missing from CoreScope public; browser audio unavailable; deployed-like env with encoded tile placeholders; local test container port conflicts.
**Acceptance criteria:**
- Docker smoke passes including worklet/logo static fetches if added.
- Mobile portrait visual checks pass without overlap.
- Busy traffic audibly gets fuller/denser; it does not stop just because packet rate increases.
- Final Forge review is approved.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `PLAYWRIGHT_PORT=4325 npx playwright test tests/e2e/smoke.spec.ts --project=chromium --workers=1`
- `docker build -t colorado-meshcore-site:sound-mobile-fix .`
- `npm run docker:smoke -- --image colorado-meshcore-site:sound-mobile-fix`
- `git diff --check`
**Manual validation:** 5–10 minute listening pass with synthetic or live traffic; portrait browser checks at target widths; confirm old CoreScope audio controls remain suppressed.
**Risks:** Subjective sound quality may still need tuning after first browser pass; mitigate by retaining mode-specific palette constants that can be adjusted without architecture churn.
**Out of scope for this step:** Publishing a release unless the user asks after completion.

## Cross-Step Integration Checks
- Worklet module is copied into the CoreScope public output by existing overlay copy flow and served inside Docker.
- Sound remains default Off and localStorage-compatible with existing users.
- Saved non-off mode still renders selected but locked until explicit user click/tap.
- CoreScope upstream audio controls remain suppressed and cannot double-play.
- Mobile bottom sheet does not block map drag/zoom except while directly interacting with controls.
- New logo path is consistent across constants, overlay, metadata, manifest, favicon/apple-touch outputs where updated, and tests.
- No secret values are printed, committed, screenshotted, or documented.

## Testing Strategy
- Automated browser tests for sound state, density under burst traffic, privacy boundary, mode selection, upstream suppression, mobile sheet behavior, and logo path.
- Lint/type/unit checks for project integrity.
- Docker build/smoke to verify overlay asset copy, `/sound/` worklet/sample routing, map runtime, APIs, WebSocket, and static logo route.
- Manual browser checks for mobile/portrait visual polish and map interaction.
- 5–10 minute listening pass for low/normal/high/burst traffic quality and fatigue.

## Out of Scope
- Editing `vendor/CoreScope` directly.
- Adding backend services, database schema changes, new Docker services, or server-side sound processing.
- Using message text, decoded message bodies, raw payload bytes, or `raw_hex` for sound mapping.
- Committing, printing, or documenting secrets.
- Removing any existing user-selectable sound mode.
