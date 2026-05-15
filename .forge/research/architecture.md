# Architecture Research: CoreScope Live Map Sound Modes

Project: Add opt-in map sound modes to the embedded CoreScope live map without editing `vendor/CoreScope` directly.
Checked: 2026-05-14

### ITEM-architecture-1: Keep sound feature entirely in the CoreScope overlay layer

- **Recommendation:** Add new overlay-owned assets (`denvermc-sound.css`, `denvermc-sound.js`, and optional future `sounds/manifest.json` + `sounds/*.ogg`) under `corescope-overlay`, then copy/inject them with `scripts/apply-corescope-overlay.mjs`. Do not modify `vendor/CoreScope/public/live.js`, `audio.js`, or `index.html` in-place.
- **Rationale:** The repository already has a stable overlay pattern: `corescope-overlay/*` is copied into CoreScope's public directory and injected into the runtime `index.html` during Docker build. This preserves upstream CoreScope updateability while allowing Colorado Mesh-specific UI and runtime behavior. Sound mode code should follow the same pattern as `denvermc-shell.js` rather than becoming a fork of upstream CoreScope.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs:2-24`, `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile:86-96`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Editing `vendor/CoreScope/public/live.js` directly is rejected because it violates the project constraint and will make upstream CoreScope updates painful. Opening a separate app-side implementation outside `/map` is rejected because the feature must operate inside the embedded CoreScope live map.

### ITEM-architecture-2: Use a sound bridge over the existing rendered packet path, not a new WebSocket

- **Recommendation:** Build a `DenverMCSoundBridge` in overlay JavaScript that consumes the packet object already passed to `MeshAudio.sonifyPacket(consolidated)` from CoreScope's live renderer. The least invasive implementation is to wrap `window.MeshAudio.sonifyPacket` after CoreScope loads, emit normalized overlay events, and then call or suppress the original depending on mode. Do not create a second WebSocket or poll `/api/packets` for sound.
- **Rationale:** `live.js` already filters packets by favorites, node filter, and region before building a consolidated packet with `observation_count`, then calls `MeshAudio.sonifyPacket(consolidated)`. Hooking that point makes audio follow exactly what the live map is actually rendering, avoids duplicate ingest work, respects replay/live rendering paths, and inherits CoreScope's existing VCR/background buffering behavior. A second WebSocket would hear packets that the visible map filtered out and would create duplicate connection/reconnect behavior.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2307-2367`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/app.js:618-645`
- **Checked:** 2026-05-14
- **Alternatives rejected:** A separate WebSocket client is rejected because CoreScope already owns WS lifecycle and filtering. DOM-scraping `.live-feed-item` is rejected because it loses raw bytes, path, observation count, and payload metadata needed for sound design.

### ITEM-architecture-3: Normalize CoreScope packets into a small semantic sound-event contract

- **Recommendation:** Convert each CoreScope packet into an internal event object before it reaches any mode module: `{ kind, typeName, hash, timestamp, routeType, obsCount, hopCount, rawHex, bytes, payload, channel, isMessage, isNodeAdvert, isPriority }`. Then fan out one packet event plus derived child events such as `message`, `node`, `priority`, and optional synthetic `hop` events.
- **Rationale:** The requested modes map the same underlying packet stream differently. Native+ needs polished packet/message one-shots; Generative Key needs pitch material from bytes; Orchestral needs event-family instrumentation; Space Blaster needs procedural zaps. A semantic contract decouples mode code from CoreScope's raw packet shape (`decoded.header`, `decoded.payload`, `decoded.path`) and lets all modes share parsing, rate limiting, priority detection, and test fixtures.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:46-71`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2362-2367`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Letting every mode parse CoreScope packets independently is rejected because it will drift and duplicate fragile packet-shape logic. Passing raw packets straight into mode modules is rejected because modes need consistent concepts like message/node/priority rather than CoreScope implementation details.

### ITEM-architecture-4: Own one overlay AudioContext and one engine; expose modes as strategies

