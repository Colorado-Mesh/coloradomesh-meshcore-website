# Research Synthesis

## Status
- Files synthesized: stack.md, pitfalls.md, architecture.md, prior-art.md, codex-analysis.md, PROJECT.md
- Files missing: none
- Overall confidence: HIGH

## Executive Summary
This is a brownfield browser-audio quality project for the Colorado Mesh/CoreScope live map overlay. The proven path is not a framework rewrite or a server-side sonification service; it is a restrained Web Audio event-accent engine that stays inside the existing CoreScope overlay, remains user-triggered and browser-local, and uses the existing density bed, queue, diagnostics, and static asset delivery path as the foundation.

The recommended approach is to keep native Web Audio and the current CoreScope overlay deployment, first fixing accent admission so dedupe/token-bucket gates actually prevent playback, then expanding orchestral mode through a compact CC0/public-domain manifest with multiple short role-based variants, and redesigning Space Blaster as a softer, musical sci-fi preset instead of bright high-Q laser/noise bursts. Audio should remain off by default, unlocked only by explicit user gesture, and generated from event metadata/priority rather than message contents.

Top risks are browser autoplay/unlock regressions, high-rate traffic producing repetitive or unbounded audio, sample licensing/asset-size creep, AudioWorklet deployment failures, and subjective musical regressions that file-existence smoke tests will not catch. Mitigate them with hard resource budgets, manifest validation, role diversity tests, Playwright/browser unlock checks, Docker smoke checks for same-origin assets/worklet paths, and in-context listening against quiet and busy captured traffic. Prior art supports this direction: borrow concepts from Tone.js, Highcharts sonification, Erie/WebAudioXML, iSonic, game UI sound design, VSCO, and FreePats, but do not adopt heavyweight products or libraries for this focused overlay change.

## Key Decisions (resolved by research)

1. Keep the sound engine in the CoreScope overlay (`corescope-overlay/**`) and expose/control it through the existing browser global API rather than moving it into Next.js or server routes. Sources: ITEM-stack-6, ITEM-architecture-1, ITEM-prior-art-1.
2. Continue using native Web Audio API directly; do not add Tone.js, howler.js, SoundFont engines, Web MIDI, Erie, Highcharts, or a DAW-like sonification framework for this pass. Sources: ITEM-stack-1, ITEM-stack-11, ITEM-prior-art-2, ITEM-prior-art-6, ITEM-prior-art-9.
3. Preserve one user-unlocked `AudioContext` with explicit off/mode/volume controls, browser-local playback, localStorage-only preferences, and no message-content sonification. Sources: ITEM-stack-3, ITEM-architecture-3, ITEM-architecture-12, ITEM-pitfalls-1, ITEM-pitfalls-10, ITEM-pitfalls-11.
4. Fix event gating before expanding sound design: density ingestion may continue for all events, but discrete accents must only enqueue when dedupe and token buckets allow them. Sources: ITEM-architecture-4, ITEM-pitfalls-2.
5. Keep AudioWorklet for the continuous density bed only, with graceful fallback; do not move sample selection or event orchestration into the processor. Sources: ITEM-stack-2, ITEM-architecture-8, ITEM-pitfalls-5, ITEM-pitfalls-6.
6. Make orchestral richness manifest-driven with short CC0/public-domain one-shots and multiple role variants, rather than procedural-only orchestral synthesis or a large bundled library. Sources: ITEM-stack-4, ITEM-stack-5, ITEM-architecture-6, ITEM-pitfalls-3, ITEM-pitfalls-4, ITEM-prior-art-4, ITEM-prior-art-5.
7. Redesign Space Blaster as a constrained musical sci-fi preset with softer oscillators, lower resonance, shorter tasteful cues, deterministic variation, and priority-only intensity. Sources: ITEM-architecture-9, ITEM-pitfalls-7, ITEM-prior-art-12.
8. Use hard budgets and diagnostics as architectural invariants: active voices, queue length, layers per cue, sample count/bytes, token buckets, cooldowns, cleanup, and dropped-event counters. Sources: ITEM-stack-10, ITEM-architecture-11, ITEM-pitfalls-6, ITEM-pitfalls-9.
9. Keep all production audio assets same-origin under `/sound/**`, copied by the overlay apply script and verified by Docker smoke tests; do not fetch runtime samples from third-party CDNs. Sources: ITEM-stack-8, ITEM-stack-12, ITEM-architecture-1, ITEM-pitfalls-13.
10. Validate deterministic behavior with Vitest/pure tests and Playwright/real-browser checks; use manual in-context listening for musical acceptance rather than brittle waveform snapshots. Sources: ITEM-stack-9, ITEM-architecture-13, ITEM-pitfalls-14.

