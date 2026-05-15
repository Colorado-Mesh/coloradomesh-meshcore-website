# Research Synthesis

## Status
- Files synthesized: stack.md, pitfalls.md, architecture.md, prior-art.md, PROJECT.md
- Files missing: codex-analysis.md
- Overall confidence: HIGH

## Executive Summary
This is a brownfield browser feature for the embedded CoreScope live map: add opt-in packet sonification modes using the existing CoreScope packet/audio/render stream, while keeping all implementation in the local overlay layer. The proven way to build it is not to fork CoreScope or add a second network feed, but to inject overlay-owned JavaScript/CSS, bridge the existing `MeshAudio.sonifyPacket(consolidated)` call, normalize rendered packets into semantic sound events, and schedule Web Audio output through one shared engine.

The recommended approach is a dependency-light, same-origin, single-container implementation: vanilla overlay assets under `corescope-overlay`, native Web Audio for procedural modes, local-only mode persistence, explicit user-gesture audio unlock, and a manifest-driven Orchestral Ensemble path that can remain empty or procedural until CC0/provenance-checked samples are approved. Sound Off must be authoritative by default, and restored preferences must not mean restored playback. The map shell logo fix should be handled in the same overlay/shell surface: use the main-site logo asset/branding rather than the incorrect alternate map logo.

Top risks are autoplay/persistence violations, inaccessible or confusing controls, bursty packet streams becoming noise or CPU spikes, sample-license mistakes, and brittle vendor edits. Mitigate them with session-only unlock state, keyboard-accessible persistent controls, token buckets and priority lanes, strict same-origin/license manifests, procedural Space Blaster, and no direct changes under `vendor/CoreScope`. Prior art supports semantic event sonification, simple understandable mappings, browser-native Web Audio, Tone.js-style scheduling concepts without necessarily adopting Tone.js, CC0 sample curation from VCSL/FreePats if assets are added, and procedural ZzFX/jsfxr-like techniques for sci-fi zaps.

## Key Decisions (resolved by research)

1. Implement in the CoreScope overlay layer, not in Next/React and not by editing `vendor/CoreScope` directly. Refs: ITEM-stack-1, ITEM-architecture-1, ITEM-pitfalls-10.
2. Use the existing rendered packet path by wrapping/bridging `MeshAudio.sonifyPacket(consolidated)` rather than opening a second WebSocket or scraping the DOM. Refs: ITEM-stack-3, ITEM-architecture-2.
3. Use native Web Audio APIs as the primary audio stack and avoid new runtime npm dependencies for the first implementation. Refs: ITEM-stack-2, ITEM-stack-9.
4. Default to Sound Off and persist only the selected mode locally; never persist an enabled/unlocked audio state. Refs: ITEM-stack-4, ITEM-stack-5, ITEM-architecture-5, ITEM-pitfalls-1, ITEM-pitfalls-2.
5. Keep Native+, Generative Key, and Space Blaster procedural and license-safe. Refs: ITEM-stack-6, ITEM-architecture-7, ITEM-architecture-8, ITEM-architecture-10, ITEM-pitfalls-8.
6. Structure Orchestral Ensemble as a manifest-driven lazy sampler with procedural fallback and no bundled samples unless license/provenance metadata is reviewed. Refs: ITEM-stack-7, ITEM-architecture-9, ITEM-pitfalls-7, ITEM-pitfalls-11.
7. Preserve the single Docker/static deployment and serve all new assets from the same origin. Refs: ITEM-stack-8, ITEM-stack-11.
8. Add deterministic test seams and test storage/default-off/rate-limit behavior instead of attempting brittle audible-output assertions. Refs: ITEM-stack-9, ITEM-architecture-12.
9. Fix map shell branding by using the same main-site logo asset/branding in the map shell instead of the wrong map logo. Refs: PROJECT.md constraint line 20, ITEM-architecture-6.

## Questions for User

### Q-1: Should a persisted non-off sound mode auto-select visually on return, or should returning users always see Sound Off selected?

