# Pitfalls Research — Live Map Audio Quality

Project: Brownfield Colorado Mesh/CoreScope browser overlay audio improvements for richer orchestral mode, redesigned Space Blaster mode, and event-accent-focused map sonification.

Checked: 2026-05-15

### ITEM-pitfalls-1: Browser audio fails unless unlock stays tied to a real user gesture

- **What goes wrong:** A richer sound engine preloads, creates, or resumes `AudioContext` during page load or WebSocket traffic; Chrome/Safari/Firefox keep the context suspended, the first map events are silently dropped, and users think audio is broken.
- **Root cause:** Modern browser autoplay policy blocks audible Web Audio unless created/resumed from a trusted user gesture. Brownfield overlays are especially vulnerable because upstream CoreScope can emit packets before the Colorado Mesh sound controls are touched.
- **Prevention:** Keep sound off by default; create/resume audio only from the sound mode selector/sheet gesture; surface `locked/suspended` diagnostics in `window.__coloradoMeshSound.getState()`; do not prime samples or start the density bed until after unlock. Preserve the existing `setMode(..., { userGesture: true })` path in `corescope-overlay/denvermc-shell.js` and the guarded `ensureAudioContext()` path in `corescope-overlay/denvermc-sound.js`.
- **Severity:** CRITICAL
- **Phase relevance:** First implementation pass and browser smoke testing.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-2: Token-bucket/dedupe logic can be present but not actually gate playback

- **What goes wrong:** Busy map traffic still produces too many accents even though the code appears to dedupe and throttle; repeated events clog the musical queue and Space Blaster becomes fatiguing/noisy under live load.
- **Root cause:** In the current `routeEvent()` implementation, `accentAllowed = acceptDedupe(event, now) && acceptBucket(event, now)` is computed, but `markPlayed(event)` is called regardless. That means dedupe/bucket results update counters but do not prevent queuing accents. Later cooldown/voice caps help, but the first-line traffic control is bypassed.
- **Prevention:** Gate musical accent enqueueing on `accentAllowed`; still update density/traffic bed for dropped accent events. Add regression tests that inject duplicate/high-rate packets and assert `sequencer.queued`, `counters.deduped`, `counters.throttled`, and `counters.played` behavior. Treat this as a blocker before making blaster/orchestral richer.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 1 engine correctness before sound design expansion.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` (`routeEvent`, `acceptDedupe`, `acceptBucket`, `enqueueMusicalEvent`)
- **Checked:** 2026-05-15

### ITEM-pitfalls-3: Richer orchestral mode regresses into “two samples” if the manifest remains role-sparse

- **What goes wrong:** Orchestral mode sounds repetitive and toy-like even after adding scheduling, because most events route through the same one or two sample IDs; users hear harp/clarinet over and over instead of an ensemble.
- **Root cause:** The current manifest has only four total samples. `messages` has two, `node` has one, and `priority` has two; `loadedSampleForRole()` can only round-robin within those small role pools. Layering procedural sine/triangle tones cannot fully hide insufficient timbral and articulation variety.
- **Prevention:** Expand the manifest by role, not just total count: at minimum 3-5 short CC0 samples per high-frequency role (`messages`, `node`, `priority`) across strings/woodwinds/plucks/percussion with round-robin variants. Keep samples short and normalized; validate every role has multiple IDs in Docker smoke and/or Vitest. Use deterministic seeded selection plus round-robin so repeated event classes vary without becoming random noise.
- **Severity:** MODERATE
- **Phase relevance:** Orchestral asset selection and manifest update.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-4: Adding many high-quality WAVs can blow up memory and first-use latency

- **What goes wrong:** A “symphony” sample pack makes the map sluggish on phones: every ensemble sample is fetched and decoded on first unlock, decoded PCM consumes far more memory than the compressed/source file size, and the first audible accent is late or missing.
- **Root cause:** `decodeAudioData()` requires complete file data and returns decoded PCM `AudioBuffer`s resampled to the `AudioContext` sample rate. The current `primeEnsembleSamples()` eagerly loads every manifest sample once ensemble mode is unlocked.
- **Prevention:** Keep bundled samples short one-shots, prefer web-friendly compressed assets only if browser decode support is verified, cap decoded buffers, and lazy-load by role/priority instead of always loading the entire orchestra. Reuse decoded `AudioBuffer`s; never decode the same URL per event. Add manifest budget checks for total encoded bytes and sample duration.
- **Severity:** MODERATE
- **Phase relevance:** Asset pipeline and mobile performance testing.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-5: AudioWorklet enhancements can fail in production if secure-context and fallback behavior are not preserved

- **What goes wrong:** The density bed works locally but disappears in production-like contexts, or a processor exception permanently silences the worklet output while the UI still says sound is on.
- **Root cause:** `BaseAudioContext.audioWorklet` is secure-context-only, `addModule()` is asynchronous, the processor name must match `registerProcessor()`, and uncaught processor errors lead to `processorerror`/silence. The overlay also depends on `/sound/denvermc-density-worklet.js` being copied into the Docker-served CoreScope public directory.
- **Prevention:** Keep feature detection and procedural fallback; always wait for `audioWorklet.addModule()` before `new AudioWorkletNode`; keep processor names stable; preserve Docker smoke checks for the worklet URL; test HTTPS/production container paths, not only Next dev. Do not put DOM, fetch, timers, or map state inside the processor.
- **Severity:** MODERATE
- **Phase relevance:** Density bed changes and deployment validation.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet; https://webaudio.github.io/web-audio-api/; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/denvermc-density-worklet.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`
- **Checked:** 2026-05-15

