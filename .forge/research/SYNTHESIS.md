# Research Synthesis

## Status
- Files synthesized: stack.md, pitfalls.md, architecture.md, prior-art.md, PROJECT.md
- Files missing: codex-analysis.md
- Overall confidence: HIGH

## Executive Summary
This is a brownfield repair and polish project for the Colorado Mesh CoreScope map: rework browser-local map sonification so busy traffic sounds fuller instead of thinner, and make the injected CoreScope overlay polished on mobile/portrait screens. The proven way to build it is not a rewrite: keep the existing CoreScope overlay/patch layer, preserve the single Docker container, avoid editing `vendor/CoreScope`, and use plain browser APIs and CSS where the overlay already owns the integration surface.

The recommended technical approach is a density-metered Web Audio pipeline: adapt CoreScope packet groups into metadata-only sound events, feed every valid event into rolling traffic buckets, and let a short-lookahead scheduler render bounded musical layers from aggregate density. Keep one-shots only for salient/priority accents, with fixed budgets and cleanup. For UI, keep the overlay shell but make it an explicit responsive state machine with progressive disclosure on phones, dynamic viewport/safe-area CSS, and browser-level Playwright coverage. Also update site-wide logo usage to the new Colorado Mesh icon source requested in the project constraints: `https://github.com/Colorado-Mesh/icons/blob/main/color/mesh-color.png`.

The top risks are privacy regression, autoplay/unlock failure on mobile, runaway AudioNodes under bursts, and portrait control collisions. Mitigate these by enforcing a narrow metadata-only adapter, making the sound unlock boundary an explicit user gesture state machine, separating pure traffic modeling from Web Audio resource ownership, capping scheduled slices/sources, and testing real CoreScope overlay states at narrow mobile widths. Prior art supports this direction: network sonification systems such as SoNSTAR aggregate traffic over windows; CoreScope already provides useful Web Audio concepts but must not be copied where it uses payload bytes; Tone.js/howler.js offer timing and asset-discipline lessons without justifying new dependencies.

## Key Decisions (resolved by research)

1. Implement in `corescope-overlay/` and `scripts/apply-corescope-overlay.mjs`; do not edit `vendor/CoreScope` and do not rewrite the map in Next/React. Sources: ITEM-stack-1, ITEM-architecture-7, ITEM-prior-art-3.
2. Use native Web Audio primitives, not Tone.js/howler.js/another music framework. Sources: ITEM-stack-2, ITEM-prior-art-4, ITEM-prior-art-5, ITEM-prior-art-11.
3. Replace packet-per-note as the core behavior with rolling density aggregation plus a bounded musical scheduler. Sources: ITEM-stack-3, ITEM-architecture-1, ITEM-pitfalls-1, ITEM-pitfalls-2, ITEM-prior-art-1.
4. Keep sound browser-local, opt-in, default-off, and unlocked only by explicit user gesture. Sources: ITEM-stack-4, ITEM-architecture-3, ITEM-pitfalls-3, ITEM-prior-art-9, ITEM-prior-art-11.
5. Enforce metadata-only sonification at an adapter boundary; do not pass payload text or raw packet bytes into the sound layer. Sources: ITEM-architecture-4, ITEM-pitfalls-7, ITEM-prior-art-2.
6. Use plain CSS for CoreScope overlay layout, with dynamic viewport units, safe-area variables, and progressive disclosure on narrow screens. Sources: ITEM-stack-7, ITEM-stack-8, ITEM-architecture-8, ITEM-architecture-9, ITEM-prior-art-13, ITEM-prior-art-14.
7. Preserve the existing single-container Docker deployment and avoid backend/database changes. Sources: ITEM-stack-9, PROJECT.md constraints.
8. Treat AudioWorklet as optional phase two only if testing shows simple scheduled Web Audio nodes are insufficient. Sources: ITEM-stack-6, ITEM-prior-art-12, ITEM-architecture-5.
9. Add mobile portrait Playwright coverage and pure traffic-model tests rather than relying on desktop smoke tests or subjective listening alone. Sources: ITEM-stack-10, ITEM-architecture-10, ITEM-pitfalls-9.
10. Update site-wide logo usage to the new Colorado Mesh icon source provided by the user. Sources: PROJECT.md line 14.