- **Category:** ux
- **Why it matters:** Research agrees playback must not auto-enable, but there is a UX choice between remembering the preferred mode as a locked selection versus resetting the visible selector to Off every session.
- **Default recommendation:** Persist the selected mode visually, but keep playback locked/muted until an explicit Enable/selector gesture each session; include clear “Enable sound” state.
- **Source refs:** ITEM-stack-4, ITEM-stack-5, ITEM-architecture-5, ITEM-pitfalls-1, ITEM-pitfalls-2
- **Priority:** HIGH

### Q-2: Where exactly should the sound selector live in the map shell on desktop and mobile?

- **Category:** ux
- **Why it matters:** Placement determines discoverability, keyboard access, focus-mode behavior, and whether users can always mute quickly.
- **Default recommendation:** Put a compact Sound selector in the DenverMC map shell top bar actions, with a fallback in CoreScope live controls/analyzer mode and a persistent Off path.
- **Source refs:** ITEM-architecture-6, ITEM-pitfalls-3, ITEM-stack-10
- **Priority:** HIGH

### Q-3: Should the old upstream CoreScope Audio checkbox be hidden, disabled, or left visible as an advanced control?

- **Category:** technical
- **Why it matters:** Leaving both controls active can produce duplicate audio and conflicting persistence semantics.
- **Default recommendation:** Hide or disable the old CoreScope Audio checkbox when the DenverMC sound overlay is active; route all sound state through the new selector.
- **Source refs:** ITEM-architecture-6, ITEM-stack-3, ITEM-pitfalls-2
- **Priority:** HIGH

### Q-4: What should count as priority or emergency traffic for distinct accents?

- **Category:** scope
- **Why it matters:** The modes need a stable event taxonomy before sound design can reserve high-priority lanes and avoid over-alerting.
- **Default recommendation:** Start with conservative detection from available packet metadata (`payloadTypeName`, priority/header fields if present, message/emergency labels if exposed), and treat unknowns as normal packets until confirmed.
- **Source refs:** ITEM-architecture-3, ITEM-architecture-7, ITEM-architecture-10, ITEM-pitfalls-4, ITEM-pitfalls-12
- **Priority:** HIGH

### Q-5: Should Orchestral Ensemble ship initially with no samples, a tiny CC0 sample subset, or procedural-only approximations?

- **Category:** prior-art
- **Why it matters:** This affects legal review, Docker image size, first-interaction latency, and whether the mode sounds authentically orchestral at launch.
- **Default recommendation:** Ship procedural fallback plus an empty/license-aware manifest first; add a tiny CC0 FreePats/VCSL-derived subset only after provenance is archived.
- **Source refs:** ITEM-stack-7, ITEM-architecture-9, ITEM-pitfalls-7, ITEM-pitfalls-11, ITEM-prior-art-10, ITEM-prior-art-11
- **Priority:** HIGH

### Q-6: Are CC-BY samples acceptable later if attribution UI and metadata are implemented, or must samples remain CC0/public-domain only?

- **Category:** constraints
- **Why it matters:** This determines whether libraries like tonejs-instruments or other non-CC0 packs can ever be considered.
- **Default recommendation:** Keep the project CC0/public-domain-only for bundled samples unless the user explicitly approves attribution obligations and a release checklist.
- **Source refs:** ITEM-pitfalls-7, ITEM-prior-art-7, ITEM-prior-art-9, ITEM-prior-art-10, ITEM-prior-art-11
- **Priority:** MEDIUM

### Q-7: How musical should Generative Key be: subtle packet motifs or an obviously melodic/arpeggiated mode?

- **Category:** ux
- **Why it matters:** This sets note density, phrase length, key/scale choice, and whether the feature feels like telemetry or a soundtrack.
- **Default recommendation:** Use short, activity-driven motifs in one fixed pleasant key with bounded arpeggios/chords; avoid long autonomous background music.
- **Source refs:** ITEM-architecture-8, ITEM-stack-6, ITEM-prior-art-5, ITEM-prior-art-6, ITEM-pitfalls-5
- **Priority:** MEDIUM

### Q-8: Should users get a Preview/Test sound button for each mode?

- **Category:** ux
- **Why it matters:** Browser autoplay unlock requires a gesture, and users need confidence that a selected mode works before live packets arrive.
- **Default recommendation:** Add a small Preview/Enable affordance that plays one short, rate-limited demo cue through the selected mode after user activation.
- **Source refs:** ITEM-stack-5, ITEM-pitfalls-1, ITEM-architecture-5, ITEM-architecture-12
- **Priority:** MEDIUM

