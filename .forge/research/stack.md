# Stack Research: Live Map Audio Quality

Project focus: brownfield improvement of Colorado Mesh CoreScope overlay audio. The implementation should enrich browser-local map event accents, improve Orchestral Ensemble variety, redesign Space Blaster, preserve current behavior where appropriate, and avoid unbounded audio node/sample creation under busy traffic.

### ITEM-stack-1: Keep the implementation in native browser Web Audio, not a framework rewrite

- **Recommendation:** Continue building the map sound engine as vanilla browser JavaScript using `AudioContext`, `AudioBuffer`, `AudioBufferSourceNode`, `GainNode`, filters, compressor/limiter, and scheduler logic in `corescope-overlay/denvermc-sound.js`.
- **Rationale:** The audio code is injected as a static overlay into CoreScope, outside the Next.js bundle. Native Web Audio is broadly available, already used by the current engine, supports precise scheduling and musical parameter automation, and avoids adding a bundling step or large runtime dependency for an overlay script. `AudioBufferSourceNode` is one-shot by design, but decoded `AudioBuffer`s can be cached and reused, which matches the current sample-cache pattern.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API ; https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rewrite the overlay around Tone.js or howler.js for this change. Tone.js 15.1.22 is capable but would require bundling/module delivery and is more stack churn than needed for event accents; howler 2.2.4 is good for game-style sample playback but adds less value for custom synthesis, scheduling, density bed DSP, and limiter routing already implemented natively.

### ITEM-stack-2: Use AudioWorklet for continuous density bed DSP with a safe fallback

- **Recommendation:** Keep `corescope-overlay/sound/denvermc-density-worklet.js` as the low-latency density-bed processor, loaded through `audioContext.audioWorklet.addModule()`, and preserve the existing fallback scheduler for browsers/contexts where worklets fail.
- **Rationale:** AudioWorklet is the standard browser path for custom audio processing off the main thread and is widely available in modern browsers, but custom worklets require secure contexts. The existing worklet/fallback split is the right stack shape for a Docker-served map that should work on modern HTTPS deployments while degrading gracefully in local or constrained contexts.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet ; https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/audioWorklet ; repo inspection: `corescope-overlay/sound/denvermc-density-worklet.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not move the continuous bed to `ScriptProcessorNode`; it is deprecated-era architecture and would put DSP on the main thread. Do not make the density bed sample-loop based until the current worklet proves insufficient.

### ITEM-stack-3: Preserve explicit user-triggered audio unlock and local-only event sonification

- **Recommendation:** Keep audio disabled by default, unlock/resume `AudioContext` only from a user gesture, persist only mode/volume in `localStorage`, and continue deriving tones from metadata/event class rather than message contents.
- **Rationale:** Browser autoplay policies commonly suspend or block audible Web Audio until user activation. The current engine already has mode/volume storage keys, `setMode(..., { userGesture })`, state diagnostics, and upstream CoreScope-audio suppression. This is the correct stack behavior for user consent, privacy, and predictable playback.
- **Confidence:** HIGH
- **Source:** Official docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices ; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay ; repo inspection: `corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not autoplay on page load, do not use microphone/media permissions, and do not sonify decoded message text or message contents.

### ITEM-stack-4: Expand the orchestral asset manifest with CC0 short one-shot samples

- **Recommendation:** Continue using a JSON sample manifest under `/sound/orchestral/manifest.json`, but expand it with more short CC0/public-domain one-shots and round-robin variants per role: messages, node, priority, and optionally a new texture/transition role.
- **Rationale:** Current Orchestral Ensemble has only four samples and just two message samples, one node sample, and two priority mappings. That explains the “only two samples” feel. A manifest-driven sample set lets the static overlay add variety without changing the Next/CoreScope stack and keeps attribution/license data close to each asset. VSCO 2 Community Edition and FreePats are suitable CC0-compatible sources already used in the repo.
- **Confidence:** HIGH
- **Source:** Repo inspection + source docs — `corescope-overlay/sound/orchestral/manifest.json`; `corescope-overlay/sound/orchestral/ATTRIBUTION.md`; https://github.com/sgossner/VSCO-2-CE ; https://versilian-studios.com/vsco-community/ ; https://freepats.zenvoid.org/
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not synthesize all orchestral color procedurally; it will keep sounding thin. Do not add non-CC0 sample packs unless license terms explicitly allow web redistribution in this repository and Docker image.

### ITEM-stack-5: Keep short WAV samples now; add compressed variants only if the library grows

