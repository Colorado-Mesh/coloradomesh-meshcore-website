# Architecture Research: Live Map Audio Quality

Project: Brownfield Colorado Mesh/CoreScope overlay sound improvements for richer orchestral mode, redesigned Space Blaster, high-quality musical event accents, browser-local/user-triggered audio, and bounded runtime resources.

### ITEM-architecture-1: Keep audio as a CoreScope overlay subsystem with a stable browser API

- **Recommendation:** Keep the sound engine inside the CoreScope overlay boundary, exposed through `window.__coloradoMeshSound`, and continue copying `/corescope-overlay` assets into CoreScope public output via the existing overlay apply script. Treat Next.js as the site shell and CoreScope as the runtime map/audio host; do not move live-map audio into Next API routes or edit vendored CoreScope files.
- **Rationale:** The current architecture already injects `denvermc-sound.js` after the CoreScope shell and copies `sound/` recursively, while nginx proxies `/sound/` and overlay JS/CSS to CoreScope. This isolates brownfield changes, survives upstream CoreScope updates, keeps audio browser-local, and matches the existing smoke-test deployment path. The public global API also lets `denvermc-shell.js` render controls without coupling UI code to implementation internals.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`, `/Users/cjvana/Documents/GitHub/denvermc-org/docker/nginx.conf`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Editing `vendor/CoreScope` directly is brittle across submodule updates. Moving packet sonification to server/API routes would violate the browser-local constraint and increase privacy risk. Introducing a bundler for only this overlay is unnecessary unless the file becomes impossible to maintain after this pass.

### ITEM-architecture-2: Refactor the monolithic sound file into explicit internal layers before adding richness

- **Recommendation:** Preserve the single shipped classic script if that is the lowest-risk deployment path, but organize implementation around explicit layers: public facade/state, packet normalizer, event gate/router, traffic density model, lookahead sequencer, instrument engines, sample asset loader, audio graph, and diagnostics. Keep layer boundaries enforceable with pure helper functions and small data tables/presets.
- **Rationale:** `denvermc-sound.js` currently contains UI-facing API state, CoreScope audio suppression, packet normalization, throttling, sample loading, scheduling, synthesis, and diagnostics in one IIFE. The requested changes will add more instruments/samples and variation; without boundaries, orchestral/blaster fixes will compound the existing complexity. A layered internal architecture allows richer presets while preserving the current global API and deployment behavior.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** A full TypeScript/module migration is too large for this brownfield audio-quality change. Leaving all new behavior as ad hoc functions in the existing IIFE risks regressions in unlock, suppression, throttling, and diagnostics.

### ITEM-architecture-3: Use one user-unlocked Web Audio graph with separate bed and accent buses

- **Recommendation:** Keep a single `AudioContext` created/resumed by user gesture, with `masterGain -> outputLimiter -> destination`, separate `bedGain` for continuous density and `accentGain` for event cues, and mode-specific instrument nodes feeding the accent bus. Add only bounded shared effects if needed, such as a subtle convolution-free ambience/delay or per-cue low-cost panner, behind the accent bus.
- **Rationale:** The current graph already has a good foundation: one context, master/bed/accent gains, a dynamics compressor limiter, and gesture-based unlock. MDN’s current guidance is still to create/resume audio from a user gesture and provide explicit controls. Separate buses let density remain smooth and low-volume while event accents become richer without masking the map or causing output spikes.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Multiple `AudioContext`s complicate autoplay handling and resource cleanup. Sending every sound directly to destination prevents central volume, limiting, mute, and diagnostics. HTML audio elements are not appropriate for frequent overlapping event accents.

### ITEM-architecture-4: Fix the event gate so throttling/dedupe controls accent scheduling, not just counters

- **Recommendation:** Keep density ingestion independent, but only enqueue/play accents when `acceptDedupe(event, now) && acceptBucket(event, now)` succeeds. If an event is deduped/throttled, update traffic density and diagnostics but do not call the accent sequencer.
- **Rationale:** The current `routeEvent` computes `accentAllowed`, then calls `markPlayed(event)` regardless. This means dedupe/token-bucket logic may increment counters while still allowing repetitive accents into the queue. For “event-accent focused” audio under busy traffic, architecture must separate continuous density from discrete accent admission. This is also required to avoid unbounded perceived repetition even if `maxActiveVoices` caps node count later.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` (`routeEvent`, `acceptDedupe`, `acceptBucket`, `enqueueMusicalEvent`)
- **Checked:** 2026-05-15
- **Alternatives rejected:** Relying only on `maxActiveVoices` prevents audio-node overload but does not stop the sequencer queue from sounding repetitive. Dropping events before density ingestion would make the ambient bed less representative of real traffic.

### ITEM-architecture-5: Keep the lookahead sequencer and schedule against `AudioContext.currentTime`

