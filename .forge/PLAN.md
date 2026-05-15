# Forge Implementation Plan

## Overview
Build an opt-in Colorado Mesh sound layer for the embedded CoreScope live map. The feature will live in the existing overlay system, wrap CoreScope's existing `MeshAudio.sonifyPacket(consolidated)` live packet seam, suppress the old CoreScope audio checkbox/control, add a compact top-bar selector with volume control, persist selected mode and volume locally, and implement Native+, Generative Key, Orchestral Ensemble, and Space Blaster modes. It will also correct the map shell logo and favicon to use the main-site Colorado Mesh branding. The first release will include real, license-safe orchestral samples with provenance metadata and lazy loading, while keeping the old CoreScope submodule untouched.

## Technical Decisions
- Use overlay-owned browser assets rather than editing `vendor/CoreScope` directly. Research and code inspection found the stable live hook at `vendor/CoreScope/public/live.js:2366`, where CoreScope calls `MeshAudio.sonifyPacket(consolidated)`. The overlay can wrap this method after `audio.js` loads. [ITEM-architecture-2, ITEM-pitfalls-10]
- Keep user-facing labels as “Colorado Mesh,” not DenverMC. Existing internal filenames/classes can remain `denvermc-*` to avoid a broad rename unless the touched UI copy is visible. [PROJECT.md Q&A]
- Use the main site’s logo behavior: `BrandMark` uses `SITE_LOGO_PATH`, currently `/brand/linux/256x256.png`, linking to `/` with `${SITE_NAME} — Home`; the overlay top bar should match that asset and behavior. `src/components/brand/BrandMark.tsx:42-49`, `src/components/Navigation.tsx:109-111`, `src/lib/constants.ts:27-42`. [PROJECT.md Q&A]
- Use native Web Audio first, with dependency additions allowed only if the implementation reveals a quality/maintainability need. Stack research preferred no runtime dependency; the user allowed dependencies, but current CoreScope already exposes enough Web Audio infrastructure and adding npm runtime code to static overlay assets would complicate injection. [ITEM-stack-2, ITEM-prior-art-5]
- Persist selected sound mode and volume locally, but do not auto-play audio on page load. On return, show the selected non-off mode visually as muted/locked until a user gesture starts audio for the current session. [ITEM-pitfalls-1, ITEM-pitfalls-2, PROJECT.md Q&A]
- Keep playing when the tab is hidden or route changes if the user enabled sound, per user decision. Still drop/merge low-priority events under load rather than queuing bursts. [PROJECT.md Q&A, ITEM-pitfalls-4]
- Use channel names for priority/emergency accents, especially `#emergency`/emergency-like channel names, and available packet priority metadata if present. Use metadata only; never inspect or sonify message text contents. [PROJECT.md Q&A, ITEM-pitfalls-12]
- No stereo panning/spatial audio; output stays centered. [PROJECT.md Q&A]
- Include real orchestral samples in this release. Prefer CC0 sources to reduce attribution burden, but CC-BY is acceptable if provenance/attribution metadata is included. Candidate sources found during research:
  - VCSL is CC0, permits commercial/software redistribution, no credit required; includes many percussion/idiophone/world instruments but not clearly celeste or orchestral strings on the product page.
  - FreePats Harp, Orchestral Percussion/Timpani, and Clarinet pages expose CC0 SFZ+WAV/SF2 packages suitable after extraction/mapping.
  - VSCO 2 Community Edition is CC0 and includes string pizzicato samples.
  - CC0 celeste candidates include Freesound stamperadam Celeste Samples and “A Sampled Celesta”; use only if direct download/provenance can be archived cleanly.
  [ITEM-prior-art-10, ITEM-prior-art-11, Web research]
- Do not reuse Andrew Huang Collisions audio or Star Wars assets/samples. Space Blaster must be procedural. [PROJECT.md Constraints]
- New overlay assets must be injected/copied by `scripts/apply-corescope-overlay.mjs` and routed by `docker/nginx.conf`. Current asset allowlist only includes known `denvermc-*` `.js|.css` files at `docker/nginx.conf:102-104`, so new sound assets/sample files need explicit routing.
- UI/visual implementation must be delegated to native Opus via `/opus-ui` or `co-ui` because this session is Codex-backed and must not directly perform frontend UI/design/visual implementation. The main implementation can build non-visual logic, asset plumbing, tests, and integration seams; Opus must implement or polish selector styling/layout.

