# Pitfalls Research: CoreScope Live Map Sound Modes

Project: Add opt-in map sound modes to the embedded CoreScope live map through the local overlay/patch layer, preserving the single Docker container and avoiding direct edits under `vendor/CoreScope`.

### ITEM-pitfalls-1: Autoplay breaks when sound is restored before a user gesture

- **What goes wrong:** A returning user previously selected a non-off mode, the page restores that state on `/map`, creates/resumes `AudioContext`, and the first packets silently fail or trigger a confusing unlock overlay because the browser suspended audio.
- **Root cause:** Audible Web Audio playback is generally blocked until user interaction. Current CoreScope vendor audio restores `live-audio-enabled=true` and eagerly calls `initAudio()` during `MeshAudio.restore()`, then shows an unlock overlay only after packet sonification hits a suspended context.
- **Prevention:** Keep `Sound Off` as the runtime default on load, even if a non-off mode is persisted; treat persisted mode as the selector value but require an explicit click/tap/keyboard activation before any context creation/resume or sound scheduling. On enable, call `AudioContext.resume()` inside that same trusted user event and show clear state: “Sound selected; press Enable sound.”
- **Severity:** CRITICAL
- **Phase relevance:** Phase 1 sound selector and audio engine lifecycle
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:169-183`
- **Checked:** 2026-05-14

### ITEM-pitfalls-2: Persisting “enabled” instead of “selected mode” violates opt-in expectations

- **What goes wrong:** A user chooses Native+ once, revisits later in a quiet environment, and the map attempts to play audio automatically because the stored state means “audio enabled,” not merely “preferred mode.”
- **Root cause:** Existing CoreScope audio persists `live-audio-enabled`, `live-audio-voice`, BPM, and volume in `localStorage`. That model is fine for a lab page but risky for a public live map where sound must be opt-in each session.
- **Prevention:** Store only a local non-sensitive preference such as `denvermc.map.soundMode = off|native-plus|generative-key|orchestral|space-blaster`; keep a separate in-memory `unlocked` flag that is never persisted. If the stored mode is not `off`, render it selected but muted/locked until user activation. Do not reuse `live-audio-enabled=true` semantics for the new map selector.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 1 storage model and migration from existing CoreScope audio
- **Confidence:** HIGH
- **Source:** Codebase + official docs — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:147-183`; https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Checked:** 2026-05-14

### ITEM-pitfalls-3: Accessibility regressions from audio-only feedback and hidden controls

- **What goes wrong:** Sound cues convey packet priority/message activity that is not available visually; keyboard or screen-reader users cannot find the selector; autoplay or long-running ambient sound interferes with screen readers; focus mode hides the only audio control.
- **Root cause:** Sonification can easily become a parallel UI layer rather than decoration. WCAG requires user control for audio that starts automatically and lasts more than 3 seconds, and WAI techniques recommend playing sounds only on user request to avoid disrupting assistive technology.
- **Prevention:** Make sound strictly supplemental. Keep all packet status visible in the map/feed; add a keyboard-reachable selector with explicit labels, `aria-label`/`aria-describedby`, and a persistent mute/off path visible in minimal, analyzer, and focus states. Ensure the selector remains reachable after CoreScope live controls collapse, and test with Playwright/axe plus keyboard-only flow.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 1 UI controls; Phase 4 a11y validation
- **Confidence:** HIGH
- **Source:** Official accessibility guidance + codebase — https://www.w3.org/WAI/WCAG22/Understanding/audio-control; https://www.w3.org/WAI/WCAG22/Techniques/general/G171.html; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:134-265`
- **Checked:** 2026-05-14

### ITEM-pitfalls-4: Packet bursts turn sonification into noise or a CPU spike

