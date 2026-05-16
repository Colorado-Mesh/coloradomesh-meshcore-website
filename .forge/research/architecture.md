# Architecture Research: CoreScope Map Sound + Responsive Overlay

Project context: brownfield Colorado Mesh CoreScope overlay. Do not edit `vendor/CoreScope` directly; keep browser-local, opt-in, metadata-only audio; make high traffic fuller/denser under bounded load; polish mobile/portrait overlays via the patch layer.

### ITEM-architecture-1: Replace per-packet note triggering with a density-metered sonification pipeline

- **Recommendation:** Build the sound engine as `packet adapter -> metadata normalizer -> rolling traffic meter -> musical scheduler -> bounded voice renderer`. Feed every accepted packet into rolling 250-500ms buckets by lane (`priority`, `message`, `node`, `other`) and schedule one musical slice per bucket; map higher packet counts to thicker layers, wider chords, shorter rhythmic subdivisions, or richer timbre rather than more one-shot nodes.
- **Rationale:** The current overlay already normalizes and throttles packets, but its token buckets and cooldowns reject busy traffic before it reaches sound, so dense map activity can sound thinner. Sonification references and Erie-style grammar work favor aggregation/binning and deliberate channel mappings over one sound per raw row/event. This architecture lets traffic density increase perceived fullness while CPU and node counts stay bounded.
- **Confidence:** HIGH
- **Source:** Codebase + WebFetch — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` lines 1038-1107; https://arxiv.org/abs/2402.00156
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not simply raise `maxActiveVoices` or token-bucket refill rates; that either keeps high traffic dropouts or risks runaway nodes. Do not play every packet as a separate cue; it produces mush under bursts and fails the bounded-load constraint.

### ITEM-architecture-2: Use AudioContext clock lookahead scheduling, not event-time immediate playback

- **Recommendation:** Add a single scheduler loop per enabled audio context: a coarse JS timer wakes every ~25ms and schedules musical slices up to ~100ms ahead using `audioCtx.currentTime`. Store scheduled slice IDs/generation numbers so mode changes, off, hidden-tab transitions, and route teardown cancel future slices cleanly.
- **Rationale:** MDN and web.dev both recommend using `AudioContext.currentTime` and `source.start(absoluteTime)` for accurate Web Audio timing because `setTimeout`/event callbacks are main-thread jittery. The current overlay schedules individual cues immediately from packet routing; moving to a short-horizon scheduler gives musical alignment and makes bursts sound intentional without scheduling far into the future.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques; https://web.dev/articles/audio-scheduling; https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not run rhythm from `Date.now()` or direct WebSocket callback timestamps. Do not schedule seconds of material ahead; it makes mode/volume/off changes sluggish and hard to cancel safely.

### ITEM-architecture-3: Keep audio strictly opt-in with a stateful unlock boundary

- **Recommendation:** Keep `off` as the default persisted mode, create/resume the `AudioContext` only inside explicit user gesture handlers on the Colorado Mesh sound control, and expose a clear state machine: `off | locked | suspended | ready | unavailable | degraded`. Never use packet arrival to unlock audio.
- **Rationale:** MDN autoplay guidance says Web Audio playback started outside user input is subject to autoplay blocking; best practice is to create or resume the context from a user gesture and present explicit controls. The existing overlay has the right control surface and should remain the only unlock boundary.
- **Confidence:** HIGH
- **Source:** Official docs + Codebase — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js` lines 208-233
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not auto-enable from saved preference, first WebSocket packet, or page load. Do not rely on browser autoplay allowlisting; behavior varies and would violate the opt-in requirement.

### ITEM-architecture-4: Enforce metadata-only privacy at the adapter boundary

- **Recommendation:** Introduce a dedicated `SoundEvent` adapter that accepts only metadata fields: packet hash/id, payload type, channel name/hash, observation count, hop count/path length, timestamp/arrival time, replay/live flag, emergency/priority classification, and optional observer/region metadata. The sound layer must not receive `payload.text`, decoded message bodies, or `raw_hex`; derive randomness from hash/type/timestamp instead.
- **Rationale:** The current sound normalizer inspects `raw_hex` for seeds and intensity. Even if it does not read `payload.text`, raw packet bytes can encode message contents and should not enter the sound subsystem under the project's metadata-only constraint. A narrow adapter creates an auditable privacy boundary independent of CoreScope's richer feed/detail UI.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` lines 359-381 and 952-1011; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js` lines 2362-2367
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not pass whole CoreScope packet objects to audio and trust voice code not to read sensitive fields. Do not use raw hex bytes as musical entropy; use packet hash and metadata fields instead.