## Questions for User

### Q-1: What should the default sound experience be when a user explicitly starts sound?

- **Category:** ux
- **Why it matters:** This determines the main density mapping, palette, and which mode receives the most polish. Research suggests the default should be calm and musical, with novelty/bright modes kept secondary.
- **Default recommendation:** Make the default an orchestral/ambient density mode: stable key, soft attacks, continuous bed plus restrained priority accents; keep “Space Blaster” as an explicit novelty option.
- **Source refs:** ITEM-pitfalls-12, ITEM-prior-art-6, ITEM-prior-art-8, ITEM-architecture-6
- **Priority:** HIGH

### Q-2: Which existing sound modes must remain user-selectable after the rework?

- **Category:** scope
- **Why it matters:** Keeping too many modes increases tuning/test burden; removing modes may surprise existing users. The scheduler can support multiple modes, but every mode needs bounded density behavior.
- **Default recommendation:** Keep Off, Default/Ensemble density, and Space Blaster/Novelty; retire or alias redundant modes unless there is a known user need.
- **Source refs:** ITEM-stack-3, ITEM-pitfalls-12, ITEM-prior-art-3
- **Priority:** HIGH

### Q-3: Should replay/historical packets contribute to sound density, or only live traffic?

- **Category:** scope
- **Why it matters:** Replay data can create misleading density and surprise users if sound implies current network activity. Live-only density is clearer, but replay sonification could be useful if labeled.
- **Default recommendation:** Feed only live packets into audible density by default; if replay is audible, use a visibly separate “replay/demo” state and softer palette.
- **Source refs:** ITEM-architecture-4, ITEM-architecture-10, ITEM-prior-art-9
- **Priority:** HIGH

### Q-4: What packet metadata should count as priority or emergency for reserved accents?

- **Category:** technical
- **Why it matters:** Priority accents need a stable, auditable rule so high-salience sounds remain meaningful and do not fatigue users.
- **Default recommendation:** Use existing map-visible priority/emergency classifications and packet type metadata only; do not infer urgency from message text or raw payload bytes.
- **Source refs:** ITEM-architecture-4, ITEM-pitfalls-7, ITEM-pitfalls-12, ITEM-prior-art-2
- **Priority:** HIGH

### Q-5: Is an aggressive mobile top-bar collapse acceptable on portrait phones?

- **Category:** ux
- **Why it matters:** Research found that fitting brand, sound select, volume, focus, analyzer, and site controls into one row will fail at 320–420px widths. A compact trigger plus popover/bottom sheet is the safer pattern.
- **Default recommendation:** On phones, show brand + one sound/start state button + one analyzer/menu action in the top bar, moving mode/volume/details into an accessible sheet or popover.
- **Source refs:** ITEM-architecture-8, ITEM-pitfalls-9, ITEM-prior-art-13
- **Priority:** HIGH

### Q-6: Should volume remain directly visible on mobile, or move behind the sound sheet?

- **Category:** ux
- **Why it matters:** Direct volume control is useful but competes with tap targets and top-bar space. Hiding it requires a clear path for quick muting.
- **Default recommendation:** Keep a visible Start/Stop or speaker button in the top bar; put the slider and mode selector in the sound sheet on narrow screens.
- **Source refs:** ITEM-stack-8, ITEM-pitfalls-9, ITEM-architecture-8
- **Priority:** MEDIUM

### Q-7: What are the target mobile devices and minimum viewport widths for acceptance?

- **Category:** constraints
- **Why it matters:** CSS breakpoints and screenshot tests need explicit devices. Research specifically calls out 320, 360, 390, and 430px portrait widths plus safe-area behavior.
- **Default recommendation:** Accept iPhone SE/320, common Android 360, iPhone 390/393, and 430px large phones in portrait; include at least one landscape sanity check.
- **Source refs:** ITEM-stack-10, ITEM-pitfalls-9, ITEM-pitfalls-10, ITEM-prior-art-13
- **Priority:** HIGH