## Questions for User

### Q-1: Which map event categories should produce audible accents, and which should remain density-only or silent?

- **Category:** scope
- **Why it matters:** This defines the event hierarchy and prevents every packet/update from becoming an audible cue.
- **Default recommendation:** Make only meaningful state changes audible: new/changed nodes, messages, priority/emergency-like events, user selection/focus changes if present, and rare notable events; keep routine high-frequency updates density-only.
- **Source refs:** ITEM-pitfalls-2, ITEM-pitfalls-8, ITEM-architecture-4, ITEM-prior-art-11
- **Priority:** HIGH

### Q-2: What should “Orchestral Ensemble” feel like: cinematic, classical, subtle ambient, playful, or alert-like?

- **Category:** ux
- **Why it matters:** The target aesthetic determines sample families, dynamics, reverb/tail length, intensity mapping, and how dramatic priority accents should be.
- **Default recommendation:** Choose restrained cinematic/chamber accents: plucks/woodwinds for common events, light percussion for structure, and low brass/timpani/swell only for rare priority events.
- **Source refs:** ITEM-stack-4, ITEM-architecture-6, ITEM-pitfalls-3, ITEM-pitfalls-8, ITEM-prior-art-4, ITEM-prior-art-5
- **Priority:** HIGH

### Q-3: Which existing audio behaviors or motifs must remain recognizable for current users?

- **Category:** scope
- **Why it matters:** Brownfield changes should improve quality without surprising users who rely on existing mode meanings, controls, or diagnostic behavior.
- **Default recommendation:** Preserve mode names/control flow, density bed semantics, and broad event-role distinctions, while changing timbre, variation, and gating internals as needed.
- **Source refs:** ITEM-prior-art-1, ITEM-architecture-1, ITEM-stack-3
- **Priority:** HIGH

### Q-4: How large may the audio asset budget be for the Docker/static deployment?

- **Category:** constraints
- **Why it matters:** Asset size drives manifest scope, WAV-vs-compressed decisions, first-unlock latency, mobile memory, and Docker image growth.
- **Default recommendation:** Keep a compact curated pack of short WAV one-shots initially, target multiple variants per high-frequency role, and add codec variant support only if size/latency becomes material.
- **Source refs:** ITEM-stack-5, ITEM-pitfalls-4, ITEM-architecture-6, ITEM-prior-art-4
- **Priority:** HIGH

### Q-5: Are CC0/public-domain assets the only acceptable source, or are permissive attribution licenses acceptable too?

- **Category:** prior-art
- **Why it matters:** This determines whether VSCO/FreePats-only sourcing is mandatory or whether additional high-quality packs can be considered after license review.
- **Default recommendation:** Use only CC0/public-domain or equivalently redistribution-safe assets for this pass; require manifest license/source/attribution fields for every sample.
- **Source refs:** ITEM-pitfalls-13, ITEM-stack-4, ITEM-prior-art-4, ITEM-prior-art-5
- **Priority:** HIGH

### Q-6: Should Space Blaster be purely procedural, sample-assisted, or procedural with a tiny local sample/noise palette?