- **What goes wrong:** During high activity, every packet/message schedules notes, zaps, or samples; audio becomes chaotic, active voices pile up, visual animation stutters, and the browser may drop audio or frames.
- **Root cause:** Live packet events are bursty and can include multiple observations per hash. Existing audio is called once per consolidated packet before feed dedup and has only a coarse `MAX_VOICES = 12` gate; it does not provide per-event-type rate limits, priority lanes, cooldowns, or mode-specific mixing rules.
- **Prevention:** Add a central sound event router with token buckets/cooldowns per event class: messages, node adverts/dots, route traces, priority/emergency. Collapse duplicate observations by hash before audio, cap concurrent voices lower on mobile, reserve a high-priority lane for emergency/priority cues, and drop or merge low-priority node pings under load. Use tasteful default volume and a master limiter/compressor.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 2 event router and Native+/mode implementations
- **Confidence:** HIGH
- **Source:** Codebase + official tooling — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:12-13`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2362-2367`; https://developer.chrome.com/docs/devtools/webaudio
- **Checked:** 2026-05-14

### ITEM-pitfalls-5: Audio timing jitters if notes are driven by timers or visual animation callbacks

- **What goes wrong:** Generative Key arpeggios and Orchestral/Space Blaster cues drift, flam, or bunch up when the map is busy rendering Leaflet animations, Matrix rain, feed updates, or GC runs.
- **Root cause:** `setTimeout`, `setInterval`, and `requestAnimationFrame` run on the main thread and are delayed by layout, rendering, network callbacks, and garbage collection. Audio timing needs `AudioContext.currentTime` and scheduled `AudioParam`/source events.
- **Prevention:** Use main-thread events only to enqueue semantic sound events. Schedule actual notes and envelopes against `audioContext.currentTime` with a short lookahead. Keep visual sync best-effort by reading the audio clock rather than making audio wait for map animation callbacks. Do not build musical timing from Leaflet hop animation callbacks except for lightweight accents.
- **Severity:** MODERATE
- **Phase relevance:** Phase 2 shared engine; Phase 3 generative/orchestral modes
- **Confidence:** HIGH
- **Source:** Official guidance + codebase — https://web.dev/articles/audio-scheduling; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:78-120`
- **Checked:** 2026-05-14

### ITEM-pitfalls-6: Creating/destroying many audio nodes per packet causes GC and audio glitches

- **What goes wrong:** Generative Key or Space Blaster creates oscillators, filters, panners, gains, and buffers per packet; after several bursts, users hear clicks/stutters or see CPU spikes.
- **Root cause:** Real-time audio has tight deadlines. Short-lived JS objects and node graphs increase garbage collection pressure; GC pauses are especially damaging to audio. Existing CoreScope voice code creates multiple oscillator/gain nodes per sampled byte and per chord voice, then disconnects them after scheduled completion.
- **Prevention:** Keep procedural modes simple and bounded: reuse a single `AudioContext`, master bus, limiter, and shared effects; use short-lived oscillators only for brief events with hard caps; pool reusable nodes where feasible; avoid heavy DSP and allocations in audio callbacks. Do not introduce AudioWorklet unless the procedural synth genuinely needs it; if using one, avoid allocations in `process()`.
- **Severity:** MODERATE
- **Phase relevance:** Phase 2 engine performance; Phase 4 profiling
- **Confidence:** HIGH
- **Source:** Browser performance guidance + codebase — https://hacks.mozilla.org/2020/05/high-performance-web-audio-with-audioworklet-in-firefox/; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:96-132`
- **Checked:** 2026-05-14

### ITEM-pitfalls-7: “CC0 sample set” is not automatically safe to bundle

