# Stack Research: Colorado Mesh CoreScope Sound + Mobile Overlay

Checked: 2026-05-15

### ITEM-stack-1: Keep the implementation in the CoreScope overlay layer

- **Recommendation:** Implement the sound-engine rework and mobile/portrait polish in `corescope-overlay/denvermc-sound.js`, `corescope-overlay/denvermc-shell.js`, and `corescope-overlay/denvermc-shell.css`, delivered by the existing `scripts/apply-corescope-overlay.mjs` injection path. Do not move this work into the Next.js app and do not edit `vendor/CoreScope` directly.
- **Rationale:** The current repository already has an idempotent overlay copier/injector and a single-container Docker build that copies overlay assets into CoreScope public assets. This matches the project constraint to preserve upstream CoreScope and keeps changes resilient to submodule updates. A Next/React rewrite would not naturally control CoreScope's hash-router DOM and would add a second UI ownership layer for the same map chrome.
- **Confidence:** HIGH
- **Source:** Local code — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`, `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Editing `vendor/CoreScope` directly violates the project constraint and makes upstream updates fragile. Rebuilding the map page as a Next.js/React feature is too large for a brownfield polish/sound fix and risks duplicating CoreScope behavior.

### ITEM-stack-2: Use native Web Audio API as the sound runtime, not a music framework

- **Recommendation:** Continue with browser-native Web Audio primitives: one `AudioContext`, `GainNode` master bus, `DynamicsCompressorNode` safety limiter, short-lived `OscillatorNode`/`AudioBufferSourceNode` voices, decoded local sample buffers, and `AudioParam` automation for envelopes and fades.
- **Rationale:** The current overlay is a standalone static script injected into CoreScope, so native Web Audio avoids bundling, dependency management, and CSP/build complications. MDN's Web Audio guidance supports creating/resuming audio from user gesture, scheduling with `audioCtx.currentTime`, and using `AudioParam` methods for timing-sensitive changes. The existing code already follows much of this stack with `AudioContext`, a master gain, compressor, sample buffers, and explicit cleanup sets.
- **Confidence:** HIGH
- **Source:** Official docs + local code — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not introduce Tone.js, Web MIDI, or a DAW-like sequencing framework for this fix. Those add bundle/runtime complexity and abstractions around a problem that is mostly event aggregation, scheduling, gain staging, and mobile-safe opt-in controls.

### ITEM-stack-3: Replace packet-per-note behavior with a bounded density scheduler

- **Recommendation:** Build a small browser-local density scheduler in `denvermc-sound.js`: aggregate accepted metadata events into short time buckets, compute traffic intensity/lane mix, and schedule richer layers from that aggregate. High traffic should increase fullness through sustained pads, subtle pulse/noise layers, chord thickness, and controlled sample accents rather than attempting to play every packet.
- **Rationale:** The current implementation token-buckets individual packet cues and drops/throttles under load, which protects the browser but can make busy traffic sound thinner. Web Audio scheduling should use the audio clock and a lookahead window: JavaScript timers wake the scheduler, but actual node starts and parameter changes are scheduled on `AudioContext.currentTime`. This lets high-density traffic feel dense without unbounded AudioNodes.
- **Confidence:** HIGH
- **Source:** Official guidance — https://web.dev/articles/audio-scheduling
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not remove throttling and play one sound per packet. That will cause runaway node creation, bad mixes, and mobile performance failures. Do not use `setTimeout` as the exact note clock; use it only to drive a lookahead scheduler.

### ITEM-stack-4: Keep autoplay compliance as a first-class stack constraint

- **Recommendation:** Require explicit user gesture for any audible mode, keep sound default-off, create/resume the single `AudioContext` only from trusted UI gestures (`change`, `click`, `pointerdown`, keyboard activation), and expose clear state labels such as off/locked/on/unavailable in Colorado Mesh controls.
- **Rationale:** Modern browsers block or suspend Web Audio until user interaction. MDN and Chrome guidance both state that Web Audio should be created or resumed inside a user gesture. The existing `denvermc-shell.js` and `denvermc-sound.js` already have this contract; the stack should preserve it while improving density behavior.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not auto-enable sound from map traffic, saved preferences, page load, or CoreScope audio state. Do not rely on Chrome Media Engagement exceptions; they are browser-specific and not an acceptable privacy/UX baseline.