- **Category:** technical
- **Why it matters:** This affects licensing risk, timbral quality, code complexity, and whether Space Blaster can be tuned entirely through oscillator/filter/envelope presets.
- **Default recommendation:** Keep Space Blaster procedural for now, but redesign it with softer sine/triangle/FM-like chirps, lower-Q filters, restrained noise, deterministic variation, and priority-only intensity.
- **Source refs:** ITEM-architecture-9, ITEM-pitfalls-7, ITEM-prior-art-12, ITEM-pitfalls-13
- **Priority:** HIGH

### Q-7: What should count as a rare high-priority event deserving a larger accent?

- **Category:** scope
- **Why it matters:** Orchestral low-frequency layers, cymbal/timpani/brass, and brighter blaster cues must be reserved for rare events to avoid fatigue and clipping.
- **Default recommendation:** Reserve large accents for explicit priority/emergency classifications or user-focused events; keep normal traffic quiet, sparse, and short.
- **Source refs:** ITEM-pitfalls-8, ITEM-pitfalls-9, ITEM-architecture-11, ITEM-prior-art-12
- **Priority:** HIGH

### Q-8: Should accents use subtle stereo panning, and if so should pan derive from event role, seed, or map coordinates?

- **Category:** ux
- **Why it matters:** Panning can improve variety and spatial impression, but aggressive or semantically confusing panning can fatigue users or imply false map precision.
- **Default recommendation:** Add subtle deterministic stereo variation from safe metadata/seed/role first; only use geographic pan if normalized event coordinates are reliable and the interaction model is clear.
- **Source refs:** ITEM-architecture-10, ITEM-prior-art-11, ITEM-pitfalls-10
- **Priority:** MEDIUM

### Q-9: What are the minimum supported browsers/devices for audio quality acceptance, especially iOS Safari and mobile?

- **Category:** constraints
- **Why it matters:** Browser differences affect `AudioContext` unlock, `AudioWorklet`, `decodeAudioData`, codec choices, latency, and memory budgets.
- **Default recommendation:** Validate Chromium and WebKit/Safari paths with Playwright/manual testing where feasible; keep AudioWorklet fallback and WAV baseline compatibility.
- **Source refs:** ITEM-stack-2, ITEM-stack-5, ITEM-stack-9, ITEM-pitfalls-1, ITEM-pitfalls-5
- **Priority:** HIGH

### Q-10: How much user control should exist beyond mode and master volume?

- **Category:** ux
- **Why it matters:** Additional controls for density bed, alerts, preview/test sound, or reduced-audio mode can improve accessibility but may expand UI scope beyond the sound-quality fix.
- **Default recommendation:** Preserve existing UI and add no broad redesign; consider only low-cost controls if required for accessibility or QA, such as a user-triggered preview and immediate off/mute behavior.
- **Source refs:** ITEM-pitfalls-11, ITEM-architecture-12, ITEM-stack-3
- **Priority:** MEDIUM

### Q-11: Should the implementation refactor the monolithic sound file internally, or only make localized edits?

- **Category:** technical
- **Why it matters:** Richer presets and tests need clearer boundaries, but a full module/TypeScript migration would increase brownfield risk.
- **Default recommendation:** Keep the shipped classic script path but refactor internally into clear pure helpers/data tables for normalizing, gating, preset selection, sample loading, scheduling, and diagnostics.
- **Source refs:** ITEM-architecture-2, ITEM-stack-1, ITEM-stack-11
- **Priority:** HIGH

### Q-12: What acceptance criteria define “richer, less repetitive, and pleasant” for this project?

- **Category:** ux
- **Why it matters:** Audio quality is subjective; the plan needs measurable proxies and manual listening scenarios to avoid shipping a technically correct but annoying result.
- **Default recommendation:** Combine deterministic checks (role diversity, queue/voice caps, frequency/Q ranges, gating counters) with manual listening against quiet and busy captured/synthetic traffic in Orchestral and Space Blaster modes.
- **Source refs:** ITEM-pitfalls-14, ITEM-stack-9, ITEM-architecture-13, ITEM-pitfalls-8
- **Priority:** HIGH