- **Recommendation:** Continue routing accents through a bounded music queue and short lookahead scheduler. Schedule all oscillators, buffer sources, envelopes, and parameter automation using absolute `audioCtx.currentTime` values; use `setInterval` only to fill the lookahead window, not as the precision clock.
- **Rationale:** Current code has the right shape: `MUSIC_QUEUE_MAX`, `MUSIC_SCHEDULE_AHEAD_SECONDS`, `musicNextTime`, and `drainMusicQueue()`. Web Audio timing guidance is consistent: JavaScript timers jitter on the main thread, while Web Audio scheduled starts/ramps are the reliable timing source. A lookahead queue is especially important for musical orchestral phrases and Space Blaster accents that need intentional spacing rather than immediate overlapping chaos.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques; Web article — https://web.dev/articles/audio-scheduling; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Playing immediately in each packet callback will jitter and pile up under busy map traffic. Scheduling far into the future would make mode/volume/off changes feel laggy and harder to cancel.

### ITEM-architecture-6: Make orchestral mode data-driven with richer role manifests, not hardcoded “two-sample” behavior

- **Recommendation:** Expand `/sound/orchestral/manifest.json` into a soundpack manifest with roles, instruments, articulations, round-robin variants, velocity/intensity bands, pitch ranges, gain envelopes, optional stereo pan ranges, and fallback order. Keep `denvermc-sound.js` responsible for interpreting role metadata, choosing bounded layers, and caching decoded buffers.
- **Rationale:** The current orchestral manifest has only four samples and the `messages` role has two candidates, matching the user’s complaint that orchestral mode feels like only two samples. Browser sample-accent architecture should cache reusable decoded `AudioBuffer`s and create one-shot `AudioBufferSourceNode`s per event. A richer manifest lets the project add strings/woodwinds/brass/percussion variety without hardcoding every cue and without generating sound from message contents.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/ATTRIBUTION.md`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Adding random sample choices directly in code will be hard to audit for license/attribution and hard to tune. Loading large complete orchestral libraries is inappropriate for a map overlay; use a curated compact set of short accents.

### ITEM-architecture-7: Keep decoded-buffer caching; create disposable one-shot sources per cue

- **Recommendation:** Decode every sample once per `AudioContext` into `ensembleBuffers`, reuse those buffers, and create a fresh `AudioBufferSourceNode` for each scheduled accent. Track only active sources/nodes needed for stop/cleanup diagnostics and let completed one-shot nodes disconnect/garbage-collect.
- **Rationale:** MDN documents that `AudioBufferSourceNode` instances are one-shot, cheap to create, and suited to short precisely timed samples, while the underlying `AudioBuffer`s are reusable. The current implementation already follows this pattern; architectural improvements should preserve it while adding richer sample selection and stricter lifecycle cleanup.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Pooling and restarting `AudioBufferSourceNode`s is invalid because source nodes can only be started once. Fetching/decoding on every packet would cause latency spikes and network churn.

### ITEM-architecture-8: Use AudioWorklet only for continuous density, not for event accent orchestration

- **Recommendation:** Keep the density bed in `AudioWorkletProcessor` with smoothed parameters for density/priority/pulse/mode/level, and keep event accents on the main Web Audio graph via scheduled sources. Treat AudioWorklet failure as graceful degradation to the existing procedural fallback.
- **Rationale:** AudioWorklet is appropriate for low-latency continuous custom processing off the main thread. The current `colorado-mesh-density` processor is compact, parameterized, and already has fallback handling. Event accents, sample selection, manifest loading, and queueing need DOM/fetch/state access and are better handled outside the worklet, with only scheduled Web Audio nodes entering the graph.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/denvermc-density-worklet.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Moving all synthesis into AudioWorklet would complicate sample loading and debugging. Removing the worklet would put continuous DSP/timing back on the main thread and make busy map rendering more likely to affect the bed.

### ITEM-architecture-9: Redesign Space Blaster as a constrained instrument preset, not an effects dump

- **Recommendation:** Model Space Blaster as a separate preset/instrument with a small musical pitch set, lane-specific envelopes, softened oscillator choices, limited filter resonance, optional noise layer, optional low bass accent for priority events, and deterministic seeded variation. Keep it event-accent focused and route through the same queue/gates as other modes.
- **Rationale:** Current Space Blaster uses sawtooth/square waves, short glides, noise bursts, and high-Q filters. That creates a recognizable sci-fi cue but can become harsh and repetitive under traffic. The architecture should make Space Blaster a tunable data preset with the same event roles as orchestral mode, so redesign is about musical vocabulary and bounded layers rather than scattered oscillator constants.
- **Confidence:** MEDIUM
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` (`playBlaster`, `scheduleTone`, `scheduleNoiseBurst`); Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- **Checked:** 2026-05-15
- **Alternatives rejected:** Simply lowering volume will make it less annoying but not more musical. Adding more random oscillators/noise will increase fatigue and resource use without solving repetition.