## Implementation Steps

### Step 1: Add overlay sound asset plumbing, branding corrections, and non-visual shell integration seams
**Goal:** Make the build/runtime able to serve new sound overlay assets and correct the logo/favicon foundations before sound logic is added.
**Why now:** Later steps need a stable place to load `denvermc-sound.js`, optional CSS, and sample assets. The logo/favicon fixes are explicit requirements and share the overlay/app branding surface.
**Dependencies:** Existing overlay application script, nginx asset proxy, CoreScope static public dir, main-site branding constants/assets.
**Files:**
- `scripts/apply-corescope-overlay.mjs`
- `docker/nginx.conf`
- `corescope-overlay/denvermc-shell.js`
- `corescope-overlay/denvermc-shell.css` only via Opus/UI handoff if visual polish is needed
- `corescope-overlay/denvermc-sound.js` placeholder/bootstrap
- `corescope-overlay/denvermc-sound.css` only via Opus/UI handoff for styling
- `src/app/layout.tsx`
- `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png` if current public favicon assets differ from the correct brand asset
- Tests or smoke script files if necessary
**Existing code to inspect first:**
- `scripts/apply-corescope-overlay.mjs` asset arrays and copy loop
- `docker/nginx.conf` CoreScope root asset allowlist
- `corescope-overlay/denvermc-shell.js` `BRAND_LOGO_SRC`, `buildBrandMark()`, `buildTopbar()`
- `src/components/brand/BrandMark.tsx` and `src/lib/constants.ts` for source logo behavior
- `src/app/layout.tsx` metadata favicon config
**Implementation plan:**
1. Add `denvermc-sound.js` to the CoreScope overlay body asset order after `denvermc-shell.js`, because `audio.js` loads in CoreScope body before overlay body scripts and the sound bridge must wrap `window.MeshAudio` once present.
2. Add `denvermc-sound.css` to the overlay head asset list only if the Opus UI handoff requires standalone sound-control styles; otherwise keep sound UI styles in existing shell CSS to avoid extra asset churn.
3. Update the asset copy logic so optional sound sample directories under `corescope-overlay/sound/` can be copied recursively into CoreScope public output without requiring every sample file to be enumerated.
4. Extend `docker/nginx.conf` allowlists to route new `denvermc-sound` `.js/.css` and `/sound/` sample/provenance files to CoreScope, while preserving existing Next and CoreScope route behavior.
5. Change `corescope-overlay/denvermc-shell.js` brand logo source from `/logo.png` to the main-site header logo path `/brand/linux/256x256.png` and align accessible label/title behavior with `BrandMark`/Navigation.
6. Check current public favicon files against the correct brand asset; update `src/app/layout.tsx` only if metadata needs to point to the correct existing files, and replace stale public favicon assets only if they are visibly wrong.
7. Add a minimal `window.__coloradoMeshSound`/`window.__denvermcMapSound` bootstrap placeholder in `denvermc-sound.js` that exposes version/status and does not play audio yet.
**Contracts and interfaces:**
- New overlay public script: `/denvermc-sound.js?v=denvermc`.
- Optional style: `/denvermc-sound.css?v=denvermc`.
- Optional sample/provenance path root: `/sound/...` served by CoreScope.
- Branding asset path: `/brand/linux/256x256.png` for map shell logo.
- Favicon metadata remains Next `metadata.icons` contract in `src/app/layout.tsx`.
**State/data changes:** None beyond static assets.
**Edge cases:**
- Overlay script re-run must remain idempotent.
- New `/sound/` routing must not shadow Next app assets outside that prefix.
- If favicon image conversion is required and local image tools are unavailable, use existing correct brand PNG/ICO assets instead of inventing new ones.
**Acceptance criteria:**
- Docker/overlay application copies and injects the new sound bootstrap asset.
- `/map` still loads default route and shell assets.
- Map shell logo uses the same main-site logo asset path and links to `/`.
- Public favicon metadata points at correct Colorado Mesh brand assets.
**Verification commands:**
- `npm run corescope:apply-overlay`
- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- `npm run docker:smoke -- --image colorado-meshcore-site:local` after a rebuild if routing changes are substantial
**Manual validation:**
- Open `/map#/live`, inspect that `denvermc-sound.js` loads and `window.__coloradoMeshSound` exists.
- Confirm the map logo image URL is `/brand/linux/256x256.png` and links to `/`.
- Confirm the browser favicon resolves to Colorado Mesh brand icon.
**Risks:**
- New overlay/sample routing can accidentally expose or shadow unwanted paths; keep it narrow to `/sound/` and named overlay assets. [ITEM-pitfalls-10]
- UI styling of selector/logo is visual frontend work; delegate to Opus before/within this step for CSS/layout changes.
**Out of scope for this step:** Actual audio playback, mode selector UI behavior, sample downloading, and packet sonification.