### Q-13: Are there any privacy or trust constraints beyond “do not use message contents”?

- **Category:** risk
- **Why it matters:** Event metadata, labels, channel identifiers, coordinates, and stable hashes may still carry semantics; the sound mapping should avoid implying surveillance or revealing sensitive content.
- **Default recommendation:** Use only coarse event class, priority, counts, hops, timing, and non-reversible stable seeds; document tests that prevent text/raw-payload sonification.
- **Source refs:** ITEM-pitfalls-10, ITEM-stack-3, ITEM-architecture-12
- **Priority:** HIGH

### Q-14: Should new visible labels continue using current mode names, and should any internal “DenverMC” identifiers be migrated?

- **Category:** constraints
- **Why it matters:** User-facing labels must say Colorado Mesh, but internal filenames/aliases may need to remain stable for compatibility and deployment.
- **Default recommendation:** Keep internal historical identifiers unless a separate migration is planned; ensure all new visible strings, aria labels, diagnostics shown to users/operators, and docs exposed through UI say Colorado Mesh.
- **Source refs:** ITEM-pitfalls-15, ITEM-architecture-1, ITEM-stack-6
- **Priority:** MEDIUM

## Technical Direction

### Stack

- Use native browser Web Audio API in the existing static CoreScope overlay: `AudioContext`, `GainNode`, filters, `DynamicsCompressorNode`/limiter, `AudioBuffer`, `AudioBufferSourceNode`, `StereoPannerNode` only if used subtly, and absolute `audioCtx.currentTime` scheduling. Sources: ITEM-stack-1, ITEM-architecture-3, ITEM-architecture-5.
- Keep `AudioWorklet` only for the continuous density bed and preserve feature-detected fallback. Sources: ITEM-stack-2, ITEM-architecture-8, ITEM-pitfalls-5.
- Keep Node/Next/React/Docker stack unchanged because this is overlay/client-side audio work. Sources: ITEM-stack-7.
- Keep assets same-origin under `corescope-overlay/sound/**` and delivered at `/sound/**` through the existing overlay apply and Docker/nginx path. Sources: ITEM-stack-8, ITEM-stack-12, ITEM-architecture-1.
- Do not add Tone.js/howler.js for the implementation even though Codex suggested Tone.js as a viable music stack. The repository already has the needed scheduling/sample/routing primitives, and adding a library creates bundling/abstraction churn for a brownfield static overlay. Sources: ITEM-stack-1, ITEM-prior-art-2; supplemental contrast: codex-analysis.md.
- Use WAV for the initial compact sample set unless the asset budget grows; manifest design may allow future MP3/Opus variants. Sources: ITEM-stack-5, ITEM-pitfalls-4.
- Use Vitest/jsdom or Node tests for pure helpers and manifest schema, and Playwright/real browsers for unlock, Web Audio/AudioWorklet presence, mode switching, diagnostics, and asset decode/load paths. Sources: ITEM-stack-9, ITEM-architecture-13, ITEM-pitfalls-14.

### Architecture

