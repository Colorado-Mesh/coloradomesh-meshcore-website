# Forge Implementation Plan

## Overview
Rebuild the Colorado Mesh live map sound experience inside the existing CoreScope overlay so most traffic can produce musical, bounded accents, Orchestral Ensemble feels like a large cinematic palette instead of a tiny sample loop, and Space Blaster becomes a procedural musical sci-fi mode instead of harsh arcade noise. The implementation preserves the current public sound API, current visible mode names, current controls, browser-local/user-triggered playback, metadata-only sound generation, and same-origin Docker/static asset delivery.

## Technical Decisions
- Keep the implementation in `corescope-overlay/denvermc-sound.js` and `corescope-overlay/sound/**`; do not move sound into Next routes or edit `vendor/CoreScope` directly. Research refs: ITEM-stack-6, ITEM-architecture-1, ITEM-prior-art-1.
- Keep native Web Audio and the existing AudioWorklet density bed; do not add Tone.js/howler/SoundFont frameworks. Research refs: ITEM-stack-1, ITEM-stack-2, ITEM-prior-art-2, ITEM-architecture-8.
- Preserve `window.__coloradoMeshSound`, `window.__denvermcMapSound`, mode values, volume/localStorage behavior, upstream CoreScope audio suppression, and user gesture unlock. Research refs: ITEM-architecture-3, ITEM-pitfalls-1, ITEM-pitfalls-12.
- Treat most traffic as eligible for audible accents per user decision, but group/coalesce high-rate duplicates and bursts so the system remains bounded. Density ingestion continues for all accepted metadata events. Research refs: ITEM-architecture-4, ITEM-pitfalls-2, ITEM-pitfalls-6; user Q&A decisions 1, 14.
- Make Orchestral Ensemble big cinematic: more role diversity, multi-layer cue templates, larger busy-burst accents, and legally redistributable samples with manifest license/source/attribution metadata. Research refs: ITEM-stack-4, ITEM-architecture-6, ITEM-pitfalls-3, ITEM-prior-art-4, ITEM-prior-art-5; user Q&A decisions 2, 4, 5, 6, 15.
- Keep Space Blaster procedural and musical: centered mono/stereo-identical output, smooth envelopes, musical intervals, lower resonance, restrained noise, and no sample dependency. Research refs: ITEM-architecture-9, ITEM-pitfalls-7, ITEM-prior-art-12; user Q&A decisions 7, 9.
- Do not add visible controls or rename modes. User-facing copy must continue to say Colorado Mesh. User Q&A decisions 10, 16.
- Validate with automated invariants plus 5–10 minutes of quiet/busy manual listening in Orchestral Ensemble and Space Blaster. Research refs: ITEM-stack-9, ITEM-architecture-13, ITEM-pitfalls-14; user Q&A decision 13.

## Implementation Steps

### Step 1: Rebuild event admission and burst-safe sequencing
**Goal:** Make the sound engine correctly route most traffic into bounded musical cue phrases, with density updates for all accepted metadata events and no unlimited one-cue-per-packet behavior under bursts.

**Why now:** The current code computes `accentAllowed = acceptDedupe(event, now) && acceptBucket(event, now)` but calls `markPlayed(event)` regardless. That means dedupe/token buckets report drops without actually gating cue enqueueing, which must be fixed before making sounds richer.

**Dependencies:** Existing `corescope-overlay/denvermc-sound.js`; existing Playwright harness in `tests/e2e/smoke.spec.ts`; no new packages.

**Files:**
- `corescope-overlay/denvermc-sound.js` — rewrite event admission, cue coalescing, burst metadata, and diagnostics.
- `tests/e2e/smoke.spec.ts` — update/add map sound tests for admission, coalescing, density, counters, and bounded queue/voice behavior.
- `.forge/steps/step-1-plan.md` — step execution plan.
- `.forge/reviews/claude-step-1.json` — Claude review artifact.

**Existing code to inspect first:**
- `corescope-overlay/denvermc-sound.js`: `routeEvent`, `acceptDedupe`, `acceptBucket`, `enqueueMusicalEvent`, `drainMusicQueue`, `scheduleModeCue`, `trafficState`, `counters`, `sequencerState`.
- `tests/e2e/smoke.spec.ts`: `installAudioProbe`, `injectSoundBurst`, `map sound density keeps rising...`, `map sound schedules every same-id...`, cleanup tests.