### ITEM-architecture-5: Split musical control state from audio resource state

- **Recommendation:** Maintain two separate internal modules: `TrafficModel` for rolling counts/intensity/lane history and `AudioGraph` for persistent Web Audio nodes, buffers, buses, limiter, and cleanup. `TrafficModel` is pure and testable; `AudioGraph` owns the single `AudioContext`, master gain, limiter/compressor, reusable noise/sample buffers, active source registry, and a hard per-slice node budget.
- **Rationale:** The current file mixes normalization, throttling, voice creation, sample loading, DOM suppression, and state reporting in one IIFE. Separating model from graph makes it possible to test burst behavior without Web Audio, and to prove node caps/cleanup independently. Chrome/web.dev guidance emphasizes render capacity and avoiding glitch-causing allocation/GC pressure.
- **Confidence:** HIGH
- **Source:** WebFetch + Codebase — https://web.dev/articles/profiling-web-audio-apps-in-chrome; https://developer.chrome.com/docs/devtools/webaudio; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not add more modes into the current monolithic script without boundaries; that makes load safety and privacy review harder. Do not introduce AudioWorklet unless custom DSP becomes necessary; built-in Oscillator/BufferSource/Gain/Filter nodes are enough for this fix.

### ITEM-architecture-6: Use layered buses so high traffic adds sustained texture instead of consuming unlimited voices

- **Recommendation:** Render density with a small, fixed bus layout: `bed` for low/node traffic, `pulse` for normal message rhythm, `accent` for priority/emergency events, and `ui/test` for test tones. Each scheduler tick updates bus gains/filters and schedules at most a fixed number of short sources per layer; priority accents can bypass density aggregation but still obey a separate cap.
- **Rationale:** A bus layout gives the desired perceptual behavior: high traffic increases bed level, harmonic density, and rhythmic subdivision while voice count remains stable. It also makes volume limiting predictable. The current implementation creates per-cue oscillator/sample nodes and drops once `activeVoices >= maxActiveVoices`, which is exactly the path that makes traffic thin out.
- **Confidence:** MEDIUM
- **Source:** Official docs + Codebase — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` lines 774-805
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not make density by linearly increasing gain only; it clips or fatigues. Do not make density by unbounded polyphony; it glitches under busy map traffic.

### ITEM-architecture-7: Preserve the CoreScope patch layer as the only integration surface

- **Recommendation:** Keep all Colorado Mesh changes under `corescope-overlay/` plus `scripts/apply-corescope-overlay.mjs`. Integrate by replacing the upstream `MeshAudio` methods at runtime, hiding upstream audio controls, adding owned DOM, and toggling body classes. If CoreScope needs new hooks later, wrap them in overlay-owned adapters rather than editing `vendor/CoreScope`.
- **Rationale:** The Docker build already copies CoreScope public assets and applies an idempotent overlay injection with managed head/body regions. This satisfies the brownfield constraint and keeps upstream submodule updates survivable. The overlay can intercept `MeshAudio.sonifyPacket(consolidated)` where CoreScope emits one consolidated packet per rendered hash group.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs` lines 1-26 and 39-47; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile` lines 82-96; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js` lines 2362-2367
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not edit `vendor/CoreScope/public/audio.js` or `live.js` directly. Do not fork the whole CoreScope UI; the patch layer already provides a controlled extension seam.

### ITEM-architecture-8: Make overlay UI a responsive shell state machine with progressive disclosure

- **Recommendation:** Keep one overlay shell controller with explicit modes: `minimal`, `analyzer`, `focus`, and `off`; derive body classes from route + preference; render owned controls once; then progressively disclose controls based on viewport. On phones/portrait, collapse sound controls to an icon/button that opens a compact popover or bottom sheet; keep topbar brand + map state + one primary action visible and move secondary controls out of the horizontal bar.
- **Rationale:** The current shell already implements route-aware body classes and mode resolution, but mobile CSS still tries to fit brand, sound select, volume, focus, analyzer, and site controls into one fixed topbar. Progressive disclosure is the correct architecture for portrait polish because it prevents horizontal overflow while preserving all controls and accessible labels.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js` lines 489-587; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` lines 752-790
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not keep shrinking labels and sliders indefinitely at narrow widths. Do not hide critical actions without an alternate path; use a disclosed panel/sheet with accessible trigger instead.

### ITEM-architecture-9: Base mobile layout on dynamic viewport and safe-area primitives

