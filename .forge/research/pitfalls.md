# Pitfalls Research: Colorado Mesh CoreScope Map Sound + Mobile Overlay

Project domain: browser-local event sonification for a high-traffic live map, layered over CoreScope via `corescope-overlay/` without editing `vendor/CoreScope`, plus mobile/portrait overlay polish.

Checked: 2026-05-15

### ITEM-pitfalls-1: One sound per packet makes busy traffic thinner, not fuller

- **What goes wrong:** Every accepted packet tries to trigger a discrete cue; when traffic gets busy, token buckets, cooldowns, and voice caps drop most events, so the audible result becomes sparse or silent exactly when the map is most active.
- **Root cause:** Per-event sonification treats traffic rate as a scheduling problem instead of a musical density problem. The current overlay has lane token buckets (`priority`, `normal`, `low`) and mode cooldowns that reject events before they can contribute to the soundscape (`corescope-overlay/denvermc-sound.js`, buckets at lines 52-56, bucket rejection at lines 1038-1050, cooldown/voice rejection at lines 779-787).
- **Prevention:** Keep a bounded one-shot lane for salient events, but always feed every normalized metadata-only event into cheap rolling density accumulators (events/sec, lane mix, priority count, hop/observation intensity). Use those accumulators to drive a continuous bed, chord density, tremolo/noise density, or arpeggiator subdivision so high traffic sounds fuller even when individual one-shots are rate-limited.
- **Severity:** CRITICAL
- **Phase relevance:** Sound-engine redesign and load/backpressure testing.
- **Confidence:** HIGH
- **Source:** Local code + WebSearch — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://sonification.de/handbook/downloads/
- **Checked:** 2026-05-15

### ITEM-pitfalls-2: Backpressure that drops data before musical aggregation erases the signal

- **What goes wrong:** Throttled or deduped packets disappear from both the audible cue stream and the perceived activity model; busy map periods no longer increase density, loudness, or harmonic activity.
- **Root cause:** The current route path rejects on dedupe/token bucket before `markPlayed()`, and only accepted events increment the `played/routed/priority` sound counters. This is safe for CPU but wrong for “traffic feels fuller” because dropped events carry activity information (`corescope-overlay/denvermc-sound.js`, lines 1090-1107).
- **Prevention:** Split ingestion from cue playback. Stage 1: normalize and increment bounded rolling metrics for all valid metadata events. Stage 2: decide whether to emit one-shots from priority-aware buckets. Stage 3: render the continuous/generative layer from aggregated metrics at a fixed cadence. Dropping a one-shot must never drop the traffic-density contribution.
- **Severity:** CRITICAL
- **Phase relevance:** Event pipeline redesign before tuning sound modes.
- **Confidence:** HIGH
- **Source:** Local code + WebSearch — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://web.dev/articles/audio-scheduling
- **Checked:** 2026-05-15

### ITEM-pitfalls-3: Autoplay unlock works on desktop but fails or relocks on mobile Safari/Chrome

- **What goes wrong:** A persisted non-off mode displays “Tap to start,” but selecting/changing controls does not reliably start audio; after app switch, lock screen, route change, or fullscreen/focus changes, the context can return to `suspended`/`interrupted` and events are silently dropped as `locked`.
- **Root cause:** Modern browsers require Web Audio playback to be created/resumed from a user activation. Chrome applies autoplay policy to Web Audio, and iOS/Safari can suspend or interrupt contexts when the page loses focus. The current overlay creates/resumes in `ensureAudioContext()` and exposes status, but it does not visibly separate “mode selected” from “audio unlocked,” nor does it listen for `statechange`/`visibilitychange` to recover UX state.
- **Prevention:** Use a clear opt-in “Start sound” control that calls `AudioContext.resume()` directly inside the tap/click handler, then switches mode. Add `audioCtx.onstatechange` and `document.visibilitychange` handling to update status and require a new tap when the context becomes suspended/interrupted. Preserve the browser-local, opt-in rule: never auto-resume from background events.
- **Severity:** CRITICAL
- **Phase relevance:** Sound controls and mobile QA.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://developer.chrome.com/blog/autoplay/; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-4: Runaway AudioNodes and timer-based voice accounting cause leaks or false throttling

