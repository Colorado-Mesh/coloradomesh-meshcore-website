# Stack Research — Map Sound Modes

Project: add opt-in sound modes to the embedded CoreScope live map via the existing CoreScope packet/audio/visualization event stream, without editing `vendor/CoreScope` directly and without adding copyrighted samples.

### ITEM-stack-1: Implement the feature as CoreScope overlay assets, not a Next/React feature

- **Recommendation:** Add one or two vanilla browser overlay files under `corescope-overlay/` (for example `denvermc-map-sound.js` and optional `denvermc-map-sound.css`) and inject/copy them through `scripts/apply-corescope-overlay.mjs`. Keep the feature in the CoreScope static page runtime rather than building a new React component in the Next app.
- **Rationale:** The live map UI, packet WebSocket, existing audio engine, and `renderPacketTree()` audio hook all live in `vendor/CoreScope/public/*.js`, while the local customization pattern already copies overlay assets into CoreScope public and injects them into `index.html`. Staying in the overlay layer respects the “do not edit vendor/CoreScope” constraint and avoids coupling sound controls to the separate Next application shell.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`, `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/index.html`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not edit `vendor/CoreScope/public/live.js`, `audio.js`, or `index.html` directly; upstream CoreScope updates would overwrite or conflict with the change. Do not implement the selector in Next/React because the relevant DOM and packet events are inside the CoreScope static app.

### ITEM-stack-2: Use native Web Audio APIs as the core audio stack

- **Recommendation:** Build all five modes on the browser Web Audio API: `AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `StereoPannerNode`, `DynamicsCompressorNode`, and, for optional orchestral samples, `AudioBufferSourceNode` plus `decodeAudioData()`.
- **Rationale:** Web Audio is broadly supported in modern browsers and already matches the existing CoreScope audio code. MDN documents Web Audio as an audio graph of source and processing nodes; Can I Use reports about 95.95% global support for the API. The current CoreScope engine already uses oscillators, gains, filters, panners, and compression, so the lowest-risk path is to extend that model rather than add a framework.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API; Compatibility — https://caniuse.com/audio-api; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not add Tone.js for this feature; it is a full music framework and the npm package is ~5.4 MB unpacked. Do not add howler.js; it is useful for playback but not for procedural synthesis. Do not add superdough; it is AGPL-3.0-or-later and inappropriate for this site’s current dependency/license profile.

### ITEM-stack-3: Extend CoreScope’s existing `MeshAudio` voice registry instead of replacing it

- **Recommendation:** Register new voices/modes through `window.MeshAudio.registerVoice()` where possible, and add a thin DenverMC controller that maps selector values to `MeshAudio` enabled state and voice names: `off`, `native-plus`, `generative-key`, `orchestral-ensemble`, `space-blaster`.
- **Rationale:** `audio.js` already exposes `MeshAudio.sonifyPacket()`, `setEnabled()`, `setVoice()`, `registerVoice()`, volume/BPM controls, localStorage restore, voice caps, and helper utilities. `live.js` already calls `MeshAudio.sonifyPacket(consolidated)` inside `renderPacketTree()`, so no new event bus or packet stream is needed. The DenverMC layer only needs to make “Sound Off” authoritative and provide richer voice implementations.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not build a parallel WebSocket listener just for sound; it would duplicate packet filtering, replay behavior, and deduplication. Do not bypass `MeshAudio.sonifyPacket()` unless a specific event category cannot be represented by the existing packet object.

### ITEM-stack-4: Make Sound Off the authoritative default with a new DenverMC localStorage key

- **Recommendation:** Store the selected mode in a DenverMC-specific key such as `denvermc.map.soundMode`, default to `off`, and on first load explicitly disable `MeshAudio` unless this key contains an enabled mode. Keep volume and optional advanced controls in localStorage as small local-only preferences.
- **Rationale:** CoreScope currently persists `live-audio-enabled=true` and may recreate an `AudioContext` on restore. The project requires sound to be opt-in because browser autoplay policies require user activation and because sound should not surprise users. A new project-owned key avoids accidentally honoring old CoreScope audio state as an enabled map mode.
- **Confidence:** HIGH
- **Source:** MDN — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage; MDN — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay; Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not store the mode server-side or in cookies. Do not rely only on CoreScope’s existing `live-audio-enabled` key, because it cannot represent the requested five-mode selector and could preserve legacy “on” state against the new default-off requirement.