- **Recommendation:** Keep the current simple WAV asset path for a small curated library, but design the manifest to support future codec variants (`wav`, `mp3`, possibly `opus`) if sample count or transfer size grows materially.
- **Rationale:** WAV is broadly supported and simple for `decodeAudioData()`, and for short accent one-shots the operational simplicity is valuable. If Orchestral Ensemble grows beyond a small set, compressed variants reduce network cost. MP3 is still the safest broad fallback, while Opus support is broad in 2026 but has more Safari/container nuance.
- **Confidence:** MEDIUM
- **Source:** Official compatibility docs — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData ; https://caniuse.com/mp3 ; https://caniuse.com/wav ; https://caniuse.com/opus
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not introduce an audio sprite for orchestral pitched samples yet; sprite slicing complicates pitch/range metadata and `decodeAudioData()` workflow. Do not switch everything to Opus-only because MP3/WAV remain safer compatibility choices.

### ITEM-stack-6: Keep the audio stack outside React/Next components

- **Recommendation:** Treat CoreScope map audio as an overlay subsystem, not a React feature: static JS/CSS/assets in `corescope-overlay`, copied into CoreScope public assets by `scripts/apply-corescope-overlay.mjs`.
- **Rationale:** The live map is served by vendored CoreScope and patched by overlay injection. Keeping sound in the overlay avoids coupling map audio to the Colorado Mesh marketing site’s React tree, preserves upstream CoreScope update boundaries, and allows Docker smoke tests to verify `/map` overlay assets directly.
- **Confidence:** HIGH
- **Source:** Repo inspection — `scripts/apply-corescope-overlay.mjs`; `Dockerfile`; `scripts/docker-smoke.mjs`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rebuild the map sound UI as a Next.js component unless the live map itself moves into Next. Do not edit `vendor/CoreScope` directly; the overlay script exists to survive upstream updates.

### ITEM-stack-7: Stay on the repository’s current Node/Next/React stack for site and deployment

- **Recommendation:** Keep Node.js 24 LTS, Next.js 16.2.5, React 19.2.3, TypeScript 5.9.x, npm lockfile, and the existing Docker multi-stage deployment for this sound-focused change.
- **Rationale:** The project already declares `node >=24 <26` and builds with `node:24-alpine`. Node 24 is Active LTS in 2026, and Next 16 officially supports modern Node runtimes and React 19.2-era features. The sound work is overlay/client-side; changing the site framework would be unrelated risk.
- **Confidence:** HIGH
- **Source:** Repo inspection + official docs — `package.json`; `package-lock.json`; `Dockerfile`; https://github.com/nodejs/release ; https://nextjs.org/docs/app/guides/upgrading/version-16
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not upgrade/downgrade Node, Next, or React as part of the audio quality work. Do not introduce pnpm/yarn unless the repository has a broader package-management migration.

### ITEM-stack-8: Use static asset serving through CoreScope public and Docker smoke coverage

- **Recommendation:** Keep sound assets under `corescope-overlay/sound/**`, copy them into CoreScope public at build/start time, and verify them through Docker smoke tests for manifest validity, attribution availability, and non-empty sample URLs.
- **Rationale:** The existing smoke test already checks `/sound/denvermc-density-worklet.js`, `/sound/orchestral/manifest.json`, required sample fields, sample fetchability, and attribution docs. This is the right deployment stack for browser-local sound assets inside the Docker image.
- **Confidence:** HIGH
- **Source:** Repo inspection — `scripts/docker-smoke.mjs`; `scripts/apply-corescope-overlay.mjs`; `Dockerfile`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not fetch samples from third-party CDNs at runtime; it adds privacy, availability, CORS, cache, and license-control problems. Do not store map audio in a database; it is static application content.

### ITEM-stack-9: Test Web Audio behavior in real browsers, not only Node/jsdom

- **Recommendation:** Keep Vitest for pure logic and schema tests, but add/extend Playwright browser tests for the sound overlay: unlock flow, mode switching, diagnostic counters, queue/voice caps, sample manifest loading, and at least Chromium plus WebKit where feasible.
- **Rationale:** The current Vitest config runs in Node, where real `AudioContext`, `AudioWorklet`, browser autoplay behavior, and media decoding are not faithfully available. Playwright runs real browser engines and can inspect `window.__coloradoMeshSound`. Vitest Browser Mode is also viable if the audio code is later modularized, but Playwright is the lower-friction fit for today’s static IIFE overlay.
- **Confidence:** HIGH
- **Source:** Official docs — https://playwright.dev/ ; https://playwright.dev/docs/mock-browser-apis ; https://vitest.dev/guide/browser/why ; repo inspection: `vitest.config.ts`; `playwright.config.ts`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not rely on jsdom for audio correctness. Do not judge sound quality from unit tests alone; use tests for invariants and manual/browser review for musicality.