### Q-9: What is the desired default volume and should a volume control be exposed in the first release?

- **Category:** ux
- **Why it matters:** Sonification can be fatiguing, disruptive to screen readers, or too quiet to be useful; exposing controls adds UI complexity.
- **Default recommendation:** Start with a conservative fixed master level and optional simple volume slider only if existing map controls have space; always include one-click Off.
- **Source refs:** ITEM-pitfalls-3, ITEM-pitfalls-4, ITEM-stack-10, ITEM-prior-art-2
- **Priority:** MEDIUM

### Q-10: Should map geography influence stereo panning or pitch?

- **Category:** technical
- **Why it matters:** Longitude/path-derived panning can make audio more informative, but can also be disorienting or inaccessible for headphone users.
- **Default recommendation:** Use very subtle stereo panning from longitude/path when available, with safe mono-compatible mix and no reliance on spatial cues for critical information.
- **Source refs:** ITEM-stack-6, ITEM-architecture-7, ITEM-prior-art-2, ITEM-pitfalls-3
- **Priority:** LOW

### Q-11: What traffic rates should the system target on desktop and mobile before dropping/merging low-priority cues?

- **Category:** constraints
- **Why it matters:** Token bucket sizes, active voice caps, and mobile performance safeguards need concrete thresholds.
- **Default recommendation:** Start conservative: per-event cooldowns, lower mobile active-source caps, duplicate hash collapsing, and high-priority lane reservation; tune after profiling live/replay bursts.
- **Source refs:** ITEM-pitfalls-4, ITEM-pitfalls-6, ITEM-architecture-11, ITEM-stack-10
- **Priority:** HIGH

### Q-12: Should hidden tabs, background routes, or non-live CoreScope pages silence audio entirely?

- **Category:** risk
- **Why it matters:** Users do not expect background map audio, and browser timer throttling can cause delayed bursts on return.
- **Default recommendation:** Silence/drop audio when `document.hidden` or not on `#/live`; do not queue missed sounds for replay.
- **Source refs:** ITEM-architecture-11, ITEM-pitfalls-5, ITEM-pitfalls-4
- **Priority:** HIGH

### Q-13: How should direct/group message events be sonified without leaking sensitive activity?

- **Category:** risk
- **Why it matters:** Audio can reveal activity to bystanders and should not encode message text or private semantics.
- **Default recommendation:** Map only coarse metadata such as event type, priority, count, and hash-bucketed variation; never sonify text contents or persist packet-derived data.
- **Source refs:** ITEM-pitfalls-12, ITEM-architecture-3, ITEM-stack-4
- **Priority:** HIGH

### Q-14: Which main-site logo asset should the map shell use, and should it link/behave exactly like the main-site header logo?

- **Category:** ux
- **Why it matters:** The user explicitly identified wrong map branding; implementation needs the exact asset and interaction target to avoid another mismatch.
- **Default recommendation:** Reuse the same main-site logo asset/branding currently used by the primary site header, preserve accessible alt text, and avoid introducing a separate map-specific mark.
- **Source refs:** PROJECT.md constraint line 20, ITEM-architecture-6
- **Priority:** HIGH

### Q-15: Is adding Tone.js acceptable if native Web Audio implementation becomes too costly, or is no-new-runtime-dependencies a hard constraint?

- **Category:** technical
- **Why it matters:** Stack research recommends no dependency, while prior art identifies Tone.js as a strong fit for musical scheduling and sampler abstractions.
- **Default recommendation:** Do not add Tone.js for the first release; revisit only if Generative Key or Orchestral Ensemble requirements grow beyond the lightweight native engine.
- **Source refs:** ITEM-stack-2, ITEM-stack-9, ITEM-prior-art-5, ITEM-prior-art-15
- **Priority:** MEDIUM

## Technical Direction

### Stack

Use vanilla browser overlay JavaScript and CSS injected into CoreScope via the existing overlay build path. The sound engine should rely on native Web Audio primitives: `AudioContext`, oscillators, gains, filters, panners, compressor/limiter, scheduled `AudioParam` envelopes, and optional `AudioBufferSourceNode` playback for future samples. Do not add runtime dependencies for the first release. Keep assets same-origin and preserve the current Docker/single-container deployment.