- **What goes wrong:** The app bundles a small harp/celeste/woodwind/brass sample set labeled “free,” but one file is actually CC-BY, CC-BY-NC, Sampling+, trademarked, a copyrighted upload, or lacks redistribution proof. The Docker image then redistributes it to everyone.
- **Root cause:** Freesound and similar libraries host per-sound licenses; CC0 has no warranty and does not clear trademark, patent, privacy, publicity, or third-party rights. “Free” and “royalty-free” are not the same as CC0/public-domain-safe redistribution.
- **Prevention:** For initial implementation, structure Orchestral Ensemble to lazy-load from an empty or clearly isolated sample manifest and ship no samples unless each file has archived proof: source URL, creator, license/deed, download date, and redistribution note. Prefer procedural fallback or explicitly CC0 sources; reject CC-BY-NC and unclear “royalty-free” packs. If using CC-BY later, build attribution UI/docs before adding assets.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 3 Orchestral Ensemble asset pipeline; release review
- **Confidence:** HIGH
- **Source:** License docs — https://creativecommons.org/publicdomain/zero/1.0/legalcode.en; https://freesound.org/help/faq/
- **Checked:** 2026-05-14

### ITEM-pitfalls-8: Space Blaster crosses into copyrighted sound-alike territory

- **What goes wrong:** “Space Blaster” uses Star Wars samples or too-close recreations marketed as lightsabers/blasters; even if files are found online, the site ships copyrighted/trademark-associated audio.
- **Root cause:** Sci-fi sounds are easy to imitate by copying famous assets. The project constraint explicitly forbids copyrighted Star Wars samples and unauthorized Andrew Huang Collisions assets.
- **Prevention:** Make Space Blaster fully procedural with oscillator sweeps, filtered noise bursts, envelopes, stereo panning, and delay/reverb-like effects generated at runtime. Name and UI copy should say “Space Blaster” or “sci-fi zaps,” not Star Wars terms. Keep no sample files for this mode unless license proof is reviewed separately.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 3 Space Blaster implementation; release/legal review
- **Confidence:** HIGH
- **Source:** Project constraints + CC0 caveats — Forge project prompt; https://creativecommons.org/publicdomain/zero/1.0/legalcode.en
- **Checked:** 2026-05-14

### ITEM-pitfalls-9: Local preference storage fails in private/restricted contexts

- **What goes wrong:** The selector works in normal Chrome but throws `SecurityError` or `QuotaExceededError` in private browsing, blocked-storage environments, or unusual origins; the whole overlay breaks or defaults unpredictably.
- **Root cause:** `localStorage` is synchronous, origin-scoped, can be blocked by user/browser policy, and can throw on read/write. Existing overlay code correctly wraps shell preference reads/writes, while vendor CoreScope audio writes are not consistently guarded.
- **Prevention:** Implement sound-mode storage with the same defensive overlay pattern already used by `denvermc-shell.js`: wrap all reads/writes in `try/catch`, validate stored enum values, fall back to `off`, and never store sensitive packet/message content. Avoid storing sample manifests or large data in `localStorage`.
- **Severity:** MODERATE
- **Phase relevance:** Phase 1 storage utility; Phase 4 browser testing
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage; https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:53-62`
- **Checked:** 2026-05-14

### ITEM-pitfalls-10: Editing vendor CoreScope or relying on unstable internals makes upgrades painful

- **What goes wrong:** The feature is implemented by modifying `vendor/CoreScope/public/audio.js` or `live.js`; the next CoreScope submodule update overwrites changes or creates merge conflicts. Alternatively, an overlay monkey-patches private globals and breaks when upstream renames a function.
- **Root cause:** CoreScope public assets are vendored, while this site already has an overlay copy/inject system. The existing overlay only owns its own CSS/JS and injects managed tags into `index.html`; direct vendor edits violate the project constraint.
- **Prevention:** Add new sound-mode assets under `corescope-overlay` and extend `scripts/apply-corescope-overlay.mjs` to copy/inject them in deterministic order. Use stable public seams first (`window.MeshAudio`, DOM controls, custom events emitted by overlay). If a CoreScope packet hook is missing, patch by wrapping at the overlay boundary and document the exact vendor assumptions; do not edit `vendor/CoreScope`.
- **Severity:** CRITICAL
- **Phase relevance:** Phase 1 integration design; all implementation phases
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs:2-24`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:11-13`
- **Checked:** 2026-05-14

### ITEM-pitfalls-11: Lazy-loaded orchestral assets can hurt first interaction and Docker simplicity

- **What goes wrong:** Selecting Orchestral Ensemble downloads megabytes of samples on the first click, delays the unlock/play gesture, fails offline/cache unpredictably, or bloats the single Docker image unexpectedly.
- **Root cause:** Sample playback requires fetching/decoding audio buffers, which is asynchronous and can exceed the timing window of a user gesture if mixed with context setup. Bundled assets also become part of the container and need cache-busting plus license review.
- **Prevention:** Keep initial sample manifest tiny or empty. If samples are bundled later, preload/decode only after the user selects/enables Orchestral, show loading state, cache decoded buffers in memory only, and fall back to procedural bell/woodwind approximations if fetch/decode fails. Do not block the global sound enable gesture on sample availability.
- **Severity:** MODERATE
- **Phase relevance:** Phase 3 Orchestral Ensemble; Docker/build validation
- **Confidence:** MEDIUM
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile:82-96`
- **Checked:** 2026-05-14