### Step 2: Implement the Colorado Mesh sound controller, selector state, volume control, and CoreScope audio suppression
**Goal:** Add a top-bar sound selector and volume state that controls an overlay-owned audio controller while suppressing CoreScope's old audio UI/output.
**Why now:** Sound modes need consistent state, unlock, volume, and routing before event mapping and sound synthesis are added.
**Dependencies:** Step 1 overlay asset injection and shell topbar integration.
**Files:**
- `corescope-overlay/denvermc-shell.js`
- `corescope-overlay/denvermc-shell.css` via Opus UI handoff for visual styling/layout
- `corescope-overlay/denvermc-sound.js`
- `corescope-overlay/denvermc-sound.css` if created
- `tests/e2e/smoke.spec.ts` or a focused script/test if existing Playwright coverage is extended
**Existing code to inspect first:**
- `corescope-overlay/denvermc-shell.js` topbar `actions` construction around status/focus/analyzer/site buttons
- `vendor/CoreScope/public/audio.js` `setEnabled`, `restore`, `sonifyPacket`, localStorage keys
- CoreScope live controls DOM structure around any `.audio`/checkbox controls via browser inspection or grep
**Implementation plan:**
1. Define a sound-state contract in `denvermc-sound.js`: modes `off`, `native`, `generative`, `ensemble`, `blaster`; volume `0..1`; session unlock boolean; selected-mode persistence key; volume persistence key.
2. Ensure persisted non-off mode is shown visually but runtime audio remains locked until the user changes/selects a mode during the current session.
3. Add shell-to-sound integration: `denvermc-shell.js` creates a compact top-bar selector labeled with Colorado Mesh user-facing copy and a simple volume slider; no preview/test button.
4. Delegate top-bar selector/slider visual implementation to Opus UI, with constraints: compact, accessible, no DenverMC visible label, works on mobile topbar, one-click/off path, no overlap with existing Focus/Full analyzer/Site controls.
5. Implement user gesture handling so selecting any non-off mode initializes/resumes the overlay AudioContext; selecting Off stops/mutes overlay audio.
6. Suppress CoreScope's old `live-audio-enabled` persistence by setting it false/clearing as needed and hiding/disable upstream Audio checkbox/control when present, without editing vendor files.
7. Expose a deterministic test seam on `window.__coloradoMeshSound` with getters/setters for mode, volume, lock state, event counters, and test-only event injection.
8. Add defensive localStorage handling for private browsing/quota errors.
**Contracts and interfaces:**
- `localStorage['coloradoMesh.map.soundMode'] = 'off'|'native'|'generative'|'ensemble'|'blaster'`.
- `localStorage['coloradoMesh.map.soundVolume'] = decimal string 0..1`.
- `window.__coloradoMeshSound.setMode(mode, { userGesture })`.
- `window.__coloradoMeshSound.setVolume(value)`.
- `window.__coloradoMeshSound.isUnlocked()`.
- UI labels: Sound Off, Native+, Generative Key, Orchestral Ensemble, Space Blaster.
**State/data changes:** LocalStorage only.
**Edge cases:**
- Returning users with saved mode see that mode but no audio plays until they interact.
- AudioContext creation fails or browser lacks Web Audio: UI remains usable and shows muted/unavailable state.
- Old CoreScope audio had `live-audio-enabled=true`; new overlay should force it off to prevent duplicate audio.
- Volume slider should not require sound to be unlocked to persist a level.
**Acceptance criteria:**
- Sound selector appears in the top bar only.
- Off is default for first-time users.
- Saved non-off mode is displayed on return but does not start playback until a gesture.
- Volume slider persists locally.
- Old CoreScope Audio control is hidden/disabled and CoreScope native audio does not duplicate overlay audio.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit` if tests are added for script helpers
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium` if e2e coverage is extended
**Manual validation:**
- In browser, open `/map#/live`; confirm selector default Off and old audio control hidden.
- Select a mode; confirm AudioContext unlock state changes only after interaction.
- Reload; confirm selected mode remains visible but muted/locked.
- Change volume, reload, confirm it persists.
**Risks:**
- Browser autoplay policies are strict; never create or resume sound as a side effect of page load. [ITEM-pitfalls-1]
- The UI portion is frontend visual implementation; delegate styling/layout to Opus.
**Out of scope for this step:** Rich event taxonomy and actual mode sound design beyond safe no-op or simple diagnostic plumbing.