**Implementation plan:**
1. Replace the current boolean-only dedupe/bucket path with an admission decision helper that returns structured outcomes such as `play`, `coalesce`, or `drop`, including a reason and lane.
2. Keep `ingestTraffic(event, now)` and density output before accent admission so busy traffic still increases bed density even when individual accents are coalesced or capped.
3. Change `routeEvent` so discrete cue enqueueing only happens when admission allows playback or when a coalesced burst summary should be scheduled.
4. Add burst/coalescing state keyed by lane/type so repeated same-id or high-rate events can become rhythmic phrase/burst cues instead of either total silence or unbounded repeated cues.
5. Update `musicQueue` handling to preserve hard queue limits, cap per-drain scheduling, and record coalesced/burst metadata in `sequencerState.lastCue`.
6. Add diagnostics for `admitted`, `coalesced`, `burstAccents`, `queueTrimmed`, and drop reasons while keeping existing counters meaningful.
7. Update tests so same-id rapid events no longer assert every duplicate schedules individually; assert density rises, dedupe/coalescing counters increase, queued/scheduled cues stay bounded, and most mixed unique traffic still produces audible scheduled cues.
8. Preserve all public API methods and existing control behavior.

**Contracts and interfaces:**
- `window.__coloradoMeshSound.getState()` remains callable and backward-compatible; it may add diagnostic fields but must not remove existing fields used by tests/UI.
- `routeEvent(event)` and `injectTestEvent(eventOrPacket)` remain public and return booleans.
- Sound events remain metadata-only: `id`, `type`, priority flags, replay flag, observation/hop counts, intensity, seed, timestamp.

**State/data changes:**
- Add bounded in-memory coalescing/burst state inside the IIFE.
- Add diagnostics fields to counters/sequencer state.
- No persistent storage changes.

**Edge cases:**
- Sound mode off, locked, unavailable, or suspended still rejects playback and does not create audio nodes.
- Duplicate events should not fill `musicQueue`, but should still contribute to density.
- Busy bursts should produce larger/denser musical phrase cues without exceeding `MUSIC_QUEUE_MAX`, active voice caps, or cleanup timer limits.
- Replay/historical events keep lower density contribution and must not dominate live bursts.

**Acceptance criteria:**
- The known gating bug is fixed: deduped/throttled/coalesced events do not enqueue a one-to-one accent.
- Mixed unique traffic in an unlocked non-off mode schedules audible cues.
- Burst traffic keeps `activeVoices`, queue length, scheduled sources, scheduled nodes, and cleanup timers bounded.
- Density rises under burst traffic even when individual accents are coalesced or dropped.
- Existing sound controls still default off, unlock by gesture, and suppress upstream CoreScope audio.