### ITEM-architecture-10: Add low-cost stereo variation for event accents

- **Recommendation:** Add optional per-cue `StereoPannerNode` in the accent path, with pan derived from non-content event metadata such as event seed, lane, hop count, or node/observer coordinates if already available in normalized packet data. Keep pan subtle for orchestral mode and more animated for Space Blaster.
- **Rationale:** Stereo variation can make a small sample set feel wider and less repetitive without adding many assets. `StereoPannerNode` is low-cost, widely available, and uses equal-power panning. Because the project must not use message contents for sound generation, deterministic metadata-derived pan is safer than content-derived sonification.
- **Confidence:** MEDIUM
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics
- **Checked:** 2026-05-15
- **Alternatives rejected:** Full `PannerNode`/HRTF spatial audio is overkill unless the map event model reliably provides positions and listener semantics. Hard-left/right panning is fatiguing; keep ranges subtle.

### ITEM-architecture-11: Enforce explicit resource budgets at every boundary

- **Recommendation:** Keep and tighten hard caps for active voices, queue length, layers per cue, sample count/bytes, cooldowns per lane, token buckets, and cleanup timers. Make coalescing policy musical: keep priority accents, summarize dense normal/low traffic into density bed, and drop or merge stale queued events.
- **Rationale:** The current code already has `maxActiveVoices`, `MUSIC_QUEUE_MAX`, scheduled source/node sets, cleanup timers, cooldowns, token buckets, and traffic window pruning. Richer orchestral and blaster layers can easily multiply nodes per event, so caps must be architecture-level invariants rather than afterthoughts. This directly addresses the constraint to avoid unbounded audio node/sample creation under busy map traffic.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; Official docs — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
- **Checked:** 2026-05-15
- **Alternatives rejected:** Relying on browser garbage collection alone is insufficient for operator confidence and diagnostics. Raising caps to hide dropped events will make bad traffic bursts sound worse.

### ITEM-architecture-12: Keep audio off by default, user-triggered, locally controlled, and privacy-preserving

- **Recommendation:** Preserve sound mode `off` by default, localStorage-only mode/volume preferences, explicit start controls, clear off control, and no server calls for sound generation. Continue suppressing upstream CoreScope audio so only the Colorado Mesh sound engine owns playback.
- **Rationale:** WCAG guidance recommends sounds play only on user request and provide a stop/off control, especially to avoid interfering with screen readers. Browser autoplay policies also require gesture-based context resume. The current shell and sound API already implement mode/volume controls, user gesture unlock, and upstream CoreScope audio suppression; richer audio should not weaken those protections.
- **Confidence:** HIGH
- **Source:** Accessibility guidance — https://www.w3.org/WAI/WCAG22/Techniques/general/G171; Official docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Autoplaying the map would violate user expectations and browser policy. Sending packet/message contents to a service for sound generation violates the project constraints and privacy posture.

### ITEM-architecture-13: Add deterministic diagnostics and tests around sound architecture, not waveform perfection

- **Recommendation:** Add tests that validate packet normalization, lane classification, dedupe/throttle gating, queue coalescing, bounded active voices, manifest schema/asset reachability, orchestral sample variety, blaster pitch range, branding labels, and Docker-served sound assets. Use `__coloradoMeshSound.getState()` diagnostics as the black-box contract.
- **Rationale:** The repository currently has Docker smoke checks for `/denvermc-sound.js`, the worklet, orchestral manifest, and samples, but no local sound-specific unit/spec tests were found. Audio quality is partly subjective, so regression protection should target deterministic architecture invariants: no unbounded nodes, no missing sample metadata, no “two sample only” role collapse, no broken unlock/suppression, and no harsh/out-of-range Space Blaster pitch explosions.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`, `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`, repository search for sound/audio tests
- **Checked:** 2026-05-15
- **Alternatives rejected:** Snapshotting generated waveforms in browser tests would be brittle across browsers/audio backends. Relying only on manual listening will miss regressions in busy-traffic caps and deployment asset paths.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-architecture-1 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/docker/nginx.conf`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-2 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-3 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-4 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-5 | HIGH | Official docs + Web article + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques; https://web.dev/articles/audio-scheduling; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-6 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json` |
| ITEM-architecture-7 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-architecture-8 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/denvermc-density-worklet.js` |
| ITEM-architecture-9 | MEDIUM | Codebase + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-architecture-10 | MEDIUM | Official docs | https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics |
| ITEM-architecture-11 | HIGH | Codebase + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode |
| ITEM-architecture-12 | HIGH | Accessibility guidance + Official docs + Codebase | https://www.w3.org/WAI/WCAG22/Techniques/general/G171; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js` |
| ITEM-architecture-13 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; repository search |