- **What goes wrong:** Under bursty traffic, many oscillators, buffer sources, filters, gains, cleanup timers, and scheduled stops are created. If `onended` does not fire promptly, timers are throttled, or cleanup races mode changes, `activeVoices` can stay high and future sound is rejected; on mobile this can also burn CPU/battery.
- **Root cause:** Web Audio sources are one-shot nodes, and the current code creates fresh nodes per cue, tracks them in sets, and decrements `activeVoices` with `setTimeout()` based on estimated duration (`corescope-overlay/denvermc-sound.js`, lines 485-527, 687-711, 790-799). Browser timers can be throttled in hidden/background pages, while audio-source lifecycle and JS cleanup are separate concerns.
- **Prevention:** Keep one-shot source creation, but make scheduling centrally bounded: fixed maximum scheduled horizon, fixed maximum voices per lane, deterministic `onended` cleanup, emergency `stopAllScheduledCues()` on visibility hidden/off/mode change, and a periodic reconciliation that derives active voice count from live source sets instead of trusting timers. Do not attempt to reuse `AudioBufferSourceNode`; reuse only decoded `AudioBuffer`s.
- **Severity:** CRITICAL
- **Phase relevance:** Sound-engine implementation and stress testing.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-5: Sample decoding can blow mobile memory even when compressed files are small

- **What goes wrong:** Adding more orchestral samples or longer files appears harmless in the repo but crashes or stutters on phones because decoded `AudioBuffer`s are resident PCM, not compressed assets.
- **Root cause:** `decodeAudioData()` decodes complete files into memory and resamples to the `AudioContext` sample rate. The current ensemble mode primes every manifest sample once unlocked (`corescope-overlay/denvermc-sound.js`, lines 652-657). That is acceptable for the current tiny manifest, but it becomes dangerous if future “better sound” work adds many long WAVs.
- **Prevention:** Keep samples short, mono where possible, normalized, and aggressively curated. Lazy-load by role/mode, cap manifest size/duration, preflight total decoded seconds, and expose a procedural fallback. Do not decode long loops or many velocity layers into `AudioBuffer`; use procedural synthesis or a small set of short samples.
- **Severity:** MODERATE
- **Phase relevance:** Ensemble sample selection and asset review.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; https://webaudio.github.io/web-audio-api/; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json`
- **Checked:** 2026-05-15

### ITEM-pitfalls-6: Compressor-as-limiter hides clipping but creates pumping and fatigue

- **What goes wrong:** High traffic stacks cues into a compressor, causing audible pumping, harsh transients, or distorted output. Turning up density then makes the mix smaller instead of richer.
- **Root cause:** A `DynamicsCompressorNode` can help prevent clipping, but it is not a substitute for gain staging. The current graph routes all modes through `masterGain -> DynamicsCompressorNode -> destination` with threshold `-10`, ratio `10` (`corescope-overlay/denvermc-sound.js`, lines 242-251). If individual mode gains are not budgeted per lane/bus, busy passages overdrive the limiter.
- **Prevention:** Use explicit mix buses: ambience/density bed, one-shot accents, priority alerts. Leave headroom at each bus, scale gains by active density, normalize sample loudness offline, and use the compressor gently as a final safety net. Prefer richer timbre/harmony/rhythm over raw gain increases for “fuller.”
- **Severity:** MODERATE
- **Phase relevance:** Sound design and mix tuning.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode; https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch03.html; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-7: Privacy regression by accidentally sonifying message content

- **What goes wrong:** A future “smarter” sound mapping reads packet payload text, channel messages, node names, or raw contents to choose notes/timbres, violating the project’s metadata-only constraint and risking sensitive message disclosure through logs, UI state, or audible patterns.
- **Root cause:** Packet normalization code has access to decoded payload objects. The current code mostly uses type, channel metadata, hashes, hop count, observation count, raw-byte-derived intensity, and timestamps; that boundary can erode when trying to make sound more semantically meaningful (`corescope-overlay/denvermc-sound.js`, lines 952-1011).
- **Prevention:** Define and enforce an allowlist of sonification inputs: packet type, hashed/opaque id, channel hash/name only if already map-visible metadata, hop count, observation count, priority/emergency classification, and timestamp/rate. Never inspect, hash, log, persist, or map message text/content. Add tests that payload text changes do not change normalized sound events except via allowed metadata.
- **Severity:** CRITICAL
- **Phase relevance:** Normalizer redesign and tests.
- **Confidence:** HIGH
- **Source:** Local code + project constraint — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; Forge project constraints in prompt
- **Checked:** 2026-05-15