**Verification commands:**
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "map sound"`
- `npm run lint -- tests/e2e/smoke.spec.ts`

**Manual validation:**
- In a browser/dev harness, switch to `Generative Key` and inject a 50–100 event burst; confirm state diagnostics show density, bounded cue counts, and coalesced burst behavior.

**Risks:**
- Real verified risk: current `routeEvent` ignores `accentAllowed`, making throttling ineffective. Research refs: ITEM-pitfalls-2, ITEM-architecture-4.
- Real verified risk: existing tests currently encode the buggy behavior by expecting same-id deduped events to schedule every cue; those tests must change with the intended behavior.

**Out of scope for this step:**
- Adding new samples.
- Changing Orchestral/Blaster timbre beyond what is needed for cue metadata compatibility.
- UI/control redesign.

### Step 2: Expand and validate the orchestral sample manifest
**Goal:** Replace the tiny four-sample Orchestral Ensemble palette with a richer legally redistributable role-balanced manifest so the mode no longer feels like two repeated samples.

**Why now:** The engine needs sample variety before the cinematic orchestral preset can be tuned meaningfully.

**Dependencies:** Step 1 diagnostics and routing; existing same-origin `/sound/orchestral/**` delivery; legal redistributable sample sources approved by user.

**Files:**
- `corescope-overlay/sound/orchestral/manifest.json` — schema-compatible richer manifest with roles, variants, license/source/attribution metadata, and optional cue metadata.
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` — attribution/license updates for every bundled asset.
- `corescope-overlay/sound/orchestral/samples/**` — added/updated short orchestral one-shot samples.
- `scripts/docker-smoke.mjs` — strengthen manifest role diversity and sample field checks.
- `tests/e2e/smoke.spec.ts` — update mocked orchestral manifest to reflect richer roles/variants.
- `.forge/steps/step-2-plan.md`, `.forge/reviews/claude-step-2.json`.

**Existing code to inspect first:**
- `corescope-overlay/sound/orchestral/manifest.json` roles `messages`, `node`, `priority`.
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` current FreePats/VSCO entries.
- `corescope-overlay/denvermc-sound.js`: `loadEnsembleManifest`, `sampleById`, `ensembleRoleIds`, `loadedSamplesForRole`, `scheduleSample`.
- `scripts/docker-smoke.mjs`: manifest/sample validations.

**Implementation plan:**
1. Select and vendor a curated set of legally redistributable short orchestral one-shots, prioritizing strings, brass, low percussion, cymbal/swell, mallet/harp, and woodwind colors.
2. Keep files same-origin under `corescope-overlay/sound/orchestral/samples/**`; avoid remote runtime sample loading.
3. Update manifest sample entries with stable IDs, roles, URL, root note/range where pitched, instrument/family/articulation, license, source URL, and attribution.
4. Expand role mappings so high-frequency roles have multiple variants; add additional roles only if the engine can use them without breaking existing roles.
5. Update attribution with exact included file names and source/license details.
6. Strengthen Docker smoke checks to require valid role mappings, non-empty assets, required attribution fields, and multiple variants for high-frequency roles.
7. Update Playwright mocked manifest used by audio tests so it exercises role diversity without relying on real audio decode quality.
8. Keep manifest backward-compatible with current loader where practical; new fields should be additive.

**Contracts and interfaces:**
- Manifest remains JSON served at `/sound/orchestral/manifest.json` with top-level `version`, `samples`, and `roles`.
- Existing `id`, `url`, `rootNote`, `minMidi`, `maxMidi`, `license`, `sourceUrl`, and `attribution` fields remain valid.
- Runtime sample URLs remain same-origin `/sound/orchestral/...` paths.

**State/data changes:**
- Adds binary audio assets to the repository.
- Expands manifest metadata.
- No localStorage or API changes.

**Edge cases:**
- A missing/failed sample should degrade to other samples or procedural fallback, not break the mode.
- Role mappings must not reference missing IDs.
- Large sample count must not force per-event fetch/decode; loader must still cache decoded buffers.

**Acceptance criteria:**
- Orchestral manifest has a noticeably larger role-balanced sample set than the current four samples.
- Every sample is non-empty, same-origin, and has license/source/attribution metadata.
- Docker smoke validates all manifest samples and role mappings.
- Existing mode labels and controls remain unchanged.

**Verification commands:**
- `node scripts/docker-smoke.mjs --image colorado-meshcore-audio-smoke` after a local image is built in the final integration step.
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Orchestral Ensemble|orchestral|map sound"`
- `npm run lint -- scripts/docker-smoke.mjs tests/e2e/smoke.spec.ts`

**Manual validation:**
- Inspect `/sound/orchestral/manifest.json` and a few sample URLs in the browser/network panel after overlay application or Docker smoke.

**Risks:**
- Real verified risk: the current manifest has only four samples and two message samples, matching the user’s complaint. Research refs: ITEM-stack-4, ITEM-pitfalls-3.
- Real verified risk: sample licensing must be tracked because manifest/attribution already carry legal metadata. Research refs: ITEM-pitfalls-13.

**Out of scope for this step:**
- Full audio-library bundling.
- Runtime fetching from external audio CDNs.
- Space Blaster redesign.

### Step 3: Rewrite Orchestral Ensemble as cinematic cue templates
**Goal:** Make Orchestral Ensemble sound big, musical, and varied by mapping event/burst metadata into cinematic layered phrases using the expanded manifest.

**Why now:** Step 2 provides the palette; this step makes the engine use it musically.

**Dependencies:** Steps 1 and 2; existing Web Audio sample cache and sequencer.

**Files:**
- `corescope-overlay/denvermc-sound.js` — ensemble role selection, cinematic templates, sample round-robin, harmonic mapping, burst/priority layers, gains/envelopes, diagnostics.
- `tests/e2e/smoke.spec.ts` — expand orchestral tests for role/sample diversity, key safety, burst layering, and bounded active voices.
- `.forge/steps/step-3-plan.md`, `.forge/reviews/claude-step-3.json`.

**Existing code to inspect first:**
- `chooseEnsembleRole`, `loadedSamplesForRole`, `loadedSampleForRole`, `noteForEnsembleEvent`, `scheduleSample`, `fallbackEnsemble`, `playEnsemble`, `ENSEMBLE_SCALE`, `ENSEMBLE_CHORD`, `sequencerState.recentSampleIds`.
- Tests around `map sound Orchestral Ensemble rotates message samples...`.

**Implementation plan:**
1. Replace the narrow role mapping with a data-driven event-to-orchestral-intent helper that considers lane, type, intensity, observation/hop counts, replay, and burst/coalesced metadata.
2. Define cinematic cue templates for normal traffic, low/node traffic, message traffic, priority events, and busy bursts; templates can layer transient/body/support/swell roles while obeying max layers.
3. Use expanded manifest role pools with deterministic round-robin/seeded variation so repeated events rotate samples and notes predictably.
4. Keep all notes in the chosen scale/key and clamp pitched sample playback to each sample’s valid range.
5. Add gain staging/envelope values that allow bigger cinematic accents while avoiding clipping and excessive tails.
6. Add diagnostics for recent ensemble roles/templates/sample IDs so tests and listening can confirm variety.
7. Ensure fallback behavior remains available when manifest or samples fail, but prefer other loaded role samples before procedural fallback.
8. Update tests to assert more than two recent sample IDs/roles for representative traffic, valid pitch classes, bounded voices, and busy-burst template use.

**Contracts and interfaces:**
- `playEnsemble(event, options)` remains internal and called through `playCurrentMode`.
- Manifest fields from Step 2 are consumed additively; older minimal manifests still degrade gracefully.
- Public diagnostics may add `sequencer.recentEnsembleRoles`/`recentTemplates` but existing diagnostics remain.

**State/data changes:**
- Adds in-memory template/sample selection state.
- No persistent data changes.

**Edge cases:**
- Manifest loaded but only some samples decode.
- Busy bursts should sound bigger but cannot exceed voice/layer caps.
- Replay traffic should be slightly less dominant than live traffic.
- User switching Off during long release tails must stop scheduled sources/nodes promptly.

**Acceptance criteria:**
- Orchestral tests show varied sample IDs/roles across representative traffic.
- Busy traffic can trigger larger cinematic accents without unbounded voices or timers.
- Pitch classes remain musical and sample playback stays inside declared sample ranges.
- Manual listening finds Orchestral Ensemble clearly richer and less repetitive than the current four-sample implementation.

**Verification commands:**
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Orchestral Ensemble|map sound burst cleanup|map sound density"`
- `npm run lint -- tests/e2e/smoke.spec.ts`

**Manual validation:**
- In Chromium, select Orchestral Ensemble, inject quiet traffic and then busy traffic, and listen for a cinematic but bounded palette with multiple instrumental colors.

**Risks:**
- Real verified risk: richer layers can clip or leave dangling nodes if cleanup/gain staging is not bounded. Research refs: ITEM-pitfalls-6, ITEM-pitfalls-9, ITEM-architecture-11.
- Real verified risk: tests alone cannot judge musical quality; manual listening is required. Research refs: ITEM-pitfalls-14.

**Out of scope for this step:**
- Changing controls or mode names.
- Adding panning.
- Reworking Space Blaster.

### Step 4: Redesign Space Blaster as procedural musical sci-fi
**Goal:** Replace harsh Space Blaster patches with centered, musical, procedural sci-fi accents that remain distinct from Orchestral Ensemble and pleasant under normal and busy traffic.

**Why now:** Engine admission and orchestral architecture are in place, so Space Blaster can reuse the same bounded sequencing and diagnostics.

**Dependencies:** Step 1 cue metadata and caps; existing procedural Web Audio helpers.

**Files:**
- `corescope-overlay/denvermc-sound.js` — blaster patch data, oscillator/filter/noise scheduling, envelopes, diagnostics, gain staging.
- `corescope-overlay/sound/denvermc-density-worklet.js` — adjust blaster bed color only if it is contributing to harshness.
- `tests/e2e/smoke.spec.ts` — update blaster tests for musical frequency ranges, filter Q bounds, envelope/cue diagnostics, no panning, and bounded bursts.
- `.forge/steps/step-4-plan.md`, `.forge/reviews/claude-step-4.json`.

**Existing code to inspect first:**
- `playBlaster`, `scheduleTone`, `scheduleNoiseBurst`, `getNoiseBuffer`, `rememberSequencerValue`, `sequencerState.recentBlasterPitches`, `modeWorkletValue`, density worklet mode handling.
- Test `map sound Space Blaster keeps pitch movement in a narrow usable range`.

**Implementation plan:**
1. Replace ad hoc blaster constants with named patch templates for low, normal, priority, and busy-burst events.
2. Use musical scales/intervals and lower base frequencies; avoid harsh saw/square defaults for common traffic.
3. Lower filter resonance/Q, smooth attacks/releases, and keep noise layers short and low-gain.
4. Reserve brighter/more dramatic motion for priority or busy-burst accents while keeping normal traffic clean and concise.
5. Keep all blaster output centered; do not introduce panner nodes.
6. Add diagnostics for patch name, base/end frequencies, semitone glide, filter Q, noise use, and duration ranges.
7. Tune the density worklet’s blaster mode if its bed is too sharp or thin under busy traffic.
8. Update tests to assert blaster frequencies/glides/Q/durations stay within musical bounds and burst cleanup remains bounded.

**Contracts and interfaces:**
- Mode value remains `blaster`; label remains `Space Blaster`.
- No new samples or controls for Space Blaster.
- Public API/state remains backward-compatible with added diagnostics only.

**State/data changes:**
- Adds in-memory blaster patch/template diagnostics.
- No persistent data changes.

**Edge cases:**
- Busy bursts must not create stacked high-Q noise blasts.
- Priority cues can be stronger but still bounded and not full-spectrum harsh.
- Off/mode switch cleanup must stop active oscillator/noise nodes.

**Acceptance criteria:**
- Space Blaster tests confirm musical ranges, low Q bounds, short durations, and no panner dependency.
- Busy Space Blaster traffic stays bounded by active voice/source/timer caps.
- Manual listening finds Space Blaster meaningfully improved and no longer harsh/fatiguing.

**Verification commands:**
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Space Blaster|map sound burst cleanup|map sound density"`
- `npm run lint -- tests/e2e/smoke.spec.ts`

**Manual validation:**
- In Chromium, select Space Blaster, inject quiet and busy traffic, and listen for musical sci-fi chirps/pulses instead of harsh blasts.

**Risks:**
- Real verified risk: current Space Blaster uses saw/square waves, high-Q filters, and noise bursts for common packets. Research refs: ITEM-pitfalls-7, ITEM-architecture-9.
- Real verified risk: procedural patches can still be fatiguing if burst grouping and voice caps are bypassed. Research refs: ITEM-pitfalls-6, ITEM-pitfalls-9.

**Out of scope for this step:**
- Adding sci-fi sample assets.
- UI redesign or extra controls.

### Step 5: Add final browser coverage and audio acceptance checks
**Goal:** Verify the completed sound rewrite across automated tests, same-origin/Docker asset delivery, Chromium, WebKit/Safari where feasible, and manual listening.

**Why now:** Cross-step integration issues only appear after engine routing, assets, orchestral templates, and blaster patches are assembled.

**Dependencies:** Steps 1–4 complete.

**Files:**
- `playwright.config.ts` — add limited WebKit/Safari-style sound coverage if feasible without duplicating the entire suite.
- `tests/e2e/smoke.spec.ts` — add any final cross-mode diagnostics/listening-harness assertions needed for both modes.
- `scripts/docker-smoke.mjs` — final same-origin sample/worklet checks if not fully covered in Step 2.
- `.forge/steps/step-5-plan.md`, `.forge/reviews/claude-step-5.json`.

**Existing code to inspect first:**
- `playwright.config.ts` current single Chromium project.
- `tests/e2e/smoke.spec.ts` all map sound tests.
- `scripts/docker-smoke.mjs` all `/sound/**` checks.
- `package.json` scripts for build/lint/typecheck/test/e2e/docker smoke.

**Implementation plan:**
1. Decide whether to add a constrained WebKit Playwright project for map-sound tests only, or document/run a WebKit command manually if local browser installation makes config change unsafe.
2. Add final cross-mode tests that exercise Orchestral Ensemble and Space Blaster through the same public control flow and compare diagnostics for mode-specific variety.
3. Ensure Docker smoke validates the expanded sample manifest, worklet URL, overlay script, and attribution after the final asset set.
4. Run the full relevant automated verification suite: lint, typecheck, unit tests, targeted Playwright sound tests, and build.
5. Build a local Docker image and run docker smoke if Docker is available.
6. Start the dev server and use a browser for the required 5–10 minute quiet/busy manual listening check in Orchestral Ensemble and Space Blaster.
7. Capture final verification outcomes in the Forge review prompt and final summary, including any WebKit/Safari limitation if local tooling cannot run it.
8. Do a final branding scan for user-facing `DenverMC` strings introduced by this work and keep visible copy as Colorado Mesh.

**Contracts and interfaces:**
- No new public API required; only diagnostics may expand.
- `npm run test:e2e` should remain reasonable and not unexpectedly duplicate the full suite across WebKit unless explicitly scoped.
- Docker image must continue serving `/map`, `/denvermc-sound.js?v=denvermc`, `/sound/denvermc-density-worklet.js`, `/sound/orchestral/manifest.json`, and all sample URLs.

**State/data changes:**
- Optional Playwright project/config change for WebKit sound smoke.
- No runtime persistence changes.

**Edge cases:**
- WebKit browser binaries may not be installed locally; if unavailable, record that limitation rather than pretending Safari passed.
- Docker may not be running locally; if unavailable, record that limitation and keep non-Docker tests passing.
- Browser manual listening is subjective; use quiet and busy synthetic/event-injection scenarios consistently.

**Acceptance criteria:**
- Targeted map sound Playwright tests pass in Chromium.
- WebKit/Safari path is validated where feasible, or the limitation is explicitly reported.
- Lint/typecheck/unit/build pass.
- Docker smoke passes if Docker is available.
- Manual listening confirms Orchestral Ensemble is big/rich/varied and Space Blaster is musical rather than harsh.

**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "map sound|Orchestral Ensemble|Space Blaster"`
- `npm run build`
- `docker build -t colorado-meshcore-audio-smoke .`
- `npm run docker:smoke -- --image colorado-meshcore-audio-smoke`
- WebKit/Safari where feasible: exact command to be finalized after inspecting local Playwright browser availability during this step.

**Manual validation:**
- Start the dev server or use the built Docker image.
- Open `/map`, select Orchestral Ensemble, listen to quiet synthetic traffic and busy burst traffic for 5–10 minutes total.
- Repeat for Space Blaster.
- Confirm Off stops sound immediately, volume works, and no console/network errors appear for `/sound/**` assets.

**Risks:**
- Real verified risk: current `playwright.config.ts` only defines Chromium, so Safari/WebKit acceptance needs explicit work. Research refs: ITEM-stack-2, ITEM-stack-9.
- Real verified risk: Docker smoke verifies file delivery but not musical quality; manual listening is required. Research refs: ITEM-pitfalls-14.

**Out of scope for this step:**
- Adding new UI controls.
- Full cross-browser matrix beyond Chromium plus feasible WebKit/Safari validation.
- Changing public mode names.

## Cross-Step Integration Checks
- Verify `window.__coloradoMeshSound` and `window.__denvermcMapSound` both still exist and expose the existing methods.
- Verify Sound Off remains default, stored non-off modes are locked until user gesture, and upstream CoreScope audio stays suppressed.
- Verify density bed and discrete accents both respond to busy traffic without unbounded queue/source/timer growth.
- Verify Orchestral Ensemble uses multiple sample roles/IDs and Space Blaster uses procedural patch diagnostics, with no panning added.
- Verify all `/sound/**` files are same-origin, non-empty, reachable in Docker, and license/attribution metadata exists.
- Verify user-facing labels remain Colorado Mesh and current visible mode names are preserved.

## Testing Strategy
- Use Playwright with the existing fake Web Audio probe for deterministic engine diagnostics and bounded-resource assertions.
- Use manifest/Docker smoke checks for static asset delivery and attribution fields.
- Use lint/typecheck/unit/build to catch repo-wide regressions.
- Use Chromium manual browser listening for subjective quality and WebKit/Safari validation where feasible.
- Save every per-step Claude review to `.forge/reviews/claude-step-N.json` and run a final Forge review against the full diff.

## Out of Scope
- Editing `vendor/CoreScope` directly.
- Server-side sound generation or remote runtime audio fetching.
- Adding new sound controls, new visible mode names, or broader UI redesign.
- Using message contents/raw payloads, callsigns, or labels as sound-generation input.
- Adding Tone.js/howler/SoundFont or a separate audio framework.