### ITEM-stack-5: Use reusable decoded local samples and one-shot source nodes

- **Recommendation:** Keep orchestral assets browser-local under `corescope-overlay/sound/`, cache decoded `AudioBuffer`s, and create a fresh `AudioBufferSourceNode` for each sample playback. Add only a small number of short CC0/compatible local samples if needed; prefer procedural layers for density.
- **Rationale:** MDN documents `AudioBufferSourceNode` as a one-shot source: the decoded buffer can be reused, but the source node cannot be restarted after `start()`. The existing manifest already points to local sample files and CC0/compatible attributions. This is a good stack fit for privacy, offline caching, and CSP simplicity, provided playback remains bounded.
- **Confidence:** HIGH
- **Source:** Official docs + local manifest — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not stream remote sound libraries or load samples from CDNs. Do not reuse `AudioBufferSourceNode` instances. Do not add large unbounded sample banks that increase startup/memory cost for a map overlay.

### ITEM-stack-6: Treat AudioWorklet as an optional phase-two tool, not the default fix

- **Recommendation:** Start with scheduled Web Audio nodes and aggregate control-rate density state. Use `AudioWorklet` only if testing shows main-thread scheduling still causes audible dropouts for continuous density layers; if used, keep it as a small static module loaded from the overlay and feed it compact/batched control data.
- **Rationale:** `AudioWorkletNode` is broadly available and is the modern off-main-thread option for custom DSP, but it adds module loading, secure-context/CSP considerations, processor lifecycle quirks, and real-time coding constraints. The immediate problem can likely be solved by aggregation plus lookahead scheduling without custom DSP. AudioWorklet is best reserved for one continuous synth/noise bed whose amplitude/timbre tracks traffic density.
- **Confidence:** MEDIUM
- **Source:** Official docs — https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Using_AudioWorklet
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not use deprecated `ScriptProcessorNode`. Do not move all cue generation into an AudioWorklet before proving the simpler scheduler is insufficient. Do not pass full packet objects into any audio processor.

### ITEM-stack-7: Use plain modern CSS for the CoreScope overlay, not Tailwind inside injected assets

- **Recommendation:** Keep `denvermc-shell.css` as handcrafted CSS using custom properties, media queries, safe-area env variables, reduced-motion queries, and viewport units. Use Tailwind v4 only for the Next.js site where it already belongs, not for CoreScope overlay CSS.
- **Rationale:** The overlay CSS is copied directly into CoreScope public assets and is not processed through the Next/Tailwind pipeline. Plain CSS is the most reliable stack for fixing injected CoreScope chrome, Leaflet controls, fullscreen/focus mode, and portrait mobile layout. Tailwind v4 is current and useful for app code, but introducing a build step for the overlay would complicate the Docker path and upstream patch model.
- **Confidence:** HIGH
- **Source:** Official docs + local code — https://tailwindcss.com/blog/tailwindcss-v4-3; `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.css`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not pipe CoreScope overlay CSS through the Next app build unless the overlay architecture is deliberately redesigned. Do not use inline style mutations for responsive layout that CSS can own.

### ITEM-stack-8: Make mobile polish safe-area and dynamic-viewport aware

- **Recommendation:** For portrait/mobile overlay fixes, use `env(safe-area-inset-*)` with fallbacks, topbar heights that include safe-area padding, `100dvh`/`100svh` selectively for map/fullscreen sizing, and explicit breakpoints for narrow widths around 768px, 640px, and 420px as the existing CSS already does.
- **Rationale:** MDN documents safe-area environment variables as the way to avoid notches, rounded displays, and device UI intrusions. MDN also documents `svh`, `lvh`, and `dvh` as the modern units for mobile browser UI that expands/collapses. The current overlay already uses safe-area variables; the stack should extend that pattern rather than relying on brittle `window.innerHeight` assumptions or `100vh` alone.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/CSS/env
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rely solely on `100vh` for mobile map chrome because it behaves like the large viewport and can hide content under browser UI. Do not position controls without safe-area offsets in fullscreen/focus modes.