Store only the selected mode in a DenverMC-specific localStorage key such as `denvermc.mapSound.mode` or `denvermc.map.soundMode`, guarded by try/catch and enum validation. Keep audio unlock/enabled state in memory only. The selector must default to Off for new users, and restored non-off modes must still require a gesture before sound is produced.

### Architecture

Implement a singleton overlay engine, tentatively `DenverMCMapSound`, with these boundaries:

- UI adapter: mounts the selector/enable/preview state into the DenverMC map shell top bar and/or CoreScope live controls fallback.
- Storage adapter: local-only, defensive localStorage read/write of selected enum value.
- Bridge adapter: wraps `window.MeshAudio.sonifyPacket` after CoreScope loads, emits normalized sound events, and suppresses duplicate upstream audio as needed.
- Event normalizer: converts CoreScope packet shapes into semantic events with `kind`, `typeName`, `hash`, `timestamp`, `routeType`, `obsCount`, `hopCount`, bytes/raw payload hints, channel, and booleans such as `isMessage`, `isNodeAdvert`, `isPriority`.
- Audio engine: one `AudioContext`, master gain, limiter/compressor, mode bus, lifecycle guards, rate limiter, and active-source caps.
- Mode strategies: `off`, `nativePlus`, `generativeKey`, `orchestral`, and `spaceBlaster`.

Native+ should be the polished baseline one-shot mode. Generative Key should use fixed-key deterministic note mapping and short scheduled motifs. Orchestral Ensemble should be manifest-driven and lazy, with procedural fallback if no reviewed samples exist. Space Blaster should be fully procedural and brand-neutral.

The logo/branding correction should be handled in the overlay shell layer: use the same main-site logo asset/branding rather than the alternate map logo, and preserve accessibility metadata.

### Prior Art to Leverage

- Use SoNSTAR and Network-Sonification as conceptual guides: semantic event grouping, rhythm/density cues, simple mappings, muted startup, anti-clipping, and local-only processing. Refs: ITEM-prior-art-1, ITEM-prior-art-2.
- Borrow SonNet/SIREN architecture concepts: normalize data into stable event objects and route through channels/shared scheduling rather than scattered `playSound()` calls. Refs: ITEM-prior-art-3, ITEM-prior-art-4.
- Borrow Tone.js concepts (not necessarily the dependency): scheduled synth voices, sampler abstractions, effects routing, and transport-like timing. Refs: ITEM-prior-art-5.
- Borrow Scribbletune’s pattern idea without adding the dependency: small deterministic scale-degree patterns for Generative Key. Refs: ITEM-prior-art-6.
- Use WebAudioFont/tonejs-instruments as loader-pattern references only; do not use their sounds without license review. Refs: ITEM-prior-art-7, ITEM-prior-art-9.
- Prefer VCSL/FreePats CC0 sources if adding Orchestral samples later, curated to a tiny lazy-loaded subset. Refs: ITEM-prior-art-10, ITEM-prior-art-11.
- Use ZzFX/jsfxr/sfxr as procedural Space Blaster design references, not as sources of copyrighted samples. Refs: ITEM-prior-art-13, ITEM-prior-art-14.
- Avoid adding howler.js if the native engine is sufficient; avoid duplicate audio lifecycle stacks. Refs: ITEM-prior-art-15.

## Detailed Planning Implications