### Step 3: Bridge CoreScope packet events into a normalized, rate-limited sound event router
**Goal:** Convert CoreScope live packets into safe metadata-only sound events with dedupe, rate limits, and priority lanes.
**Why now:** All modes should consume the same normalized event stream so behavior is consistent, testable, and performant.
**Dependencies:** Step 2 controller exists and can be unlocked/disabled.
**Files:**
- `corescope-overlay/denvermc-sound.js`
- Optional unit test fixture files if the repo's Vitest/jsdom setup can cover browser script helpers
- `scripts/docker-smoke.mjs` or e2e smoke if runtime checks are added
**Existing code to inspect first:**
- `vendor/CoreScope/public/audio.js` packet parser shape
- `vendor/CoreScope/public/live.js:2362-2367` consolidated packet call
- Recent packet payload shapes from API/browser if needed
**Implementation plan:**
1. Wrap `window.MeshAudio.sonifyPacket` after CoreScope audio loads; preserve the original function for explicit disabled/off behavior if needed, but suppress it for all overlay-managed modes.
2. Normalize incoming consolidated packets into event objects containing only metadata: type, channel/channelName/channelHash, priority bucket, observation count, hop count, hash, node/update hints, timestamp, and emergency/channel flags.
3. Never read or use message text content for sound decisions; ignore text fields even if present.
4. Dedupe repeated packet observations by hash and collapse bursts using a short token bucket/cooldown per event class.
5. Implement priority lane behavior: emergency/channel accents can bypass some low-priority throttles; normal events drop/merge under bursts, especially mobile.
6. Keep output centered; do not pan by geography.
7. Keep processing while hidden/non-live if sound is enabled, but do not queue missed events when disabled/locked.
8. Add test seam counters for received/dropped/played events and last normalized event.
**Contracts and interfaces:**
- `normalizePacket(pkt) -> SoundEvent | null` internal/test-exported.
- `SoundEvent` shape: `{ id, type, modeHint, channelName, channelHash, isEmergency, isPriority, observationCount, hopCount, intensity, timestamp }` with no message text.
- Router method: `routeEvent(soundEvent)` dispatches to current mode strategy.
**State/data changes:** Runtime in-memory counters and token buckets only.
**Edge cases:**
- Packets with malformed/missing decoded/header/payload still produce a low-intensity unknown event or no event safely.
- Replay/audio-lab synthetic packets should not crash the router.
- High-volume bursts do not create unbounded AudioNodes or timers.
**Acceptance criteria:**
- CoreScope packets flow through the overlay router when a non-off mode is selected/unlocked.
- Off/locked state drops events with no sound.
- Event normalization ignores message text fields.
- Emergency channel metadata creates an emergency/priority event classification.
- Rate limiting prevents every observation in a burst from spawning sound.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit` if helper tests are added
- Browser console injection through `window.__coloradoMeshSound.injectTestEvent(...)` after `/map#/live` loads
**Manual validation:**
- With live MQTT container running, enable a mode and confirm counters increment for live packets.
- Simulate repeated same-hash packets and confirm dedupe/drop counters increment.
**Risks:**
- Wrapping a global vendor method can break if upstream changes the method name; keep a bounded retry/patch check and fail silently if absent. [ITEM-architecture-2]
- Over-sonifying raw observations becomes noise; route consolidated packets only. [ITEM-prior-art-1]
**Out of scope for this step:** Final sound design quality, orchestral sample playback, and Space Blaster sound recipes.