### ITEM-stack-5: Gate audio unlock behind explicit user gestures

- **Recommendation:** Create or resume `AudioContext` only in response to the user selecting an enabled sound mode or pressing an Enable/Preview button. If the context is still `suspended`, show a small unlock affordance and do not schedule packet sounds until `resume()` resolves.
- **Rationale:** MDN and Chrome both state that Web Audio can be blocked or start suspended unless created/resumed from a user gesture. Chrome’s autoplay policy has applied to Web Audio since Chrome 71. This makes the selector interaction the right activation point and reinforces that “Sound Off” is the safe default.
- **Confidence:** HIGH
- **Source:** MDN — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; Chrome Developers — https://developer.chrome.com/blog/autoplay/
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not initialize or resume audio on page load. Do not count a passive packet arrival, WebSocket connect, or route change as consent to play sound.

### ITEM-stack-6: Use procedural synthesis for Native+, Generative Key, and Space Blaster

- **Recommendation:** Keep Native+, Generative Key, and Space Blaster fully procedural and license-safe: short envelopes, oscillators/noise buffers, filters, pitch variation, stereo panning, compression, and per-mode rate limiting. Use packet fields already available to CoreScope (`payloadTypeName`, text/message payloads, hops, observation count, raw bytes, hash, path) as synthesis inputs.
- **Rationale:** Procedural Web Audio avoids asset licensing risk, adds no network cost, and fits the existing `audio-v1-constellation.js` pattern. Native+ should polish packet/message one-shots; Generative Key should quantize packet activity into one musical key; Space Blaster should use oscillators/noise/filter sweeps rather than copyrighted samples.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js`; MDN — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not use Star Wars samples, Andrew Huang Collisions assets, or cloned trademarked blaster sounds. Do not fetch remote sound packs at runtime; same-origin procedural audio is safer and faster.

### ITEM-stack-7: Make Orchestral Ensemble a manifest-driven lazy sampler with empty-safe fallback

- **Recommendation:** Implement an orchestral sample loader around a same-origin JSON manifest, `fetch()`, `arrayBuffer()`, and `audioCtx.decodeAudioData()`. Lazy-load samples only after the user selects Orchestral Ensemble. Each manifest entry should include instrument, note/root, file path, license, author/source URL, and attribution text. If no bundled CC0/safe samples exist, the mode should fall back to lightweight Web Audio approximations and clearly keep the manifest empty.
- **Rationale:** MDN’s sample playback path is fetch → ArrayBuffer → `decodeAudioData()` → `AudioBufferSourceNode`. Lazy loading defers non-critical media until needed and avoids slowing initial map load. The University of Iowa sample library states samples may be used for any projects without restrictions, and Freesound has individual CC0 instrument one-shots, but provenance must be stored per file before bundling.
- **Confidence:** HIGH
- **Source:** MDN — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; MDN — https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading; University of Iowa — https://theremin.music.uiowa.edu/MIS.html; Freesound search results — https://freesound.org/
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not bundle samples without per-file license/provenance metadata. Do not import a large sampler library just for a handful of one-shots. Do not make Orchestral Ensemble block initial CoreScope map load.

### ITEM-stack-8: Preserve the single-container Docker/static deployment

- **Recommendation:** Keep deployment unchanged: the Next standalone app, CoreScope Go binaries, nginx, supervisor, and CoreScope public assets remain in one Docker image. If sample files are added, place them under `corescope-overlay/` and update `apply-corescope-overlay.mjs` to copy that static directory into `/app/corescope/public/` during the existing image build.
- **Rationale:** The Dockerfile already copies `corescope-overlay` into the image and applies the overlay to `/app/corescope/public`. The feature is entirely browser-side after static asset delivery, so no new service, database table, API, queue, or persistent volume is warranted.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`, `/Users/cjvana/Documents/GitHub/denvermc-org/compose.yaml`, `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not add a server-side audio renderer or extra container. Do not store selected mode in SQLite or CoreScope config. Do not put audio samples in `vendor/CoreScope/public` directly.

### ITEM-stack-9: Keep dependencies unchanged; use the existing test stack

- **Recommendation:** Add no runtime npm dependency for the sound modes. Use existing test tools: Vitest/jsdom for pure mapping/rate-limit/storage logic, and Playwright for browser-level selector behavior, localStorage persistence, and audio-unlock UX. Mock Web Audio nodes in unit tests and use Playwright for real browser smoke coverage.
- **Rationale:** `package.json` already includes Vitest, jsdom, Testing Library, Playwright, TypeScript, and Docker smoke scripts. The sound feature is static browser JavaScript and can be tested without adding bundlers or libraries. jsdom will not provide real Web Audio behavior, so unit tests should validate deterministic mapping/controller logic while Playwright covers DOM and browser policy flows.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; MDN — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not add Jest, Cypress, Vite app wiring, or a TypeScript build just for overlay scripts. Do not rely only on manual listening tests; persistence/default-off behavior needs automated coverage.

### ITEM-stack-10: Use a small controller/state boundary for mode selection and packet throttling

- **Recommendation:** Structure the overlay as a controller with four clear boundaries: UI adapter (selector/buttons), storage adapter (`localStorage` with try/catch), audio engine adapter (`MeshAudio` and Web Audio context), and mode implementations. Add per-mode throttles/debouncing above `MeshAudio.sonifyPacket()` so high packet bursts cannot overwhelm the mix.
- **Rationale:** The current engine caps voices at 12, but polished map sound needs more than a global cap: per-event rate limits, tasteful mixing, and “last important event wins” behavior. A small controller also makes the new default-off semantics independent from CoreScope’s existing audio toggle and keeps mode implementation testable.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js`; MDN — https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not scatter mode-specific conditionals across DOM event handlers. Do not depend only on `MAX_VOICES`; without rate shaping, bursty packet traffic can still sound chaotic even if technically capped.