1. Start with integration scaffolding: add `corescope-overlay/denvermc-sound.js` and `corescope-overlay/denvermc-sound.css`, then update `scripts/apply-corescope-overlay.mjs` to copy/inject them in deterministic order after CoreScope and before/with shell hooks as appropriate.
2. Keep all vendor CoreScope files read-only. If any wrapping assumption is needed, document the exact public global/function and add a safe retry/defer installer so load order failures do not break the map.
3. Define the sound-mode enum and storage utility early. Validate enum values, catch storage errors, default to Off, and never persist unlocked/enabled state.
4. Implement UI before sound output: accessible label, keyboard operation, visible Off/mute path, suspended/unlocked/loading states, mobile layout, and old CoreScope Audio checkbox suppression.
5. Include the logo fix in the shell/UI phase: identify and reuse the main-site logo asset/branding, update map-shell markup/CSS, and verify accessible text.
6. Build the bridge and normalizer with fixtures before implementing rich sounds. Tests should confirm normalized events for generic packets, messages, node adverts, multi-observation packets, priority-like packets, and malformed/unknown packets.
7. Implement a central event router/rate limiter before mode details. Include token buckets/cooldowns by event class, duplicate hash collapsing, active-source caps, hidden-tab/route checks, and priority lane reservation.
8. Implement Native+ first as the baseline proof of the shared engine, master mix, compressor, and event taxonomy.
9. Implement Generative Key next using `AudioContext.currentTime` scheduling, not `setTimeout`-driven musical timing.
10. Implement Space Blaster procedurally with neutral names and no sample files.
11. Implement Orchestral Ensemble last, first with procedural fallback and an empty manifest. Treat any sample addition as a separate legal/provenance task with source URL, creator, license/deed, download date, sha256, and redistribution note.
12. Expose a test seam such as `window.__denvermcMapSound` with `getMode`, `setModeForTest`, `getStats`, and `normalizePacket` so CI can verify behavior without asserting audible output.
13. Verification should include Vitest/jsdom for storage, enum, normalizer, router/rate limiter, and deterministic mode mapping; Playwright for selector placement, default-off behavior, persistence display, audio unlock UX, keyboard flow, hidden old checkbox, and logo asset/branding.
14. Docker/static validation should confirm overlay assets and any optional manifest/samples are copied into CoreScope public output and served same-origin without changing the single-container topology.
15. Add manual listening checks as release gates, but do not make them the only verification path.

## Risk Register

| Risk | Severity | Mitigation | Source refs |
|------|----------|------------|-------------|
| Autoplay blocks restored sound or creates confusing suspended audio state | CRITICAL | Default runtime to Off/locked, create/resume audio only inside explicit user gesture, show clear enable state | ITEM-pitfalls-1, ITEM-stack-5, ITEM-architecture-5 |
| Persisting enabled playback violates opt-in expectations | CRITICAL | Persist selected mode only; keep unlock/enabled in memory; ignore legacy `live-audio-enabled` for new selector semantics | ITEM-pitfalls-2, ITEM-stack-4 |
| Accessibility regressions from hidden/audio-only controls | CRITICAL | Make audio supplemental, expose keyboard/screen-reader labels, keep Off reachable in all shell states, test keyboard/axe flows | ITEM-pitfalls-3, ITEM-architecture-6 |
| Packet bursts create noise, clipping, CPU spikes, or dropped frames | CRITICAL | Central router, token buckets, duplicate hash collapsing, active-source caps, priority lane, compressor/limiter | ITEM-pitfalls-4, ITEM-stack-10, ITEM-architecture-11 |
| Vendor edits or fragile monkey patches break CoreScope updates | CRITICAL | Overlay-only files; stable public seams first; safe bridge installer; document assumptions; no direct `vendor/CoreScope` edits | ITEM-pitfalls-10, ITEM-stack-1, ITEM-architecture-1 |
| Bundled samples are not legally safe | CRITICAL | Empty/procedural orchestral fallback first; require per-file provenance, license, sha256, source URL, and review before bundling | ITEM-pitfalls-7, ITEM-stack-7, ITEM-prior-art-10, ITEM-prior-art-11 |
| Space Blaster sounds too close to copyrighted/trademarked sci-fi assets | CRITICAL | Fully procedural synthesis, neutral UI/copy, no Star Wars/Collisions samples or names | ITEM-pitfalls-8, ITEM-architecture-10, ITEM-prior-art-13, ITEM-prior-art-14 |
| Musical timing jitters under map/render load | MODERATE | Use `AudioContext.currentTime` scheduling and short lookahead; enqueue semantics on main thread only | ITEM-pitfalls-5, ITEM-architecture-8 |
| Excess node allocation causes GC/audio glitches | MODERATE | Bound voice counts, reuse shared graph/effects, keep procedural voices simple, profile with Web Audio tools | ITEM-pitfalls-6, ITEM-architecture-4 |
| localStorage throws in private/restricted contexts | MODERATE | Wrap reads/writes, validate enum, default Off, store no packet-derived data | ITEM-pitfalls-9, ITEM-stack-4 |
| Lazy orchestral assets delay first interaction or bloat Docker image | MODERATE | Tiny/empty manifest, load after selection, show loading state, procedural fallback, same-origin cacheable assets | ITEM-pitfalls-11, ITEM-stack-8 |
| Message sonification leaks sensitive activity patterns | MODERATE | Coarse metadata only; never encode/speak text; subtle direct-message cues; no packet-derived persistence | ITEM-pitfalls-12 |
| Map shell continues to show wrong logo/branding | HIGH | Reuse main-site logo asset and accessible branding in overlay shell; include Playwright visual/DOM assertion | PROJECT.md constraint line 20, ITEM-architecture-6 |