### Q-8: Should the provided GitHub logo URL be used directly, or should the asset be vendored locally for same-origin delivery?

- **Category:** technical
- **Why it matters:** The project requires site-wide logo update to the provided source, but the existing CSP/privacy posture favors local/self-hosted assets and no remote runtime dependencies.
- **Default recommendation:** Use the provided URL as the authoritative source, but vendor/download the image into the repo or existing public assets and reference it same-origin site-wide.
- **Source refs:** PROJECT.md, ITEM-stack-11, ITEM-stack-9
- **Priority:** HIGH

### Q-9: How strict should the metadata-only boundary be for raw packet bytes?

- **Category:** risk
- **Why it matters:** Prior CoreScope audio uses sampled payload bytes, and the current overlay has used raw hex-derived intensity. The project constraint says metadata only and never message contents; raw bytes can encode contents.
- **Default recommendation:** Treat `raw_hex`, decoded payloads, and message bodies as forbidden for sound. Use packet hash/id, type, channel metadata, observations, hops, timestamps, and visible priority flags only.
- **Source refs:** ITEM-architecture-4, ITEM-pitfalls-7, ITEM-prior-art-2
- **Priority:** HIGH

### Q-10: Are small new audio samples allowed, and what is the mobile memory budget?

- **Category:** technical
- **Why it matters:** Better orchestral sound may tempt more/larger samples, but decoded `AudioBuffer`s can consume significant memory on phones.
- **Default recommendation:** Prefer procedural density layers and keep samples short, mono where possible, few in number, and lazy-loaded by mode; do not add long loops or large sample banks.
- **Source refs:** ITEM-stack-5, ITEM-pitfalls-5, ITEM-prior-art-5
- **Priority:** MEDIUM

### Q-11: Should the project include a 5–10 minute real-traffic listening review before final acceptance?

- **Category:** risk
- **Why it matters:** The main sound failures are behavioral and fatigue-related, not just code correctness. Synthetic tests can prove caps and density but not whether the result is pleasant.
- **Default recommendation:** Add a manual listening acceptance step using real or replayed metadata traffic, checking low, normal, high, and bursty conditions.
- **Source refs:** ITEM-pitfalls-12, ITEM-architecture-10, ITEM-prior-art-1
- **Priority:** MEDIUM

### Q-12: What should screen readers announce for sound state changes?

- **Category:** ux
- **Why it matters:** The shell already uses live-region status; over-announcing counters or packet activity would be noisy, while under-announcing suspended audio would be misleading.
- **Default recommendation:** Announce only user-relevant state transitions: Off, Needs tap to start, Sound on, Suspended/needs tap, Unavailable. Keep counters out of live regions.
- **Source refs:** ITEM-pitfalls-13, ITEM-architecture-3, ITEM-prior-art-11
- **Priority:** MEDIUM

### Q-13: Should focus/minimal/analyzer modes preserve the same sound controls, or can controls move by mode?

- **Category:** scope
- **Why it matters:** The overlay has multiple UI modes and mobile collisions differ by mode. Planning needs clear contracts for where users find sound and exit/focus actions.
- **Default recommendation:** Keep sound start/stop reachable in every mode, but allow secondary controls to move into the same disclosed sheet/menu on mobile.
- **Source refs:** ITEM-architecture-8, ITEM-pitfalls-10, ITEM-pitfalls-11
- **Priority:** MEDIUM

### Q-14: Should implementation split `denvermc-sound.js` into multiple overlay files, or keep internal modules in one file?

- **Category:** technical
- **Why it matters:** Separate files improve boundaries and testability but require injector/build changes. Internal modules avoid build churn but keep the file large.
- **Default recommendation:** Start with explicit internal module sections in `denvermc-sound.js`; split into overlay files only if the injector change is small and tests cover injection order.
- **Source refs:** ITEM-architecture-5, ITEM-architecture-7, ITEM-stack-1
- **Priority:** LOW

### Q-15: Under what condition should AudioWorklet be introduced?