### Step 4: Implement procedural Native+, Generative Key, and Space Blaster sound modes
**Goal:** Make three active procedural modes sound good without external assets: polished packet tones, musical motifs in one key, and license-safe sci-fi blaster cues.
**Why now:** These modes are license-safe, exercise the full router/controller, and provide immediate value before sample loading complexity.
**Dependencies:** Step 3 router and Step 2 AudioContext/volume controller.
**Files:**
- `corescope-overlay/denvermc-sound.js`
- Tests or browser test helpers if added
**Existing code to inspect first:**
- `vendor/CoreScope/public/audio-v1-constellation.js` for CoreScope's existing oscillator/effect patterns and cleanup style
- `vendor/CoreScope/public/audio.js` for master gain and helper scale functions, though overlay should own its engine
**Implementation plan:**
1. Add shared Web Audio primitives: master gain, limiter/compressor, small reverb/delay where appropriate, envelope helpers, oscillator/noise helpers, safe cleanup/disconnect helpers.
2. Implement Native+ as short polished pings/clicks with pitch variation by packet hash/type, softer event classes for normal traffic, and stronger but rate-limited accents for emergency channels.
3. Implement Generative Key using a fixed pleasant scale/key with short motifs, arpeggios, and occasional chords driven by event type/intensity; keep phrases short and event-driven, not autonomous background music.
4. Implement Space Blaster using procedural oscillator/noise/filter sweeps for laser zaps, impacts, and shields, avoiding any copyrighted sample or distinctive Star Wars audio reproduction.
5. Respect master volume and mode changes immediately; stop future scheduling when Off is selected.
6. Use central active-voice caps and cooldowns so modes cannot create unbounded nodes.
7. Honor reduced-motion/reduced-preference analogs where available if they reasonably suggest less sensory output; at minimum keep sound opt-in and easy Off.
**Contracts and interfaces:**
- Mode strategies implement `play(event, engine) -> estimatedDurationSec`.
- No mode uses text content or external sample files.
- All modes route through the same master output and volume slider.
**State/data changes:** Runtime audio node scheduling only.
**Edge cases:**
- Emergency bursts do not clip due to limiter.
- Repeated low-priority packets produce sparse cues rather than machine-gun noise.
- AudioContext suspended mid-session resumes only on future user gesture, not automatically.
**Acceptance criteria:**
- Native+ produces polished packet/message/node/priority cues.
- Generative Key produces recognizably musical short motifs/chords in one key.
- Space Blaster produces procedural sci-fi zaps and accents without samples.
- Switching modes changes sound character without reload.
- Volume slider affects all modes.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- Browser manual verification on `/map#/live` using live data and test injection
**Manual validation:**
- Enable each mode and confirm live packet activity produces distinct, bounded sounds.
- Trigger emergency-channel test event and confirm distinct accent.
- Rapidly inject 50 events and confirm no audible runaway/clipping and counters show drops/merges.
**Risks:**
- Procedural Space Blaster could drift into recognizable copyrighted imitation; keep it generic sci-fi synthesis. [PROJECT.md Constraints]
- Rich sound can fatigue users; Off and conservative volume must remain easy. [ITEM-pitfalls-3]
**Out of scope for this step:** Real orchestral sample loading/playback.