- Boundary: Keep audio in CoreScope overlay, not Next.js or server/API routes. `denvermc-shell.js` should continue to own controls and call the stable `window.__coloradoMeshSound` API; `denvermc-sound.js` should continue to own audio runtime, upstream CoreScope audio suppression, state, and diagnostics. Sources: ITEM-architecture-1, ITEM-stack-6.
- Internal layers: Organize the classic script around public facade/state, packet/event normalizer, event gate/router, density model, lookahead sequencer, preset/instrument engines, sample asset loader/cache, audio graph/mixer, and diagnostics. This can be done without a full module/bundler migration. Sources: ITEM-architecture-2, ITEM-stack-11.
- Data flow: map/CoreScope packet or UI event -> normalized non-content audio event -> density update -> dedupe/token-bucket/cooldown admission -> preset decision -> bounded queue/lookahead scheduling -> sample/procedural voice creation -> bed/accent buses -> master/limiter -> destination. Sources: ITEM-architecture-3, ITEM-architecture-4, ITEM-architecture-5, ITEM-pitfalls-2.
- Orchestral preset: Data-driven manifest with roles, instruments, articulations, round-robin variants, velocity/intensity bands, gain/envelope metadata, optional pan ranges, and fallback order. Add 3-5 short variants for high-frequency roles where feasible. Sources: ITEM-architecture-6, ITEM-pitfalls-3, ITEM-stack-4.
- Sample lifecycle: Cache decoded buffers once per `AudioContext`; create fresh one-shot `AudioBufferSourceNode`s per cue; track active sources only for cleanup/diagnostics; do not fetch/decode per event. Sources: ITEM-architecture-7, ITEM-pitfalls-4.
- Space Blaster preset: Use constrained procedural patches with small scales/motifs, softer waveforms, smooth envelopes, lower filter resonance, optional low-gain noise layer, priority-only stronger accents, and deterministic seeded variation. Sources: ITEM-architecture-9, ITEM-pitfalls-7, ITEM-prior-art-12.
- Resource budgets: Enforce queue max, max active voices, max layers per cue, role cooldowns, token buckets, decoded buffer caps/budgets, sample manifest budgets, and cleanup timers. Sources: ITEM-architecture-11, ITEM-stack-10.
- Privacy/accessibility: Keep sound off by default, user-triggered, local-only, same-origin asset loaded, and based on non-content metadata. Sources: ITEM-architecture-12, ITEM-pitfalls-10, ITEM-pitfalls-11.

### Prior Art to Leverage

- Current Colorado Mesh overlay: Preserve the existing pipeline, density worklet, queue, diagnostics, privacy posture, and asset manifest path; improve gating and sound design rather than replacing the engine. Source: ITEM-prior-art-1.
- Tone.js: Borrow concepts such as musical scheduling, sample maps, polyphony caps, and transport separation, but do not add it as a dependency for this brownfield pass. Source: ITEM-prior-art-2.
- MDN Web Audio examples: Use platform guidance for Web Audio, AudioWorklet, buffer sources, AudioParam ramps, panning, compression, and scheduling. Source: ITEM-prior-art-3.
- VSCO 2 Community Edition and FreePats: Use small curated CC0/public-domain samples for strings/plucks/woodwinds/percussion/priority accents; do not bundle full libraries. Sources: ITEM-prior-art-4, ITEM-prior-art-5.
- Highcharts Maps sonification, Erie, WebAudioXML, TwoTone, and SIREN: Borrow the declarative/configurable mapping mindset, global/default tracks, coalescing, and aesthetic sound-design framing, not the dependencies/products. Sources: ITEM-prior-art-6, ITEM-prior-art-7, ITEM-prior-art-8, ITEM-prior-art-9, ITEM-prior-art-10.
- iSonic: Preserve the separation between overview/density and focused event detail; consider subtle spatial/pan differentiation only where semantics are clear. Source: ITEM-prior-art-11.
- Game UI/sci-fi sound design: Use hierarchy, short cues, frequency separation, controlled tails, intentional silence, restrained variation, and clarity over loudness for Space Blaster. Source: ITEM-prior-art-12.

## Detailed Planning Implications