- **Recommendation:** Implement `DenverMCMapSound` as a singleton engine with one `AudioContext`, one master gain, one safety compressor/limiter, one per-mode bus, and mode strategy modules: `off`, `nativePlus`, `generativeKey`, `orchestral`, `spaceBlaster`. The bridge should call `engine.handle(soundEvent)`, and only the active strategy should schedule sound.
- **Rationale:** MDN's Web Audio guidance favors a centralized audio graph, explicit user controls, `AudioContext` resume from user gestures, `AudioBufferSourceNode` for short samples, `AudioParam` scheduling, and cleanup of sources/nodes. A single engine also prevents multiple contexts, inconsistent volume, clipping between modes, and hard-to-stop lingering oscillators when switching modes.
- **Confidence:** HIGH
- **Source:** WebFetch — https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices
- **Checked:** 2026-05-14
- **Alternatives rejected:** A separate `AudioContext` per mode is rejected because browsers limit resources and suspended-context handling becomes inconsistent. Playing sounds directly from UI handlers or bridge code is rejected because it spreads lifecycle, gain, and cleanup concerns across the overlay.

### ITEM-architecture-5: Make Sound Off the persisted default and require a user gesture for non-off modes

- **Recommendation:** Add a selector with these values: `off`, `native-plus`, `generative-key`, `orchestral`, `space-blaster`. Persist only the selected mode in localStorage under an overlay key such as `denvermc.mapSound.mode`, defaulting to `off`. On changing from off to any audible mode, create/resume the `AudioContext` inside that change event. If resume fails or the context remains suspended, keep the selector visible and show a short "Tap to enable sound" state.
- **Rationale:** Current browser autoplay rules affect Web Audio: audio started outside a user interaction is subject to blocking. This project also explicitly requires opt-in local persistence. Keeping mode state separate from CoreScope's existing `live-audio-enabled` avoids accidentally re-enabling upstream audio from previous sessions and makes Sound Off deterministic for new users.
- **Confidence:** HIGH
- **Source:** WebFetch — https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
- **Checked:** 2026-05-14
- **Alternatives rejected:** Restoring CoreScope's existing `live-audio-enabled=true` behavior is rejected because it conflicts with the default-off requirement and can hit suspended-context UX. Server-side persistence is rejected because the constraint says local-only.

### ITEM-architecture-6: Put the selector in overlay-owned UI, not inside upstream live controls only

- **Recommendation:** Render a compact `Sound` selector as overlay-owned DOM. Prefer placing it in `denvermc-shell.js`'s top bar actions on `/map#/live`, with a fallback insertion into CoreScope's `.live-controls-body` for analyzer mode if the top bar is hidden or not yet mounted. Keep the CoreScope upstream Audio checkbox disabled/hidden when the overlay sound engine is present to prevent duplicate audio.
- **Rationale:** The existing Colorado Mesh shell already owns the minimal-map top bar and persists local UI preferences. CoreScope's live controls are crowded, collapsed on narrow screens, and currently expose the old "Audio" checkbox tied to `MeshAudio`. Overlay-owned UI keeps the new modes discoverable in the default minimal map while leaving full analyzer access intact.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:134-265`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:881-913`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Replacing CoreScope's generated live controls by string patching `live.js` is rejected as brittle. Leaving both the old Audio checkbox and new mode selector active is rejected because users can produce doubled sound and confusing persistence behavior.

### ITEM-architecture-7: Implement Native+ as the baseline one-shot/mixer mode, not as a thin call to current MeshAudio

- **Recommendation:** Implement Native+ in the overlay engine as short procedural one-shots: soft packet ticks for generic packets, warmer chimes for group/direct messages, low pizzicato-style plucks for ADVERT/node activity, and distinct but restrained priority accents. Add global and per-event token-bucket rate limiting, random pitch/velocity variation, stereo pan from longitude when available, and a limiter on the master bus.
- **Rationale:** CoreScope's existing `MeshAudio` is a useful parser/reference, but it is currently a single voice-registration engine oriented toward "constellation" melodic packet sonification. Native+ should be a polished default-like sound design layer that stays intelligible during packet bursts. Implementing it as an overlay strategy lets it share the new selector, rate limiter, and master mix with other modes.
- **Confidence:** MEDIUM
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:73-116`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:27-135`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Directly enabling current `MeshAudio` for Native+ is rejected because it is melody-oriented and tied to old controls/persistence. Shipping unrate-limited one-shots is rejected because packet bursts would become fatiguing and could overload active Web Audio nodes.