### ITEM-pitfalls-6: Real-time audio code glitches when it allocates or does too much work per render quantum

- **What goes wrong:** Under active traffic, audio crackles, drops out, or stutters even though CPU seems fine on the main thread.
- **Root cause:** Web Audio rendering has tight deadlines. Excess `AudioNode` counts, heavy `AudioWorkletProcessor.process()` logic, and allocations/GC on the audio path can miss render deadlines. The current worklet is simple, but richer synthesis or “symphony” logic could tempt moving too much into the processor.
- **Prevention:** Keep the worklet limited to a low-cost density bed controlled by `AudioParam`s; schedule accents on the main Web Audio graph with capped voices; precompute tables/noise where practical; avoid allocations in `process()`; profile with Chrome Web Audio tooling under synthetic packet bursts before shipping.
- **Severity:** CRITICAL
- **Phase relevance:** Sound engine implementation and load testing.
- **Confidence:** HIGH
- **Source:** Official/performance docs — https://web.dev/articles/profiling-web-audio-apps-in-chrome; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet
- **Checked:** 2026-05-15

### ITEM-pitfalls-7: Space Blaster sounds harsh when every event is a bright, fast, high-Q laser

- **What goes wrong:** Space Blaster feels cheap or irritating: saw/square waves, very fast attacks, high-Q filters, and noise bursts fire for common packets, so busy traffic becomes a brittle arcade barrage rather than musical event accents.
- **Root cause:** The current blaster implementation uses extremely short attacks (`0.002-0.003`), sawtooth/square oscillators, high filter Q (`2.6-4.2`), and noise bursts for normal/priority events. Auditory-display guidance warns against abrupt, overly numerous, poorly differentiated alert sounds.
- **Prevention:** Redesign blaster as a softer sci-fi palette: sine/triangle/FM-like chirps, lower resonance, smoother attack/release, fewer noise bursts, and clear urgency mapping where only priority events get faster/brighter motion. Use a small musical scale and repeatable motif families instead of raw laser sweeps for every packet.
- **Severity:** MODERATE
- **Phase relevance:** Space Blaster redesign.
- **Confidence:** HIGH
- **Source:** Codebase + auditory display guidelines — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://www.nationalacademies.org/read/5436/chapter/7
- **Checked:** 2026-05-15

### ITEM-pitfalls-8: Event sonification becomes annoying when priority, density, and repetition are not perceptually mapped

- **What goes wrong:** Users disable audio because the map creates constant beeps, alerts are hard to distinguish, or low-priority background traffic sounds as urgent as emergencies/messages.
- **Root cause:** Non-speech auditory displays need restrained vocabularies, differentiated pitch/timbre/rhythm, smooth onsets, and urgency mapping. Too many similar event sounds require training and cause fatigue; very short sounds can be masked or missed.
- **Prevention:** Treat map audio as event accents plus a subtle density bed, not continuous packet playback. Limit the number of recognizable cue families; reserve faster pulses/brighter timbres/louder layers for priority; keep low traffic soft and sparse; use smooth envelopes and stable musical key centers. Validate by listening to captured busy/quiet traffic sequences, not isolated test clicks.
- **Severity:** MODERATE
- **Phase relevance:** Preset tuning and acceptance testing.
- **Confidence:** HIGH
- **Source:** Auditory display guidelines — https://www.nationalacademies.org/read/5436/chapter/7; https://sonification.de/handbook/downloads/
- **Checked:** 2026-05-15