### ITEM-pitfalls-8: Broad MutationObservers become performance traps in SPA map overlays

- **What goes wrong:** UI becomes janky during live map updates because observers fire repeatedly for DOM churn, then each callback re-runs DOM suppression/patching logic.
- **Root cause:** The current sound suppression observer watches `document.body` with `{ childList: true, subtree: true }` and calls `suppressCoreScopeAudio()` on every mutation (`corescope-overlay/denvermc-sound.js`, lines 1231-1236). The shell also uses MutationObserver for minimal panel seeding, scoped better when `#app` exists, but still needs care (`corescope-overlay/denvermc-shell.js`, lines 675-693).
- **Prevention:** Observe the smallest stable container, filter mutation records before doing work, and coalesce DOM patching with `requestAnimationFrame` or a short debounce. Disconnect observers when not in `/map` or once upstream elements are patched. Avoid DOM-wide selector scans inside observer callbacks.
- **Severity:** MODERATE
- **Phase relevance:** Overlay patching and mobile performance pass.
- **Confidence:** MEDIUM
- **Source:** WebSearch + local code — https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-9: Mobile portrait top bar overflows before it looks broken in desktop tests

- **What goes wrong:** On 390px/360px portrait screens, brand, sound select, volume slider, focus, analyzer, and site controls compete for one fixed 56px row. Controls shrink, overlap, or become too small to tap; the “polished overlay” fails even though desktop and basic mobile fallback tests pass.
- **Root cause:** The topbar is an inline-flex fixed bar with multiple actions. CSS hides some labels below 768/640px and hides the volume below 420px, but the select remains up to 116px and topbar controls are 40px high below 640px, not a consistent 44px mobile target (`corescope-overlay/denvermc-shell.css`, lines 752-790). Existing Playwright coverage only checks the non-CoreScope fallback `/map` page on mobile, not the injected CoreScope overlay in portrait (`tests/e2e/smoke.spec.ts`, lines 574-583).
- **Prevention:** Use a deliberate compact mobile layout: primary row for brand + one sound/start control + analyzer/menu, with secondary controls in a sheet or collapsible panel. Maintain 44×44px practical tap targets for overlay controls, test at 320/360/390/430 widths, and include the actual injected CoreScope overlay in screenshot/Playwright coverage.
- **Severity:** CRITICAL
- **Phase relevance:** Opus UI mobile/portrait visual implementation and acceptance tests.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css`
- **Checked:** 2026-05-15

### ITEM-pitfalls-10: `100vh`/innerHeight assumptions break map overlays under mobile browser chrome

- **What goes wrong:** Portrait map controls end up under the address bar, notch, or home indicator; orientation changes leave Leaflet sized for the old viewport; fullscreen/focus mode looks clipped until the user pans/zooms or reloads.
- **Root cause:** Mobile browsers have layout and visual viewport differences. The overlay comments note CoreScope hard-sets `.live-page` and `#app` to `window.innerHeight`, while CSS compensates by floating the topbar and pushing selected controls down (`corescope-overlay/denvermc-shell.css`, lines 486-503). Without dynamic viewport units and resize invalidation, the map and overlay can disagree after browser UI changes.
- **Prevention:** Prefer `100dvh`/dynamic viewport-aware containers with `100vh` fallback where the overlay controls layout; continue using `env(safe-area-inset-*)`; listen to `visualViewport.resize`, `orientationchange`, and mode changes; call Leaflet `map.invalidateSize()` after topbar/focus/analyzer transitions when a map instance is reachable.
- **Severity:** CRITICAL
- **Phase relevance:** Mobile CSS/focus/fullscreen pass.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env; https://leafletjs.com/reference.html#map-invalidatesize; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css`
- **Checked:** 2026-05-15

### ITEM-pitfalls-11: Leaflet z-index and pointer-event collisions make maps feel unresponsive

- **What goes wrong:** Custom headers, focus exits, sound controls, upstream live controls, Leaflet zoom controls, popups, and node-detail panels fight for stacking order. On mobile, an invisible or oversized overlay can also intercept drag/pinch gestures, making the map feel broken.
- **Root cause:** Leaflet uses its own pane/control z-index model, while the overlay uses fixed elements at z-index 1400-1600 (`corescope-overlay/denvermc-shell.css`, topbar/fab/focus exit). Random z-index increases fix one collision but create another, especially around fullscreen/focus mode and node detail.
- **Prevention:** Define a stacking contract: map panes below Leaflet controls, upstream CoreScope panels, Colorado Mesh topbar/actions, modal/sheet layer, focus-exit. Use `pointer-events: none` on non-interactive overlay containers and `pointer-events: auto` only on actual controls. Test drag/pinch/zoom after every overlay state change.
- **Severity:** MODERATE
- **Phase relevance:** Mobile/portrait overlay CSS and manual map interaction QA.
- **Confidence:** HIGH
- **Source:** WebSearch + local code — https://leafletjs.com/examples/map-panes/; https://leafletjs.com/reference.html#map-pane; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css`
- **Checked:** 2026-05-15