### Step 5: Add legal-safe orchestral sample assets, manifest, provenance, and Ensemble playback
**Goal:** Ship Orchestral Ensemble with real samples, lazy loading, and provenance/attribution metadata.
**Why now:** After the procedural engine is stable, sample loading can plug into the same router and controller with less risk.
**Dependencies:** Step 4 engine and Step 3 event taxonomy.
**Files:**
- `corescope-overlay/denvermc-sound.js`
- `corescope-overlay/sound/orchestral/manifest.json`
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` or `.json`
- `corescope-overlay/sound/orchestral/**` curated sample files
- `scripts/apply-corescope-overlay.mjs` if recursive copy needs refinement
- `.gitattributes` if needed for binary handling; do not use Git LFS unless already configured and explicitly approved
- `README.md` or deployment docs if sample provenance/size warrants a short note
**Existing code to inspect first:**
- Current `.gitignore` to confirm sample assets won't be ignored
- FreePats/VCSL/VSCO source pages and direct download archives for license/provenance
- Dockerfile copy/apply overlay behavior to ensure sample assets land in `/app/corescope/public/sound/...`
**Implementation plan:**
1. Curate a sample subset from legal sources matching requested roles: harp/celeste/woodwind for messages, pizzicato strings for nodes/dots, brass/timpani or timpani/low percussion for priority/emergency accents.
2. Prefer CC0 assets from FreePats, VCSL, and VSCO 2 CE; use CC-BY only if attribution metadata and a visible/documented attribution path are implemented.
3. Download/extract only the needed sample files, normalize filenames, and avoid committing enormous unused archives. Large pack is acceptable, but still curate to the mode's actual needs.
4. Write `manifest.json` mapping instrument roles to sample URLs, root notes, velocity/intensity, license, source URL, and attribution.
5. Implement lazy sample loading when Ensemble is selected/enabled; show locked/loading state in the sound controller but do not add a preview button.
6. Implement sample playback with `AudioBufferSourceNode`, detune/playbackRate for nearby notes, simple envelopes, and graceful fallback to procedural orchestral-inspired synth if any sample fails.
7. Add Ensemble event mapping: messages → harp/celeste/woodwind motif, node/dot updates → pizzicato strings, emergency/priority → brass/timpani/percussion accents.
8. Add attribution/provenance documentation and ensure Docker/static routing serves sample files with correct MIME types.
**Contracts and interfaces:**
- `manifest.json` schema includes `version`, `samples[]`, `roles`, `license`, `sourceUrl`, `attribution`, `rootNote`, `url`.
- Ensemble mode must work if some samples fail; it may degrade per role rather than fail whole sound system.
- Sample files are static overlay assets under `/sound/orchestral/...`.
**State/data changes:** Browser memory cache of decoded AudioBuffers; static sample files in repo/image.
**Edge cases:**
- Slow sample loading after mode selection should not block UI or crash other modes.
- Missing sample file should fall back and log a concise warning without repeated noise.
- CC-BY assets require attribution; if attribution cannot be made adequate, do not include that file.
- Docker image grows; keep only curated files and avoid source archives.
**Acceptance criteria:**
- Ensemble mode plays real sample-based sounds after lazy loading.
- Sample provenance file lists each source/license/attribution.
- All bundled samples are CC0 or CC-BY with required attribution metadata.
- If samples fail to load, Ensemble still produces a fallback cue and does not break other modes.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- `find corescope-overlay/sound/orchestral -type f | sort`
- `docker build -t colorado-meshcore-site:local .`
- `npm run docker:smoke -- --image colorado-meshcore-site:local`
**Manual validation:**
- Open `/map#/live`, select Orchestral Ensemble, confirm browser network requests sample files only after enabling/selecting Ensemble.
- Confirm Ensemble sounds use real samples for at least harp/celeste/woodwind, pizzicato strings, and timpani/percussion roles.
- Confirm attribution/provenance document matches the files actually committed.
**Risks:**
- Downloading sample archives may require internet access and careful extraction; if a source lacks direct reproducible downloads/provenance, pause and ask before substituting. [ITEM-pitfalls-7]
- Large binary files increase repo/image size; curate instead of committing full multi-GB libraries even though the user allowed a large pack.
**Out of scope for this step:** Building a full sampler UI, user-uploaded samples, or shipping copyrighted/commercial library sounds.

### Step 6: Add tests, Docker smoke coverage, documentation, and final integration verification
**Goal:** Verify the full feature across unit/browser/Docker paths and document relevant operator behavior.
**Why now:** The full feature spans overlay injection, browser audio, static assets, Docker routing, and branding; final checks catch cross-step regressions.
**Dependencies:** Steps 1-5 complete.
**Files:**
- `tests/e2e/smoke.spec.ts` if extended
- `scripts/docker-smoke.mjs`
- `README.md` and/or `.env.example` only if sound/sample behavior needs deploy notes
- `.forge/reviews/final-claude-review.json`
- Any tests created in earlier steps
**Existing code to inspect first:**
- Current `tests/e2e/smoke.spec.ts`
- Current `scripts/docker-smoke.mjs` map/asset checks
- README CoreScope map section
**Implementation plan:**
1. Add or extend e2e coverage for default Off, selector presence, persisted selected/muted behavior, volume persistence, old audio control suppression, and correct logo asset.
2. Extend Docker smoke to assert new overlay assets and sample manifest/static sample paths are reachable, without requiring actual audio playback in Node.
3. Add targeted tests for pure normalization/rate-limiting helpers if those helpers are exposed in a testable way.
4. Update README deployment/operator notes only where useful: sound is browser-local, opt-in, selected mode/volume live in localStorage, orchestral samples are bundled static assets, no extra server required.
5. Run final verification commands.
6. Run final Forge Claude review and address findings.
**Contracts and interfaces:**
- Docker smoke should not require MQTT credentials or live browser audio.
- Tests should not depend on real audio hardware; use DOM/API state and static route checks.
**State/data changes:** Test expectations and documentation only.
**Edge cases:**
- CI/browser may not expose real AudioContext; tests should mock or assert UI/static contracts instead of requiring audible playback.
- Browser autoplay means tests must simulate user clicks for unlock state.
**Acceptance criteria:**
- All existing validation still passes.
- Docker image serves `/map`, new sound assets, sample manifest/files, and correct brand assets.
- E2E or smoke coverage proves sound UI defaults Off and old audio UI is suppressed.
- Documentation mentions no additional server is required.
**Verification commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npx playwright test tests/e2e/smoke.spec.ts --project=chromium`
- `docker build -t colorado-meshcore-site:local .`
- `npm run docker:smoke -- --image colorado-meshcore-site:local`
- `git diff --check`
**Manual validation:**
- Run the container with live data and visit `/map#/live`.
- Test Off, Native+, Generative Key, Ensemble, and Space Blaster on live packet activity.
- Verify logo/favicon visually.
- Verify no old CoreScope audio duplicate controls are visible.
**Risks:**
- Automated tests cannot verify subjective audio quality; manual browser validation is required.
- UI visual implementation must be Opus-reviewed because this session cannot directly own frontend visual design.
**Out of scope for this step:** Publishing a release unless the user asks after implementation.

## Cross-Step Integration Checks
- Confirm `vendor/CoreScope` remains clean except the submodule pointer if intentionally updated; no direct vendor file edits.
- Confirm new overlay assets are injected exactly once after repeated `npm run corescope:apply-overlay`.
- Confirm old CoreScope `live-audio-enabled` state cannot cause duplicate sound.
- Confirm sound continues according to user preference when hidden/non-live, but low-priority bursts are dropped/merged.
- Confirm all visible UI says Colorado Mesh, not DenverMC.
- Confirm map shell logo and favicon match the main site brand asset.
- Confirm sample manifest/provenance covers every committed audio file.
- Confirm Docker single-container behavior is unchanged: no separate CoreScope/audio service.

## Testing Strategy
- Static/code checks: lint, TypeScript, `git diff --check`.
- Unit-level checks where practical: pure packet normalization, mode state, rate-limiter/token-bucket behavior.
- Browser checks: Playwright for UI state, localStorage persistence, old control suppression, logo asset, and route behavior.
- Docker checks: build image and run existing Docker smoke with added sound asset/sample route assertions.
- Manual checks: real browser live data for actual audible quality in all modes, browser console/network for sample lazy-loading and errors.

## Out of Scope
- Editing upstream CoreScope files under `vendor/CoreScope`.
- Using Andrew Huang Collisions assets without permission.
- Using Star Wars or any copyrighted blaster samples.
- User-uploaded sound packs or server-side sound preferences.
- Full sampler/instrument editor UI.
- Release/push work unless explicitly requested after implementation.