- **Recommendation:** For overlay chrome, standardize CSS custom properties for `--cm-safe-top`, `--cm-safe-bottom`, `--cm-viewport-h`, and topbar/control offsets. Use `height: 100dvh` where possible, `env(safe-area-inset-*)` with fallbacks for fixed bars/FABs/bottom sheets, and a small `visualViewport` sync only where CoreScope's JS inline `window.innerHeight` sizing conflicts with CSS.
- **Rationale:** MDN documents that mobile has a layout viewport and visual viewport; browser chrome and keyboards can shrink the visual viewport while fixed elements remain tied to the layout viewport. The upstream live page already has JS resize handling that writes `window.innerHeight` to `.live-page`/`#app`; the overlay must coordinate with that rather than fight it with many hard-coded offsets.
- **Confidence:** HIGH
- **Source:** Official docs + Codebase — https://developer.mozilla.org/en-US/docs/Web/CSS/env; https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js` lines 212-238; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` lines 486-503
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rely on `100vh` alone for mobile portrait fullscreen UI. Do not scatter independent `top: 56px`/`bottom: 80px` constants across overlay rules; centralize offsets as custom properties.

### ITEM-architecture-10: Add instrumentation and tests for burst audio and portrait overlay regressions

- **Recommendation:** Extend the existing Playwright smoke suite with: mobile portrait screenshots/assertions for topbar no-overflow, focus exit reachability, sound control disclosure, and CoreScope panel collision; and a pure unit harness for `TrafficModel` that simulates 0, low, high, and bursty packet rates to assert density rises while scheduled sources per second stay capped. Expose debug counters for accepted packets, aggregated buckets, scheduled slices, active sources, dropped due to hard cap, and limiter state.
- **Rationale:** The repo already tests sound overlay defaults and upstream suppression, but not high-traffic musical density or portrait composition. Architecture changes must be validated under synthetic load because the main failure mode is behavioral: busy traffic sounds thinner/stops. Chrome DevTools WebAudio render capacity can validate manual performance once the bounded graph exists.
- **Confidence:** HIGH
- **Source:** Codebase + Official docs — `/Users/cjvana/Documents/GitHub/denvermc-org/tests/e2e/smoke.spec.ts` lines 197-240 and 574-582; https://developer.chrome.com/docs/devtools/webaudio; https://web.dev/articles/profiling-web-audio-apps-in-chrome
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rely only on subjective listening checks. Do not ship UI polish without portrait viewport tests because upstream CoreScope has many fixed/absolute panels competing for the same screen edges.

## Suggested Data Flow

1. CoreScope receives WebSocket packet and renders map/feed via upstream `renderPacketTree`.
2. Overlay-patched `MeshAudio.sonifyPacket(consolidated)` receives the consolidated packet group.
3. `SoundEventAdapter` strips to metadata-only fields and computes lane/priority/intensity from metadata.
4. `TrafficModel.push(event)` updates rolling buckets and exposes current density per lane.
5. `Scheduler.tick()` uses `audioCtx.currentTime` to schedule upcoming musical slices within a short lookahead window.
6. `AudioGraph.renderSlice(slice)` updates persistent buses and schedules capped short sources/samples.
7. `DebugState` publishes counters to UI/tests via `window.__coloradoMeshSound.getState()`.

## Suggested File Boundaries

- `corescope-overlay/denvermc-sound.js`: bootstrap, public API, CoreScope audio suppression, backwards-compatible singleton.
- New internal sections or split overlay files if the injector is updated: `sound-event-adapter`, `traffic-model`, `music-scheduler`, `audio-graph`, `sound-debug`.
- `corescope-overlay/denvermc-shell.js`: shell mode state machine and accessible controls only.
- `corescope-overlay/denvermc-shell.css`: responsive layout, safe-area/dvh custom properties, no vendor selector sprawl beyond required CoreScope collision fixes.
- `tests/e2e/smoke.spec.ts`: viewport and integration checks; separate unit tests for pure traffic model if test setup permits.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-architecture-1 | HIGH | Codebase + WebFetch | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://arxiv.org/abs/2402.00156 |
| ITEM-architecture-2 | HIGH | Official docs | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques; https://web.dev/articles/audio-scheduling |
| ITEM-architecture-3 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay |
| ITEM-architecture-4 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js` |
| ITEM-architecture-5 | HIGH | WebFetch + Codebase | https://web.dev/articles/profiling-web-audio-apps-in-chrome; https://developer.chrome.com/docs/devtools/webaudio |
| ITEM-architecture-6 | MEDIUM | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-7 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile` |
| ITEM-architecture-8 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` |
| ITEM-architecture-9 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/CSS/env; https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts |
| ITEM-architecture-10 | HIGH | Codebase + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/tests/e2e/smoke.spec.ts`; https://developer.chrome.com/docs/devtools/webaudio |