### ITEM-pitfalls-9: Overlapping accents clip or pump if gain staging is an afterthought

- **What goes wrong:** Orchestral layers and blaster accents sound distorted, compressed, or painfully loud when several events land together.
- **Root cause:** Multiple Web Audio sources sum together. The current graph has category gains and a `DynamicsCompressorNode`, but richer samples/layers can still exceed headroom if per-sample gains are tuned in isolation. A compressor prevents some clipping but cannot rescue a bad mix.
- **Prevention:** Keep per-voice, role-bus, master, and limiter/compressor gain staging. Tune with worst-case overlap at `volume=1`, not just default `0.3`. Preserve `maxActiveVoices`, reduce per-layer gains when adding harmony, and add tests/diagnostics for peak-prone scenarios. Use the compressor as a safety net, not the main volume control.
- **Severity:** MODERATE
- **Phase relevance:** Mixing, sample normalization, and preset QA.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-10: Using message contents or raw payload bytes for sound generation creates privacy and trust problems

- **What goes wrong:** The audio engine inadvertently encodes message contents, channel content, or raw packet bytes into audible motifs; users perceive it as leaking private data or making encrypted/user messages into entertainment.
- **Root cause:** The legacy CoreScope audio plan explicitly mapped raw payload bytes to notes. The current Colorado Mesh project constraint says not to use message contents for sound generation, and the current overlay mostly uses packet metadata, type, channel labels/hashes, counts, hops, timestamps, and hashed seeds.
- **Prevention:** Keep sonification inputs limited to non-content metadata: packet type, priority/emergency classification, observation count, hop count, replay flag, timestamp, and stable hash IDs. Do not parse text payloads, decrypted message bodies, or raw payload bytes for pitches/rhythms. Document this in tests and code comments so future “more variation” work does not reintroduce payload sonification.
- **Severity:** CRITICAL
- **Phase relevance:** Sound mapping design and code review.
- **Confidence:** HIGH
- **Source:** Project constraints + codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/.forge/PROJECT.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/AUDIO-PLAN.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-11: Accessibility regressions happen if the density bed acts like autoplaying background audio

- **What goes wrong:** A user opens the live map and hears continuing audio they did not ask for, or cannot quickly stop/adjust it independently from system volume; this violates user expectations and can fail WCAG audio-control requirements.
- **Root cause:** The density bed is long-running by design, unlike a sub-three-second UI click. WCAG requires a pause/stop or independent volume mechanism for audio that starts automatically and lasts more than three seconds.
- **Prevention:** Preserve default `Sound Off`, visible mode and volume controls, the mobile sound sheet, and the ability to switch off immediately. Never auto-enable from saved upstream CoreScope settings. If adding preview/test sounds, keep them explicitly user-triggered and short.
- **Severity:** CRITICAL
- **Phase relevance:** UI integration and accessibility regression testing.
- **Confidence:** HIGH
- **Source:** Accessibility standard + codebase — https://www.w3.org/WAI/WCAG22/Understanding/audio-control; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-12: Brownfield CoreScope audio can double-play if suppression breaks after upstream changes

- **What goes wrong:** Users hear both upstream CoreScope audio and Colorado Mesh audio, causing phasing, doubled accents, and confusing controls.
- **Root cause:** This overlay patches `window.MeshAudio`, disables upstream controls in the DOM, stores `live-audio-enabled=false`, and watches mutations. Any upstream rename, load-order change, or DOM refactor can bypass suppression.
- **Prevention:** Keep suppression idempotent and defensive; retain the `window.__denvermcMapSound` alias only for compatibility while keeping user-facing labels Colorado Mesh; add smoke/Playwright tests that assert upstream `liveAudioToggle` is hidden/disabled and `MeshAudio.isEnabled()` returns false after route changes and delayed CoreScope mounts.
- **Severity:** MODERATE
- **Phase relevance:** Integration tests after any CoreScope submodule or overlay load-order change.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-13: Sample licensing/attribution can block deployment late