### ITEM-pitfalls-12: Message sonification can leak or over-emphasize sensitive activity

- **What goes wrong:** Group/direct messages get distinctive melodies or loud accents that reveal message volume, priority, or channel activity to bystanders; worse, mapping text bytes directly to melody makes private activity feel encoded or inspectable.
- **Root cause:** Packet audio is ambient and public to anyone near the device. The live feed already renders message previews; adding sound increases the chance of unintended disclosure or distraction, especially for emergency/priority cues.
- **Prevention:** Do not speak or encode message text content. Map only coarse event metadata: type, priority, count, and hash-bucketed variation. Keep direct-message cues subtle and non-semantic, and provide a one-click Sound Off/mute path. Avoid persisting any packet-derived data in storage.
- **Severity:** MODERATE
- **Phase relevance:** Phase 2 event taxonomy; Phase 3 per-mode sound design
- **Confidence:** MEDIUM
- **Source:** Codebase + storage/security guidance — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:3134-3160`; https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/12-Testing_Browser_Storage
- **Checked:** 2026-05-14

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-pitfalls-1 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:169-183` |
| ITEM-pitfalls-2 | HIGH | Codebase + Official docs | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:147-183`; https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| ITEM-pitfalls-3 | HIGH | Official accessibility guidance + Codebase | https://www.w3.org/WAI/WCAG22/Understanding/audio-control; https://www.w3.org/WAI/WCAG22/Techniques/general/G171.html; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:134-265` |
| ITEM-pitfalls-4 | HIGH | Codebase + Official tooling | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:12-13`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2362-2367`; https://developer.chrome.com/docs/devtools/webaudio |
| ITEM-pitfalls-5 | HIGH | Official guidance + Codebase | https://web.dev/articles/audio-scheduling; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:78-120` |
| ITEM-pitfalls-6 | HIGH | Browser performance guidance + Codebase | https://hacks.mozilla.org/2020/05/high-performance-web-audio-with-audioworklet-in-firefox/; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:96-132` |
| ITEM-pitfalls-7 | HIGH | License docs | https://creativecommons.org/publicdomain/zero/1.0/legalcode.en; https://freesound.org/help/faq/ |
| ITEM-pitfalls-8 | HIGH | Project constraints + License docs | Forge project prompt; https://creativecommons.org/publicdomain/zero/1.0/legalcode.en |
| ITEM-pitfalls-9 | HIGH | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage; https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:53-62` |
| ITEM-pitfalls-10 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs:2-24`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:11-13` |
| ITEM-pitfalls-11 | MEDIUM | Official docs + Codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile:82-96` |
| ITEM-pitfalls-12 | MEDIUM | Codebase + Security guidance | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:3134-3160`; https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/12-Testing_Browser_Storage |