### ITEM-stack-10: Keep resource controls in the engine as first-class stack constraints

- **Recommendation:** Preserve and tighten the current caps: cached decoded buffers, one-shot source creation per playback, `maxActiveVoices`, token buckets, dedupe windows, scheduled-source cleanup, and bounded music queue.
- **Rationale:** Busy map traffic can create many accent events. Native Web Audio expects new one-shot source nodes per playback, so the stack must bound simultaneous voices and reliably disconnect/stop nodes. The current engine already has `maxActiveVoices = 14`, `MUSIC_QUEUE_MAX = 96`, cooldowns, dedupe, token buckets, cleanup timers, and diagnostics; future richer sounds should fit inside those controls rather than bypass them.
- **Confidence:** HIGH
- **Source:** Official docs + repo inspection — https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode ; `corescope-overlay/denvermc-sound.js`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not create persistent oscillator/sample nodes per map node or per peer. Do not increase richness by unbounded layering; use smarter sample selection, velocity/gain variation, pitch ranges, and event coalescing.

### ITEM-stack-11: Use small data-driven presets, not a heavyweight audio build pipeline

- **Recommendation:** Represent musical behavior as plain JS/JSON preset data: roles, scales, pitch ranges, round-robin pools, event mappings, cooldowns, and layer recipes. Keep synthesis code in the overlay and asset metadata in manifests.
- **Rationale:** The desired change is richer event accents, not a DAW or plugin system. Data-driven presets make Orchestral Ensemble and Space Blaster easier to tune without adding TypeScript bundling, Web MIDI, SoundFont engines, or a sample-instrument framework.
- **Confidence:** MEDIUM
- **Source:** Repo inspection + ecosystem docs — `corescope-overlay/denvermc-sound.js`; https://tonejs.github.io/docs/15.1.22/index.html ; https://www.npmjs.com/package/soundfont-player
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not add Web MIDI; this project is map sonification, not hardware MIDI. Do not add SoundFont playback unless orchestral realism becomes the primary goal and asset size is explicitly accepted.

### ITEM-stack-12: Keep security headers compatible with local static audio

- **Recommendation:** Ensure all sound work continues to load from same-origin `/sound/**` URLs and does not require broader CSP permissions. If new external sources are used only during development, vendor the final assets and attribution into the repo before deployment.
- **Rationale:** The current Next headers favor `default-src 'self'`, constrained `connect-src`, and static local assets. Same-origin sample/worklet loading avoids CSP and CORS surprises. AudioWorklet also requires secure context in real deployments, which aligns with HTTPS hosting.
- **Confidence:** HIGH
- **Source:** Official docs + repo inspection — https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/audioWorklet ; `next.config.js`; `Dockerfile`
- **Checked:** 2026-05-15
- **Alternatives rejected:** Do not widen CSP for third-party audio CDNs. Do not load remote audio worklet modules or samples in production.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-stack-1 | HIGH | Official docs / repo inspection | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API ; `corescope-overlay/denvermc-sound.js` |
| ITEM-stack-2 | HIGH | Official docs / repo inspection | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet ; `corescope-overlay/sound/denvermc-density-worklet.js` |
| ITEM-stack-3 | HIGH | Official docs / repo inspection | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay ; `corescope-overlay/denvermc-sound.js` |
| ITEM-stack-4 | HIGH | Repo inspection / sample source docs | `corescope-overlay/sound/orchestral/manifest.json`; https://github.com/sgossner/VSCO-2-CE |
| ITEM-stack-5 | MEDIUM | Official docs / compatibility data | https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData ; https://caniuse.com/mp3 |
| ITEM-stack-6 | HIGH | Repo inspection | `scripts/apply-corescope-overlay.mjs`; `Dockerfile` |
| ITEM-stack-7 | HIGH | Repo inspection / official docs | `package.json`; https://github.com/nodejs/release ; https://nextjs.org/docs/app/guides/upgrading/version-16 |
| ITEM-stack-8 | HIGH | Repo inspection | `scripts/docker-smoke.mjs`; `scripts/apply-corescope-overlay.mjs` |
| ITEM-stack-9 | HIGH | Official docs / repo inspection | https://playwright.dev/ ; https://vitest.dev/guide/browser/why ; `playwright.config.ts` |
| ITEM-stack-10 | HIGH | Official docs / repo inspection | https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode ; `corescope-overlay/denvermc-sound.js` |
| ITEM-stack-11 | MEDIUM | Repo inspection / ecosystem docs | `corescope-overlay/denvermc-sound.js`; https://tonejs.github.io/docs/15.1.22/index.html |
| ITEM-stack-12 | HIGH | Official docs / repo inspection | https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/audioWorklet ; `next.config.js` |