- **What goes wrong:** The team finds better orchestral or sci-fi assets, ships them into Docker, then discovers attribution, non-commercial, share-alike, or redistribution terms are incompatible with the site.
- **Root cause:** High-quality orchestral samples are often not truly public domain/CC0, and “free” sample sites can have pack-specific restrictions. The current manifest and attribution file correctly track license/source/attribution, but richer asset work increases the chance of mistakes.
- **Prevention:** Accept only CC0/public-domain/permissive assets with redistribution allowed. Require every manifest sample to include `license`, `sourceUrl`, and `attribution`; keep `ATTRIBUTION.md` current; fail CI/smoke if fields are missing. Prefer generating Space Blaster procedurally to avoid sci-fi SFX licensing ambiguity.
- **Severity:** MODERATE
- **Phase relevance:** Asset acquisition and CI validation.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/ATTRIBUTION.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`
- **Checked:** 2026-05-15

### ITEM-pitfalls-14: Tests that only check files exist will miss musical regressions

- **What goes wrong:** Docker smoke passes because assets are non-empty, but orchestral mode still repeats two samples, throttling is ineffective, Space Blaster is harsh, or audio diagnostics regress.
- **Root cause:** The current Docker smoke validates the overlay asset URLs, manifest shape, sample presence, worklet URL, and attribution file. It does not exercise the sequencer, dedupe/bucket gating, role diversity, blaster pitch ranges, gain staging, or user-gesture state transitions.
- **Prevention:** Add focused jsdom/Vitest tests around `window.__coloradoMeshSound`: normalization, route/drop reasons, dedupe gating, token buckets, queue caps, role/sample variation, blaster frequency/Q bounds, and mode changes. Keep Docker smoke for deployment paths, but do not treat it as audio-quality coverage.
- **Severity:** MODERATE
- **Phase relevance:** Regression suite before final tuning.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-15: User-facing Colorado Mesh branding can regress during audio work

- **What goes wrong:** New controls, diagnostics, warnings, or sample labels expose “DenverMC” even though current user-facing branding must be Colorado Mesh.
- **Root cause:** The brownfield overlay still uses historical filenames, CSS classes, IDs, and compatibility aliases with `denvermc` names. Those are acceptable internal identifiers, but new visible copy can easily copy the internal name.
- **Prevention:** Keep internal filenames/aliases stable unless there is a separate migration, but require all visible strings, aria labels, console warnings intended for operators, and docs exposed through the UI to say Colorado Mesh. Add string checks for visible audio UI if new labels are introduced.
- **Severity:** MINOR
- **Phase relevance:** UI copy review and accessibility labels.
- **Confidence:** HIGH
- **Source:** Project constraint + codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/.forge/PROJECT.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-pitfalls-1 | HIGH | Official docs + codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-2 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-3 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json` |
| ITEM-pitfalls-4 | HIGH | Official docs + codebase | https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-5 | HIGH | Official docs + codebase | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet; https://webaudio.github.io/web-audio-api/ |
| ITEM-pitfalls-6 | HIGH | Performance docs | https://web.dev/articles/profiling-web-audio-apps-in-chrome |
| ITEM-pitfalls-7 | HIGH | Codebase + guidelines | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://www.nationalacademies.org/read/5436/chapter/7 |
| ITEM-pitfalls-8 | HIGH | Auditory display guidelines | https://www.nationalacademies.org/read/5436/chapter/7; https://sonification.de/handbook/downloads/ |
| ITEM-pitfalls-9 | HIGH | Official docs + codebase | https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-10 | HIGH | Project constraints + codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/.forge/PROJECT.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/AUDIO-PLAN.md` |
| ITEM-pitfalls-11 | HIGH | Accessibility standard + codebase | https://www.w3.org/WAI/WCAG22/Understanding/audio-control |
| ITEM-pitfalls-12 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js` |
| ITEM-pitfalls-13 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/ATTRIBUTION.md` |
| ITEM-pitfalls-14 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/docker-smoke.mjs`; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json` |
| ITEM-pitfalls-15 | HIGH | Project constraints + codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/.forge/PROJECT.md`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js` |