## Conflicts & Tradeoffs

1. **Tone.js usefulness vs. no-new-dependency stack.** Prior art says Tone.js is the strongest fit for Generative Key scheduling and sampler-style orchestral work, while stack research recommends native Web Audio and no runtime dependency because the feature can be implemented with existing browser APIs and dependency budget should stay unchanged. Default tradeoff: implement native first and borrow Tone concepts only. Refs: ITEM-prior-art-5, ITEM-stack-2, ITEM-stack-9.
2. **Registering MeshAudio voices vs. owning a separate overlay engine strategy layer.** Stack research suggests registering through `window.MeshAudio.registerVoice()` where possible, while architecture recommends wrapping `MeshAudio.sonifyPacket` and using a singleton overlay engine so old CoreScope persistence/controls do not leak into the new feature. Default tradeoff: use `MeshAudio.sonifyPacket` as the bridge seam, but keep DenverMC state, unlock, routing, and modes in the overlay engine; only register voices if it does not reintroduce old semantics. Refs: ITEM-stack-3, ITEM-architecture-2, ITEM-architecture-4, ITEM-pitfalls-2.
3. **Persist selected mode vs. session opt-in.** Project requirements say selected mode should persist locally, but pitfalls warn that persisted enabled audio violates opt-in and autoplay expectations. Default tradeoff: persist preference only; require explicit unlock every session before sound plays. Refs: PROJECT.md constraints, ITEM-stack-4, ITEM-pitfalls-1, ITEM-pitfalls-2.
4. **Authentic Orchestral Ensemble vs. legal/bundle safety.** Project requests orchestral mappings, but pitfalls and prior art show realistic sample sets introduce licensing, attribution, size, and latency risk. Default tradeoff: create the manifest and procedural fallback now; add tiny CC0 samples later after review. Refs: ITEM-stack-7, ITEM-architecture-9, ITEM-pitfalls-7, ITEM-pitfalls-11, ITEM-prior-art-10, ITEM-prior-art-11.
5. **Informative sonification vs. privacy/accessibility.** Rich mappings can reveal event categories and activity patterns, while accessibility and privacy research require audio to remain supplemental and non-sensitive. Default tradeoff: sonify coarse metadata only, keep all critical information visual, and make Off always reachable. Refs: ITEM-pitfalls-3, ITEM-pitfalls-12, ITEM-prior-art-1, ITEM-prior-art-2.
6. **Branding fix scope vs. sound feature focus.** The map shell logo requirement is adjacent to sound work rather than part of sonification, but it touches the same overlay shell UI. Default tradeoff: include it in the shell/UI phase so the map uses the main-site logo asset before deeper sound mode work. Refs: PROJECT.md constraint line 20, ITEM-architecture-6.

## Confidence Assessment

| Dimension | Status | Confidence | Notes |
|-----------|--------|------------|-------|
| stack | complete | HIGH | Strong codebase-backed direction: overlay assets, Web Audio, localStorage, no new dependencies, same-origin/static deployment. |
| pitfalls | complete | HIGH | Risks are specific and actionable, especially autoplay, persistence, accessibility, bursts, licensing, and vendor-edit hazards. |
| architecture | complete | HIGH | Clear component boundaries, data flow, bridge seam, lifecycle guards, and test seams. |
| prior-art | complete | HIGH | Broad coverage of sonification, Web Audio, sampler/legal options, and procedural sci-fi references; supports the native/dependency-light approach while flagging Tone.js as a future option. |
| codex-analysis | missing | LOW | Optional supplemental research only; absence does not reduce confidence because all four Claude research dimensions are complete. |