- **Category:** technical
- **Why it matters:** AudioWorklet can improve custom continuous DSP but adds module-loading and real-time complexity. The research agrees it should not be the default fix.
- **Default recommendation:** Do not use AudioWorklet initially. Reconsider only if profiling shows main-thread scheduled nodes cannot maintain the continuous density bed under target mobile load.
- **Source refs:** ITEM-stack-6, ITEM-prior-art-12, ITEM-architecture-5
- **Priority:** LOW

## Technical Direction

### Stack

- Core integration: existing CoreScope overlay copied/injected by `scripts/apply-corescope-overlay.mjs`; no direct edits under `vendor/CoreScope`.
- Sound runtime: native Web Audio with one `AudioContext`, explicit user gesture unlock, master gain, bus gains, gentle final compressor/limiter, short-lived oscillator/source nodes, reusable decoded buffers/noise buffers, and `AudioParam` automation.
- Scheduling: JS timer as a scheduler wake-up only; use `audioCtx.currentTime` and a short lookahead window for actual timing.
- UI/CSS: plain modern CSS in `corescope-overlay/denvermc-shell.css`; media queries, custom properties, `env(safe-area-inset-*)`, `100dvh`/`100svh` where appropriate, and progressive disclosure.
- Deployment: existing Next standalone + CoreScope + nginx/supervisor single Docker image; no database/service changes.
- Testing: Playwright browser tests for actual injected overlay/mobile states and audio unlock behavior; pure unit tests for metadata normalization, traffic-density math, and scheduling budgets.
- Assets/CSP: same-origin local sound and image assets. For the new logo, treat `https://github.com/Colorado-Mesh/icons/blob/main/color/mesh-color.png` as the authoritative requested source but prefer vendoring/serving it locally to preserve CSP and runtime reliability.

### Architecture

Build a sound pipeline with these boundaries:

1. `SoundEventAdapter`: receives CoreScope consolidated packet groups and emits a narrow metadata-only `SoundEvent`. It must not expose payload text, decoded message bodies, or raw packet bytes to sound logic.
2. `TrafficModel`: pure rolling counters over 250–500ms buckets by lane such as `priority`, `message`, `node`, and `other`. Every valid metadata event contributes to density, even if no one-shot cue is played.
3. `Scheduler`: when sound is unlocked/on, wakes at a fixed cadence, schedules slices roughly 100ms ahead using `audioCtx.currentTime`, and tracks slice generations for cancellation.
4. `AudioGraph`: owns Web Audio resources, buses (`bed`, `pulse`, `accent`, `ui/test`), gain staging, sample buffers, active source registry, hard caps, cleanup, and emergency stop.
5. `DebugState`: exposes counters for tests and diagnostics: ingested events, aggregated buckets, scheduled slices, active sources, one-shots dropped by cap, audio state, and optional limiter/level indicators.
6. `Shell UI`: owns accessible controls and responsive disclosure; it reflects audio state without driving sound from packet activity.

### Prior Art to Leverage

- SoNSTAR: aggregate network traffic into time-window features and reserve salient cues for unusual/priority activity. Use the principle, not the TCP/security-specific mappings. Source: ITEM-prior-art-1.
- CoreScope audio: reuse concepts such as voice modules, scales, envelopes, hop/observation metadata, and capped polyphony, but do not use vendor payload-byte mappings and do not edit vendor files. Source: ITEM-prior-art-2.
- Existing Colorado Mesh overlay: keep the runtime override/control API shape and improve the engine underneath it. Source: ITEM-prior-art-3.
- Tone.js: borrow timing discipline and lookahead concepts, not the dependency. Source: ITEM-prior-art-4.
- howler.js: borrow sample asset discipline/audio-sprite thinking if samples grow, not the dependency for this fix. Source: ITEM-prior-art-5.
- TwoTone/Erie/SIREN: use stable, reviewable mapping tables and named tracks/lanes so the sound has a learnable auditory legend. Sources: ITEM-prior-art-6, ITEM-prior-art-7, ITEM-prior-art-8.
- Mobile map/viewport guidance: collapse controls, maintain tap targets, use safe-area/dynamic viewport primitives, and test real small widths. Sources: ITEM-prior-art-13, ITEM-prior-art-14.