1. Start with engine correctness before asset expansion: fix the route/event-gating bug so dedupe/token-bucket admission controls accent enqueueing while density updates still occur for dropped accent events. Verify counters for queued, played, deduped, throttled, and dropped events. Sources: ITEM-architecture-4, ITEM-pitfalls-2.
2. Create/clarify pure helper seams inside `corescope-overlay/denvermc-sound.js` before adding lots of behavior: event normalization, event role classification, gate decision, preset selection, sample selection, blaster patch generation, and diagnostics formatting. Sources: ITEM-architecture-2, ITEM-stack-11.
3. Preserve external contracts: `window.__coloradoMeshSound`, `window.__denvermcMapSound` compatibility alias if present, mode/volume localStorage behavior, user gesture path, and upstream CoreScope audio suppression. Sources: ITEM-architecture-1, ITEM-architecture-12, ITEM-pitfalls-12.
4. Define a manifest schema evolution step: add fields for roles, variants, family/instrument/articulation, intensity bands, gain/envelope, license/source/attribution, optional duration/byte metadata, and fallback role order while remaining backward-compatible if practical. Sources: ITEM-architecture-6, ITEM-stack-4, ITEM-pitfalls-13.
5. Sequence orchestral assets after schema/tests: select a small CC0 subset from VSCO/FreePats, normalize/trim, update `ATTRIBUTION.md`, and add smoke/schema checks that every high-frequency role has multiple usable variants. Sources: ITEM-pitfalls-3, ITEM-pitfalls-4, ITEM-prior-art-4, ITEM-prior-art-5.
6. Implement lazy or role-based sample loading if asset count grows beyond the current tiny set; never decode every possible large library blindly at unlock. Sources: ITEM-pitfalls-4, ITEM-architecture-7.
7. Redesign Space Blaster as data/preset constants and a small number of patch functions, not ad hoc oscillator constants scattered through playback. Verification should cover oscillator type choices, frequency ranges, filter Q bounds, envelope lengths, noise usage, and priority/intensity mapping. Sources: ITEM-architecture-9, ITEM-pitfalls-7, ITEM-prior-art-12.
8. Keep the lookahead sequencer as the only accent timing path; schedule all source starts/stops and gain/filter ramps against `audioCtx.currentTime`, not direct packet callback time. Sources: ITEM-architecture-5.
9. Add or extend diagnostics in `getState()` for sound QA: unlock/context state, worklet/fallback status, active voice count, queue length, dropped reasons, dedupe/throttle counters, sample load/decode failures, current sample role pools, and maybe role diversity counters. Sources: ITEM-architecture-13, ITEM-pitfalls-14.
10. Add tests in layers: pure unit tests for gate/sample/preset helpers, manifest/schema tests for license and role diversity, browser tests for user gesture/unlock/mode switching/worklet URL, and Docker smoke for `/sound/**` paths and manifest sample reachability. Sources: ITEM-stack-8, ITEM-stack-9, ITEM-architecture-13, ITEM-pitfalls-14.
11. Keep same-origin deployment and CSP compatibility as a cross-step check after any asset/path changes. Sources: ITEM-stack-12, ITEM-pitfalls-5.
12. Include a manual acceptance step using quiet and busy traffic scenarios. Listen for repetition, harshness, clipping, masking, delayed first accent, and ability to immediately stop audio. Sources: ITEM-pitfalls-8, ITEM-pitfalls-9, ITEM-pitfalls-11, ITEM-pitfalls-14.
13. Add string/branding review if any UI or operator-visible labels change: user-facing copy must say Colorado Mesh, not DenverMC. Sources: ITEM-pitfalls-15, PROJECT.md.
14. Do not broaden scope into Next framework upgrades, map UI redesign, server-side sound generation, remote sample hosting, or vendor/CoreScope edits. Sources: ITEM-stack-6, ITEM-stack-7, ITEM-architecture-1, PROJECT.md.

## Risk Register