### ITEM-pitfalls-12: Sound UX fatigue from loud, literal, or overly varied mappings

- **What goes wrong:** The map sound is initially impressive but becomes annoying during real traffic, causing users to turn it off. Emergency/priority cues lose meaning because everything is bright, percussive, or constantly changing.
- **Root cause:** Event sonification is not just playback; it is an attention design problem. The current modes include bright blaster-style sweeps/noise and multi-note generative cues. Without a calm baseline, limited palette, and hierarchy, high-traffic density becomes clutter rather than useful ambience.
- **Prevention:** Make the default mode calm and musical: stable key, limited pitch set, soft attack, density through texture/rhythm rather than volume, and rare priority accents with reserved timbre/register. Keep “Space Blaster” as an explicit novelty mode, not the default. Add a 5-10 minute real-traffic listening test, not just a one-click test event.
- **Severity:** MODERATE
- **Phase relevance:** Sound design review and acceptance testing.
- **Confidence:** MEDIUM
- **Source:** WebSearch + local code — https://learn.microsoft.com/en-us/windows/win32/uxguide/vis-sound; https://sonification.de/handbook/; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15

### ITEM-pitfalls-13: Accessibility/status announcements can become noisy or misleading

- **What goes wrong:** Screen-reader users hear repeated status changes, or visual users see “On” while the browser has suspended audio. The controls technically exist but do not communicate the opt-in/autoplay state clearly.
- **Root cause:** The shell uses an `aria-live="polite"` status span for sound state (`corescope-overlay/denvermc-shell.js`, lines 203-206), while the sound API dispatches a `coloradoMeshSoundChange` event on many route/drop/counter updates (`corescope-overlay/denvermc-sound.js`, lines 181-190, 1100-1107). If UI text is later expanded to include counters or drop reasons, live regions could spam announcements.
- **Prevention:** Only update `aria-live` text when user-relevant state changes (`off`, `needs tap`, `on`, `unavailable`), not on every packet/counter change. Pair visual status with the actual `AudioContext.state`, and keep diagnostic counters out of live regions unless explicitly opened.
- **Severity:** MODERATE
- **Phase relevance:** Sound controls UX/a11y pass.
- **Confidence:** MEDIUM
- **Source:** Local code + WebSearch — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live
- **Checked:** 2026-05-15

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-pitfalls-1 | HIGH | Local code + WebSearch | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://sonification.de/handbook/downloads/ |
| ITEM-pitfalls-2 | HIGH | Local code + WebSearch | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://web.dev/articles/audio-scheduling |
| ITEM-pitfalls-3 | HIGH | WebSearch + local code | https://developer.chrome.com/blog/autoplay/; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-4 | HIGH | WebSearch + local code | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-5 | HIGH | WebSearch + local code | https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; https://webaudio.github.io/web-audio-api/; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json` |
| ITEM-pitfalls-6 | HIGH | WebSearch + local code | https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode; https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch03.html; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-7 | HIGH | Local code + project constraint | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; Forge project constraints in prompt |
| ITEM-pitfalls-8 | MEDIUM | WebSearch + local code | https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js` |
| ITEM-pitfalls-9 | HIGH | WebSearch + local code | https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` |
| ITEM-pitfalls-10 | HIGH | WebSearch + local code | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env; https://leafletjs.com/reference.html#map-invalidatesize; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` |
| ITEM-pitfalls-11 | HIGH | WebSearch + local code | https://leafletjs.com/examples/map-panes/; https://leafletjs.com/reference.html#map-pane; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css` |
| ITEM-pitfalls-12 | MEDIUM | WebSearch + local code | https://learn.microsoft.com/en-us/windows/win32/uxguide/vis-sound; https://sonification.de/handbook/; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js` |
| ITEM-pitfalls-13 | MEDIUM | Local code + WebSearch | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`; https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live |