### ITEM-stack-9: Keep the deployment stack as the existing single Docker container

- **Recommendation:** Preserve the current Docker architecture: Node 24 Alpine runner, Next.js standalone output, built CoreScope Go binaries, nginx/supervisor, and overlay assets applied during image build/startup. No database/storage stack changes are needed for browser-local sound or CSS polish.
- **Rationale:** The repo already uses `output: 'standalone'` and copies `.next/standalone`, `.next/static`, CoreScope public assets, and overlay files into one image. Next.js official docs confirm standalone output is intended to reduce Docker production deployments by copying only traced runtime files plus a minimal server. Node 24 is an active LTS line in 2026, matching the repository engine and Docker base image.
- **Confidence:** HIGH
- **Source:** Official docs + local code — https://nextjs.org/docs/app/api-reference/config/next-config-js/output; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not split the map/audio fix into a second service, worker container, database, or CDN-only deployment. The feature is browser-local and metadata-only, so backend changes would add operational risk without solving the core issues.

### ITEM-stack-10: Add Playwright mobile visual coverage and browser-level audio API tests

- **Recommendation:** Extend `playwright.config.ts` with at least one mobile portrait project (for example iPhone/Pixel preset with touch enabled), add screenshots for `/map#/live` minimal, controls-expanded, sound-control states, and focus mode, and use browser tests for Web Audio unlock/scheduler behavior. Keep Vitest for pure metadata normalization/math only.
- **Rationale:** Current Playwright coverage is desktop Chromium only. Playwright official docs recommend device emulation for mobile signals such as viewport, user agent, screen size, and touch, and screenshot comparisons can catch overlay regressions. Web Audio behavior, autoplay gestures, safe-area layout, and Leaflet/CoreScope DOM integration are browser concerns that jsdom/Vitest cannot faithfully validate.
- **Confidence:** HIGH
- **Source:** Official docs + local config — https://playwright.dev/docs/emulation; `/Users/cjvana/Documents/GitHub/denvermc-org/playwright.config.ts`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rely on desktop-only Playwright or jsdom tests for mobile overlay polish. Do not make visual changes without screenshot review, especially because implementation may be delegated to an Opus UI pass.

### ITEM-stack-11: Keep CSP and network scope local/self for sound assets

- **Recommendation:** Fetch sound manifests and sample files from same-origin overlay paths only, and avoid adding remote audio, telemetry, or content-derived requests. If future audio loading changes from `fetch()` to `<audio>`, update CSP deliberately (`connect-src` governs fetch; `media-src` governs media elements).
- **Rationale:** The existing Next CSP has `default-src 'self'` and `connect-src 'self' ...`, which permits same-origin `fetch()` of local sound assets while keeping browser-local behavior. MDN documents that `connect-src` controls `fetch()` and WebSocket-like script requests; `media-src` matters for `<audio>/<video>` elements. Staying same-origin avoids CSP expansion and protects the metadata-only/privacy constraint.
- **Confidence:** HIGH
- **Source:** Official docs + local config — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not add third-party sample CDNs, remote analytics for sound usage, or message-content-based audio mappings. Do not loosen CSP broadly for a local overlay feature.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-stack-1 | HIGH | Local code | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs` |
| ITEM-stack-2 | HIGH | Official docs + local code | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-stack-3 | HIGH | Official guidance | https://web.dev/articles/audio-scheduling |
| ITEM-stack-4 | HIGH | Official docs | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay |
| ITEM-stack-5 | HIGH | Official docs + local manifest | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode |
| ITEM-stack-6 | MEDIUM | Official docs | https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Using_AudioWorklet |
| ITEM-stack-7 | HIGH | Official docs + local code | https://tailwindcss.com/blog/tailwindcss-v4-3 |
| ITEM-stack-8 | HIGH | Official docs | https://developer.mozilla.org/en-US/docs/Web/CSS/env |
| ITEM-stack-9 | HIGH | Official docs + local code | https://nextjs.org/docs/app/api-reference/config/next-config-js/output |
| ITEM-stack-10 | HIGH | Official docs + local config | https://playwright.dev/docs/emulation |
| ITEM-stack-11 | HIGH | Official docs + local config | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src |