## Detailed Planning Implications

1. Start with an audit step: locate logo references, overlay injection points, current sound mode/state functions, sound asset manifest usage, and mobile topbar selectors. Include the new Colorado Mesh logo requirement in this audit.
2. Implement the privacy boundary before sound-design changes. Define an allowlisted `SoundEvent` shape and tests proving payload text/raw bytes cannot affect sound output.
3. Add a pure `TrafficModel` with synthetic burst tests before Web Audio rendering. Verify high input rates increase density metrics while bounded scheduling remains capped.
4. Build the scheduler and graph in a sequence that preserves opt-in behavior: no `AudioContext` creation/resume outside explicit user gestures, and no audible output while locked/off.
5. Keep per-event accents as a separate capped lane. A dropped one-shot must never remove its density contribution.
6. Refactor mix/gain staging into explicit buses before tuning sounds. Leave headroom and use the compressor only as a safety limiter.
7. Add state reconciliation and cleanup: `statechange`, `visibilitychange`, mode/off changes, and route teardown should update UI state and stop/cancel future scheduled slices safely.
8. Mobile UI work should be planned as a distinct visual step, preferably delegated to the intended Opus UI pass if file edits are required for polish. Define acceptance screenshots first.
9. Use CSS custom properties for topbar height, safe-area padding, viewport height, and layer offsets; avoid scattered magic `top`/`bottom` values.
10. Define a stacking and pointer-events contract for Leaflet/CoreScope panels, Colorado Mesh topbar/actions, bottom sheet/popovers, and focus exit.
11. Extend Playwright with mobile portrait projects and states: minimal map, analyzer open, focus mode, sound locked/on/sheet open, and site logo/header checks.
12. Add load/performance verification: synthetic low/normal/high/burst traffic, active source caps, no unbounded timers/nodes, no sample manifest growth beyond budget, and manual listening review.
13. Preserve deployment: no new service, database, CDN audio dependency, or CSP loosening for this project.
14. Avoid broad MutationObserver work in hot paths; scope observers, filter records, and coalesce DOM updates.

## Risk Register

| Risk | Severity | Mitigation | Source refs |
|------|----------|------------|-------------|
| Busy traffic gets quieter/thinner because one-shots are dropped | CRITICAL | Split ingestion from playback; every valid event updates rolling density; one-shots are optional accents only | ITEM-pitfalls-1, ITEM-pitfalls-2, ITEM-architecture-1 |
| Mobile autoplay/unlock fails or relocks after backgrounding | CRITICAL | Explicit Start sound gesture; audio state machine; `statechange`/`visibilitychange` handling; never auto-resume from packets | ITEM-pitfalls-3, ITEM-architecture-3, ITEM-stack-4 |
| Runaway AudioNodes/timers leak or falsely throttle audio | CRITICAL | Short lookahead, hard per-slice/per-lane caps, active source registry, `onended` cleanup, emergency stop/reconciliation | ITEM-pitfalls-4, ITEM-architecture-2, ITEM-architecture-6 |
| Privacy regression through payload text or raw packet bytes | CRITICAL | Metadata-only adapter, forbidden fields, tests that text/raw changes do not influence sound | ITEM-pitfalls-7, ITEM-architecture-4 |
| Portrait top bar overflows or loses tappable controls | CRITICAL | Progressive disclosure, 44px practical targets, mobile screenshot tests at 320–430px | ITEM-pitfalls-9, ITEM-architecture-8, ITEM-prior-art-13 |
| Mobile viewport/safe-area issues clip map controls | CRITICAL | Use `100dvh`/safe-area variables, visualViewport/orientation hooks where needed, Leaflet `invalidateSize()` after transitions | ITEM-pitfalls-10, ITEM-architecture-9, ITEM-prior-art-14 |
| Sample additions blow mobile memory | MODERATE | Keep samples short/few/mono, lazy-load by mode, cap total decoded duration, prefer procedural layers | ITEM-pitfalls-5, ITEM-stack-5, ITEM-prior-art-5 |
| Compressor pumping/fatigue under dense mix | MODERATE | Explicit bus gain budgets, density through timbre/rhythm/harmony instead of loudness, gentle limiter only | ITEM-pitfalls-6, ITEM-architecture-6 |
| Broad MutationObservers cause UI jank | MODERATE | Scope observers, filter records, debounce/coalesce, disconnect when done/off-route | ITEM-pitfalls-8 |
| Leaflet z-index/pointer collision makes map feel unresponsive | MODERATE | Define stacking contract; use `pointer-events: none` on non-interactive containers; test drag/pinch/zoom | ITEM-pitfalls-11 |
| Sound UX becomes annoying over time | MODERATE | Calm default palette, reserved priority timbre, 5–10 minute listening review | ITEM-pitfalls-12 |
| Accessibility status becomes noisy or misleading | MODERATE | Live-region only for major sound states; status reflects actual `AudioContext.state`; keep counters out of live announcements | ITEM-pitfalls-13 |
| Remote logo reference weakens CSP/runtime reliability | MODERATE | Vendor or serve the provided icon source same-origin while documenting source provenance | PROJECT.md, ITEM-stack-11 |