### ITEM-architecture-8: Build Generative Key as a scheduler fed by packet bursts

- **Recommendation:** Implement Generative Key as a mode strategy with a fixed key/scale, a short rolling event queue, and a lookahead scheduler. Map messages to short melodic motifs, node/advert activity to bass or arpeggio notes, observation count to chord density, and packet bytes/hash to deterministic note choice within the key. Keep motifs short and bounded so bursts create texture rather than endless sequences.
- **Rationale:** CoreScope's existing constellation voice already proves that raw packet bytes, payload type, hop count, observation count, and longitude can drive scale-quantized Web Audio. The new architecture should reuse the concept but move it behind the shared mode engine so it can be opt-in, rate-limited, and mixed consistently with other modes.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:9-135`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-lab.js:113-185`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Fully random melody generation is rejected because it will sound incoherent and not repeatably reflect packet data. Long autonomous background music is rejected because the requirement is activity-driven map sound, not a soundtrack.

### ITEM-architecture-9: Structure Orchestral Ensemble around a license-checked lazy sample bank with synth fallback

- **Recommendation:** Create an optional sample manifest format now, even if no samples ship initially: `{ id, url, instrument, note, license, attribution, sha256 }`. Load and decode samples only after the user selects Orchestral Ensemble. Require CC0 or explicitly project-approved licenses at review time. If samples are absent, fall back to procedural approximations so the mode remains testable without bundling any questionable assets.
- **Rationale:** The project specifically wants legal safety and future-safe sample addition. Web Audio best practice for short event sounds is to fetch/decode audio buffers and create a fresh buffer source for each playback. Lazy loading keeps the default Docker/static asset footprint small and avoids loading audio assets for users who keep Sound Off.
- **Confidence:** HIGH
- **Source:** WebFetch — https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices
- **Checked:** 2026-05-14
- **Alternatives rejected:** Bundling copyrighted film/game samples or Andrew Huang Collisions assets is rejected by constraint. Loading orchestral samples on page load is rejected because Sound Off is default and most users may never enable this mode.

### ITEM-architecture-10: Make Space Blaster fully procedural and brand-neutral

- **Recommendation:** Implement Space Blaster with Web Audio oscillators, filtered noise, envelopes, delay, and pitch sweeps. Use neutral labels and parameters (`zap`, `chirp`, `laserSweep`) and do not reference or imitate protected Star Wars sample names or assets. Map packet hop count to sweep length, message packets to brighter zaps, and priority/emergency to a lower accent plus short noise transient.
- **Rationale:** Procedural synthesis is license-safe, small, and well suited for short sci-fi UI sounds. It also shares the same engine infrastructure as Native+ and Generative Key and avoids any static sample review burden.
- **Confidence:** HIGH
- **Source:** Project constraint — no copyrighted Star Wars samples; WebFetch — https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices
- **Checked:** 2026-05-14
- **Alternatives rejected:** Using actual Star Wars samples, near-identical branded recreations, or downloaded sound packs with unclear licenses is rejected. Shipping large sci-fi sample banks is rejected because procedural synthesis can meet the requirement more safely.

### ITEM-architecture-11: Add lifecycle guards for SPA route changes, hidden tabs, and high packet rates