1. **CRITICAL — Audio locked/silent because browser user gesture handling regresses.** Keep sound off by default, create/resume `AudioContext` only from explicit mode/sound controls, and test unlock states in real browsers. Sources: ITEM-pitfalls-1, ITEM-stack-3, ITEM-architecture-12.
2. **CRITICAL — Dedupe/token-bucket logic records counters but does not gate playback.** Fix accent admission before sound design expansion; assert duplicate/high-rate events do not enqueue accents. Sources: ITEM-pitfalls-2, ITEM-architecture-4.
3. **CRITICAL — Real-time audio glitches from too much work/allocation under traffic.** Keep Worklet simple, cap active voices/layers/queue, schedule on Web Audio graph, and profile synthetic bursts. Sources: ITEM-pitfalls-6, ITEM-architecture-11, ITEM-stack-10.
4. **CRITICAL — Message content or raw payload sonification violates privacy/trust.** Restrict input to non-content metadata and add tests/comments preventing text/raw payload mapping. Sources: ITEM-pitfalls-10, ITEM-stack-3, ITEM-architecture-12.
5. **CRITICAL — Accessibility regression from background audio or inability to stop.** Preserve Sound Off default, explicit controls, immediate off/mute, and no auto-enable from saved upstream settings. Sources: ITEM-pitfalls-11, ITEM-architecture-12.
6. **MODERATE — Orchestral mode still sounds like two samples.** Expand manifest role pools, enforce multiple variants for high-frequency roles, and verify deterministic round-robin/seeded selection. Sources: ITEM-pitfalls-3, ITEM-architecture-6, ITEM-stack-4.
7. **MODERATE — Large samples cause memory/latency issues.** Curate short one-shots, budget total bytes/durations, cache decoded buffers, and lazy-load by role if needed. Sources: ITEM-pitfalls-4, ITEM-stack-5, ITEM-architecture-7.
8. **MODERATE — AudioWorklet fails in production/container paths.** Preserve feature detection/fallback, wait for `addModule`, keep processor names stable, and test Docker/HTTPS-like paths. Sources: ITEM-pitfalls-5, ITEM-stack-2, ITEM-architecture-8.
9. **MODERATE — Space Blaster remains harsh/fatiguing.** Soften waveforms/envelopes/filter Q, reduce noise bursts, use musical scales/motifs, and reserve bright urgency for priority events. Sources: ITEM-pitfalls-7, ITEM-architecture-9, ITEM-prior-art-12.
10. **MODERATE — Event sonification is annoying or semantically unclear.** Keep accents sparse, map urgency perceptually, retain subtle density bed, validate with busy/quiet listening sessions. Sources: ITEM-pitfalls-8, ITEM-prior-art-11.
11. **MODERATE — Overlapping accents clip or pump.** Maintain role/master gain staging, limiter as safety net, tune worst-case overlap at high volume, and cap layers/voices. Sources: ITEM-pitfalls-9, ITEM-architecture-3, ITEM-architecture-11.
12. **MODERATE — Upstream CoreScope audio double-plays.** Keep suppression defensive/idempotent and test delayed mounts/route changes. Sources: ITEM-pitfalls-12, ITEM-architecture-1.
13. **MODERATE — Sample licensing blocks deployment.** Accept only redistribution-safe assets, require manifest license/source/attribution, and keep attribution updated. Sources: ITEM-pitfalls-13, ITEM-prior-art-4, ITEM-prior-art-5.
14. **MODERATE — Tests miss musical regressions.** Add deterministic architecture tests and manual listening; do not rely only on Docker file-existence smoke. Sources: ITEM-pitfalls-14, ITEM-stack-9, ITEM-architecture-13.
15. **MINOR — User-facing branding regresses to DenverMC.** Keep historical internals if needed but make all visible strings and aria/operator labels say Colorado Mesh. Sources: ITEM-pitfalls-15, PROJECT.md.

## Conflicts & Tradeoffs

1. **Add Tone.js vs keep native Web Audio.**
   - Side A: Codex recommends Tone.js `14.8.x` as the closest fit for musical timing, samplers, envelopes, routing, and light effects. Refs: codex-analysis.md.
   - Side B: Stack and prior-art research recommend not adding Tone.js for this brownfield overlay because native Web Audio primitives are already implemented and Tone.js would add bundling/dependency churn. Refs: ITEM-stack-1, ITEM-prior-art-2, ITEM-architecture-1.
   - Resolution: Keep native Web Audio and borrow Tone.js concepts only.