## Conflicts & Tradeoffs

1. **Richer sound vs bounded performance.** The desired behavior is fuller high traffic, but per-packet cueing and more samples risk runaway nodes and memory. Resolve with aggregate density layers and capped accents. Sources: ITEM-stack-3, ITEM-pitfalls-1, ITEM-pitfalls-4, ITEM-pitfalls-5, ITEM-architecture-6.
2. **Current CoreScope audio concepts vs metadata-only privacy.** CoreScope’s upstream audio uses raw/payload-byte mapping concepts that can be musically useful, but Colorado Mesh must never use message contents or raw bytes. Reuse only concepts based on safe metadata. Sources: ITEM-prior-art-2, ITEM-architecture-4, ITEM-pitfalls-7.
3. **Direct mobile controls vs polished portrait layout.** Keeping select/slider/status visible is convenient, but it overcrowds narrow top bars. Use a primary sound button plus sheet/popover. Sources: ITEM-pitfalls-9, ITEM-architecture-8, ITEM-prior-art-13.
4. **Logo URL requirement vs same-origin/CSP discipline.** The user provided a GitHub URL as the new logo source, while stack research recommends same-origin assets and no new remote runtime dependencies. Treat the URL as the authoritative source and serve a local copy. Sources: PROJECT.md, ITEM-stack-11.
5. **AudioWorklet performance option vs implementation complexity.** AudioWorklet is the right tool for custom DSP if needed, but it adds complexity and is not necessary before profiling. Start with scheduled Web Audio nodes. Sources: ITEM-stack-6, ITEM-prior-art-12, ITEM-architecture-5.
6. **Subjective sound quality vs automated verification.** Automated tests can prove caps and state transitions, but cannot fully validate pleasantness/fatigue. Add both synthetic tests and manual listening review. Sources: ITEM-architecture-10, ITEM-pitfalls-12.
7. **One-file overlay simplicity vs modular testability.** Keeping `denvermc-sound.js` monolithic avoids injector churn, but boundaries are needed for privacy/load tests. Use clear internal modules first; split only if injection remains simple. Sources: ITEM-architecture-5, ITEM-architecture-7.

## Confidence Assessment

| Dimension | Status | Confidence | Notes |
|-----------|--------|------------|-------|
| stack | complete | HIGH | Strong agreement on overlay layer, native Web Audio, plain CSS, single Docker, and browser/mobile tests. |
| pitfalls | complete | HIGH | Concrete code-level risks identified for packet thinning, autoplay, node cleanup, privacy, mobile layout, viewport, and accessibility. |
| architecture | complete | HIGH | Clear pipeline, state boundaries, UI shell model, and test strategy. Some bus/musical details remain design decisions. |
| prior-art | complete | HIGH | Prior art strongly supports aggregation, opt-in map audio, stable mappings, and avoiding unnecessary frameworks. |
| codex-analysis | missing | LOW | Optional supplemental research only; absence does not reduce synthesis validity because all four Claude dimensions are complete. |