- **Recommendation:** The overlay engine should pause scheduling when `document.hidden`, stop and disconnect active sources on mode changes, and suspend or quiet the engine when leaving `#/live`. Keep hard caps such as max active sources, max scheduled lookahead, and per-event minimum gaps. Mirror CoreScope's background behavior: when the tab is hidden, buffer/state may update but sound should not queue up and burst on return.
- **Rationale:** CoreScope already skips live animations while hidden and clears propagation buffers on restore. Audio must follow the same policy or it will play delayed bursts after background throttling. Since the overlay asset survives SPA route changes, it needs its own route/lifecycle state instead of relying on CoreScope page destroy hooks.
- **Confidence:** HIGH
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:669-732`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:3318-3363`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Letting Web Audio timers run while hidden is rejected because browsers throttle timers and users do not expect background map audio. Depending on CoreScope's page `destroy()` to clean overlay state is rejected because overlay code is external to CoreScope's registered page modules.

### ITEM-architecture-12: Prefer deterministic test seams over audible assertions

- **Recommendation:** Expose a small debug/test API such as `window.__denvermcMapSound = { getMode, setModeForTest, getStats, normalizePacket }`. Count handled/dropped/rate-limited events and last scheduled mode event. Unit-test normalization with packet fixtures and Playwright-test the UI/default-off/localStorage behavior; do not try to assert audible output in browser E2E.
- **Rationale:** Browser audio output is hard to test reliably in CI, especially with autoplay policies. CoreScope already exposes test seams such as `window.__corescopeLogo` and helper exports, so an overlay seam fits the codebase style and makes the feature observable without requiring microphone/loopback audio capture.
- **Confidence:** MEDIUM
- **Source:** Codebase — `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/app.js:588-598`, `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2229-2236`
- **Checked:** 2026-05-14
- **Alternatives rejected:** Relying only on manual listening is rejected because regressions in default-off, persistence, or rate limits can slip through. Audio waveform assertions in Playwright are rejected as too brittle for this project.

## Proposed Component Boundaries

- `corescope-overlay/denvermc-sound.js`: singleton engine, bridge installer, mode strategies, packet normalization, localStorage, test seam.
- `corescope-overlay/denvermc-sound.css`: selector styling, suspended/unlock state, compact mobile behavior.
- `corescope-overlay/denvermc-shell.js`: optionally hosts/positions the selector in the Colorado Mesh top bar, or calls a `window.DenverMCMapSound.mountControl(container)` hook.
- `corescope-overlay/sounds/manifest.json` and `corescope-overlay/sounds/*`: optional future CC0 sample bank for Orchestral Ensemble only.
- `scripts/apply-corescope-overlay.mjs`: copies/injects new overlay assets; no direct vendor source edits.

## Recommended Data Flow

1. CoreScope receives WS packet and renders it through `bufferPacket()` / `renderPacketTree()`.
2. CoreScope applies favorites/node/region filters and builds `consolidated` packet.
3. Overlay bridge intercepts the existing `MeshAudio.sonifyPacket(consolidated)` call.
4. Bridge normalizes packet into semantic `SoundEvent` objects.
5. `DenverMCMapSound.handle(event)` drops events when mode is `off`, tab hidden, route not live, context suspended, or rate-limited.
6. Active strategy schedules Web Audio nodes/samples through the shared engine graph.
7. Mode selector writes `denvermc.mapSound.mode` locally and resumes/initializes audio only from user interaction.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-architecture-1 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs:2-24`; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile:86-96` |
| ITEM-architecture-2 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2307-2367`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/app.js:618-645` |
| ITEM-architecture-3 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:46-71`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2362-2367` |
| ITEM-architecture-4 | HIGH | WebFetch | https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-architecture-5 | HIGH | WebFetch | https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide |
| ITEM-architecture-6 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js:134-265`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:881-913` |
| ITEM-architecture-7 | MEDIUM | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js:73-116`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:27-135` |
| ITEM-architecture-8 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js:9-135`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-lab.js:113-185` |
| ITEM-architecture-9 | HIGH | WebFetch | https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-architecture-10 | HIGH | Project Constraint / WebFetch | Project prompt; https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Best_practices |
| ITEM-architecture-11 | HIGH | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:669-732`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:3318-3363` |
| ITEM-architecture-12 | MEDIUM | Codebase | `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/app.js:588-598`; `/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/live.js:2229-2236` |