2. **WAV simplicity vs compressed asset efficiency.**
   - Side A: Keep short WAV files for simplicity and broad decode compatibility. Refs: ITEM-stack-5.
   - Side B: Richer orchestral libraries can blow up transfer/decode memory; compressed variants may be needed if the library grows. Refs: ITEM-pitfalls-4, codex-analysis.md.
   - Resolution: Start with compact short WAV one-shots; design manifest to support future MP3/Opus variants if budget requires.

3. **Richer orchestral samples vs first-unlock latency/mobile memory.**
   - Side A: More role variants are required to avoid the current two-sample feel. Refs: ITEM-pitfalls-3, ITEM-architecture-6, ITEM-stack-4.
   - Side B: Eagerly loading many high-quality samples can create latency and decoded PCM memory pressure. Refs: ITEM-pitfalls-4, ITEM-architecture-7.
   - Resolution: Curate a small role-balanced set first, add manifest budgets, and move toward lazy/role-based loading if the set grows.

4. **More spatial variety vs clarity/accessibility.**
   - Side A: Subtle stereo panning can make a small sound set feel wider and less repetitive. Refs: ITEM-architecture-10, ITEM-prior-art-11.
   - Side B: Spatial audio can imply false geographic meaning or become fatiguing if hard-panned/aggressive. Refs: ITEM-architecture-10, ITEM-pitfalls-8.
   - Resolution: If implemented, use subtle deterministic pan from safe metadata and avoid full HRTF/geographic claims unless coordinates and semantics are clear.

5. **Procedural Space Blaster vs sample-assisted sci-fi polish.**
   - Side A: Procedural Space Blaster avoids licensing ambiguity and keeps assets small. Refs: ITEM-pitfalls-13, ITEM-architecture-9.
   - Side B: Commercial sci-fi/UI sound prior art shows polished samples/textures can sound cleaner than raw oscillators/noise. Refs: ITEM-prior-art-12, codex-analysis.md.
   - Resolution: Redesign procedurally first with softer, musical patches; consider tiny local CC0/permissive textures only if procedural tuning cannot meet quality goals.

6. **Refactor for maintainability vs minimizing brownfield risk.**
   - Side A: The monolithic sound file needs explicit layers before adding richness. Refs: ITEM-architecture-2, ITEM-stack-11.
   - Side B: A full module/TypeScript/bundler migration is out of scope and increases deployment risk. Refs: ITEM-stack-1, ITEM-architecture-2.
   - Resolution: Refactor internally with pure helpers and data tables while preserving shipped classic script and public API.

## Confidence Assessment

| Dimension | Status | Confidence | Notes |
|-----------|--------|------------|-------|
| stack | complete | HIGH | Strong agreement to keep native Web Audio, CoreScope overlay delivery, AudioWorklet fallback, same-origin assets, current Node/Next stack, and browser tests. |
| pitfalls | complete | HIGH | Concrete codebase-backed risks identify the gating bug, unlock/autoplay, privacy, accessibility, worklet, resource, licensing, and testing hazards. |
| architecture | complete | HIGH | Clear architecture direction: overlay subsystem, one user-unlocked graph, bed/accent buses, lookahead sequencer, data-driven manifests/presets, hard budgets, diagnostics. |
| prior-art | complete | HIGH | Strong applicable prior art from current overlay, Web Audio, VSCO/FreePats, Tone.js concepts, map sonification, and game UI sound design; most dependencies are concepts to borrow, not adopt. |
| codex-analysis | complete | MEDIUM | Optional supplemental research only. Useful alignment on event-accent architecture and pitfalls, but its Tone.js recommendation conflicts with codebase-specific stack/prior-art research and is not adopted. |