### ITEM-stack-11: Prefer same-origin assets and avoid CSP/network changes

- **Recommendation:** Serve all new JS, CSS, optional manifest files, and optional samples from the same CoreScope public origin. Do not add external CDNs or remote sample domains for this feature.
- **Rationale:** Same-origin static assets avoid CSP expansion, privacy concerns, offline/cache surprises, and third-party availability issues. `next.config.js` already defines tight security headers for the Next side, and the CoreScope deployment already serves overlay files locally through nginx. The feature does not need external network access after page load except the existing map/data streams.
- **Confidence:** MEDIUM
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`, `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`; MDN — https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading
- **Checked:** 2026-05-14
- **Alternatives rejected:** Do not load Tone.js, howler.js, samples, or manifests from CDNs. Do not fetch samples from Freesound or other public sites at runtime; download/review/license-track any approved files and serve them locally.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-stack-1 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs` |
| ITEM-stack-2 | HIGH | Official docs / compatibility / codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API; https://caniuse.com/audio-api |
| ITEM-stack-3 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js` |
| ITEM-stack-4 | HIGH | MDN / codebase | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| ITEM-stack-5 | HIGH | MDN / Chrome Developers | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; https://developer.chrome.com/blog/autoplay/ |
| ITEM-stack-6 | HIGH | Codebase / MDN | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js`; https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator |
| ITEM-stack-7 | HIGH | MDN / sample-library docs | https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData; https://theremin.music.uiowa.edu/MIS.html |
| ITEM-stack-8 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile` |
| ITEM-stack-9 | HIGH | Codebase / MDN | `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-stack-10 | HIGH | Codebase / MDN | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js`; https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode |
| ITEM-stack-11 | MEDIUM | Codebase / MDN | `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`; https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading |
