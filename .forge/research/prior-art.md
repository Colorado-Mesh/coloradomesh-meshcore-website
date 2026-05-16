# Prior Art Research — Colorado Mesh CoreScope Map Sound + Mobile Overlay

Checked: 2026-05-15

### ITEM-prior-art-1: SoNSTAR network-traffic sonification

- **URL:** https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0195948
- **What it does well:** SoNSTAR sonifies real-time TCP/IP traffic for situational awareness by aggregating traffic into behavioral features over time windows rather than triggering one sound per raw packet. It maps normal baseline activity to calmer background sounds and unusual/risky activity to more salient cues, with user-tunable thresholds, window sizes, and sound levels.
- **What it lacks:** Its windowed analysis introduces delay, its mappings are TCP/security-domain-specific, and its recorded natural-sound palette is not a direct fit for musical map activity. It is research prior art, not a drop-in browser overlay for CoreScope/MeshCore.
- **What we can learn:** Use aggregate traffic density as a first-class musical layer. High traffic should increase texture/density/fullness through a bounded rolling window, not get quieter because per-event voices are throttled. Preserve per-event accents only for priority/emergency/notable packets, and let ordinary busy traffic feed a continuous bed/pulse.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** WebFetch — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0195948
- **Checked:** 2026-05-15

### ITEM-prior-art-2: CoreScope upstream MeshAudio and Constellation voice

- **URL:** local:/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js; local:/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js; local:/Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/AUDIO-PLAN.md
- **What it does well:** CoreScope already has browser-local Web Audio, explicit voice modules, capped polyphony, packet metadata/raw-byte mapping, type-based scales, observation-count voicing, hop-based filters, panning, and a documented audio lab/workbench concept. The Constellation voice creates a musical sequence from sampled payload bytes and cleans up nodes after playback.
- **What it lacks:** It is one-sound-per-packet oriented, drops events when `MAX_VOICES` is reached, and upstream `restore()` can eagerly initialize audio if stored enabled. It maps from raw payload bytes/message-bearing packets, which conflicts with the Colorado Mesh requirement to use metadata only and never message contents.
- **What we can learn:** Keep the successful modular/audio-context pattern but override it in the overlay. Reuse concepts, not vendor files: voice modules, scales, envelopes, observation/hop metadata, limiter/compressor, and debug counters. Replace payload-byte melody with metadata-derived stable seeds and rolling density lanes.
- **License:** GPL-3.0
- **Confidence:** HIGH
- **Source:** Local codebase — /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js; /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js; /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/AUDIO-PLAN.md; /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/LICENSE
- **Checked:** 2026-05-15

### ITEM-prior-art-3: Colorado Mesh existing overlay sound bridge

- **URL:** local:/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js; local:/Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js; local:/Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs
- **What it does well:** The overlay already follows the right brownfield integration shape: it leaves `vendor/CoreScope` untouched, injects overlay assets during build, suppresses upstream audio, requires user gesture for unlock, stores Colorado Mesh-specific sound settings, exposes counters/debug state, and bounds active voices/nodes/timers.
- **What it lacks:** The current event router drops/throttles individual cues under load, so busy traffic can audibly thin out. It has no aggregate density engine, no persistent rhythmic/tonal bed, and no separate queue for “density changed” versus “packet accent.” Mobile top-bar controls are present but narrow portrait layouts still risk crowding and need a stronger collapse pattern.
- **What we can learn:** Build the fix inside this overlay, not CoreScope. Convert the sound engine from pure per-event cueing to a small state machine: rolling lane counters -> density targets -> continuous bounded layers, plus capped accent queues for notable events. Keep `__coloradoMeshSound` as the control API so the shell UI does not need a framework rewrite.
- **License:** Project-local overlay; CoreScope integration subject to GPL-3.0 context
- **Confidence:** HIGH
- **Source:** Local codebase — /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js; /Users/cjvana/Documents/GitHub/denvermc-org/scripts/apply-corescope-overlay.mjs
- **Checked:** 2026-05-15

### ITEM-prior-art-4: Tone.js browser music framework

- **URL:** https://tonejs.github.io/
- **What it does well:** Tone.js provides a mature browser music abstraction over Web Audio: synths, samplers, effects, musical timing, Transport, tempo-relative scheduling, and loading helpers. Its performance guidance emphasizes scheduling slightly ahead, using lookahead/latency hints deliberately, avoiding expensive nodes at scale, and keeping visual updates out of audio callbacks.
- **What it lacks:** It is an additional dependency and abstraction layer for a patch overlay that already has plain Web Audio code. It will not automatically solve density design; overload can still cause pops/crackles/silence if node counts and buffers are unbounded.
- **What we can learn:** Do not add Tone.js for this brownfield fix unless a larger audio rewrite is approved. Copy the proven timing patterns instead: schedule accents with a short lookahead, use musical time grids for pulses, avoid DOM work in playback callbacks, and cap node creation.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** WebFetch — https://tonejs.github.io/; https://github.com/Tonejs/Tone.js/wiki/Performance
- **Checked:** 2026-05-15

### ITEM-prior-art-5: howler.js audio sprites for bounded sample playback

- **URL:** https://github.com/goldfire/howler.js/
- **What it does well:** howler.js is a mature short-audio playback library with Web Audio first, HTML5 Audio fallback, audio sprites, mobile unlock handling, instance pooling, fades/rate/seek/volume controls, and MIT licensing. Audio sprites reduce request count and simplify clip management on mobile.
- **What it lacks:** It is optimized for playing samples, not generating musical state from event streams. It does not provide musical scheduling semantics, rolling-density sonification, or Web Audio graph control comparable to a custom engine.
- **What we can learn:** If sample-based orchestral accents remain, pack them into one or a few sprite files and keep decoded/loaded assets bounded. For the immediate fix, prefer the current manifest approach only if sample count is small; otherwise adopt sprite-style asset discipline without introducing howler.js.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/goldfire/howler.js/
- **Checked:** 2026-05-15

### ITEM-prior-art-6: TwoTone data sonification web app

- **URL:** https://twotone.io/
- **What it does well:** TwoTone is a free, open-source browser app for turning tabular data into music. It demonstrates accessible no-code mapping of data fields to pitch, volume, tempo/duration, scale, octave, arpeggio, instruments, multi-track output, and export workflows.
- **What it lacks:** It is dataset/composition oriented, not real-time browser event-stream audio. It has no map overlay, no bounded live scheduler for bursty traffic, and development appears paused.
- **What we can learn:** Provide a small “auditory legend” mental model even if no full editor ships: packet/category lanes should have stable timbre/register meanings, and density/priority mappings should be learnable. Avoid arbitrary pitch changes that users cannot connect to map behavior.
- **License:** MPL-2.0
- **Confidence:** HIGH
- **Source:** WebFetch — https://twotone.io/; https://github.com/sonifydata/twotone
- **Checked:** 2026-05-15

### ITEM-prior-art-7: Erie declarative sonification grammar

- **URL:** https://github.com/see-mike-out/erie-web
- **What it does well:** Erie separates data, mappings, tone design, legends, and composition. It maps attributes to auditory channels such as pitch, loudness, timbre, duration, sequencing, and overlaying, targeting Web Audio/Web Speech APIs.
- **What it lacks:** It is a young library with limited repository traction, no releases visible, and it is more of a grammar/toolkit than a battle-tested live map event engine. Pulling it into the overlay would add conceptual and bundle weight.
- **What we can learn:** Implement a tiny internal declarative mapping table in plain JS rather than importing Erie: event lane -> layer, packet type -> timbre/register, observations/hops -> intensity/filter, rolling rate -> density target. This keeps the sound design reviewable and prevents hard-coded scattered magic numbers.
- **License:** MIT
- **Confidence:** MEDIUM
- **Source:** WebFetch/WebSearch — https://github.com/see-mike-out/erie-web; https://arxiv.org/abs/2402.00156
- **Checked:** 2026-05-15

### ITEM-prior-art-8: SIREN web-audio sonification workstation

- **URL:** https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c
- **What it does well:** SIREN shows a Web Audio-based workstation can make sonification approachable through customizable auditory display mappings and DAW-like track/channel workflows.
- **What it lacks:** It is workstation prior art, not a compact production overlay. The visible page does not provide enough implementation detail for direct reuse, and its license context is CC BY-NC 4.0 for the publication rather than a simple software dependency signal.
- **What we can learn:** Treat the Colorado Mesh sound engine as a few named “tracks” or “lanes” internally: baseline bed, normal traffic pulse, low/node activity shimmer, and priority accents. This gives implementers a clear structure without shipping a full workstation UI.
- **License:** CC BY-NC 4.0 visible for publication; software license not confirmed from fetched page
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c
- **Checked:** 2026-05-15

### ITEM-prior-art-9: Audio Maps location-triggered map audio scaffold

- **URL:** https://lclarkmaps.github.io/
- **What it does well:** Audio Maps demonstrates a simple map-first audio interaction pattern: attach audio to geographic points, trigger playback by marker click or mobile proximity, and keep authoring straightforward through marker metadata.
- **What it lacks:** It uses static pre-recorded clips and hotspots, not real-time network events, musical scheduling, rolling density, or map-traffic sonification. Its license is not visible from the fetched page.
- **What we can learn:** Keep the map interaction explicit and user-controlled. Sound should remain opt-in, state should be visible in the top bar, and map audio should not surprise the user just because the map loaded.
- **License:** Open-source stated; specific license not visible
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://lclarkmaps.github.io/
- **Checked:** 2026-05-15

### ITEM-prior-art-10: Mesh map/analyzer ecosystem: meshmap-map, Malla, MeshExplorer, Meshtastic Web

- **URL:** https://github.com/bbbenji/meshmap-map; https://github.com/zenitraM/malla; https://github.com/ajvpot/meshexplorer; https://github.com/meshtastic/web
- **What it does well:** Existing mesh-map/analyzer tools validate the product shape: live node plotting, telemetry history, packet/node views, traceroute/link analytics, dashboards, Docker deployment, and mobile-first map layouts. Malla shows the ingest -> persist -> analyze -> visualize pattern; meshmap-map emphasizes mobile mapping and node search; MeshExplorer combines real-time map/chat/packet analysis across MeshCore and Meshtastic; Meshtastic Web validates browser-based mesh clients.
- **What it lacks:** These projects do not appear to solve musical event-stream sonification or Colorado Mesh’s browser-local metadata-only audio requirement. Some are server/database-heavy or MQTT-specific, and MeshExplorer’s license was not visible from the fetched page.
- **What we can learn:** Do not chase a wholesale replacement. CoreScope plus overlay remains the right path. Borrow UX expectations: mobile-first controls, searchable/inspectable map state, and clear separation between minimal map and full analyzer.
- **License:** meshmap-map MIT; Malla MIT; Meshtastic Web GPL-3.0; MeshExplorer license not visible
- **Confidence:** MEDIUM
- **Source:** WebFetch/WebSearch — https://github.com/bbbenji/meshmap-map; https://github.com/zenitraM/malla; https://github.com/ajvpot/meshexplorer; https://github.com/meshtastic/web
- **Checked:** 2026-05-15

### ITEM-prior-art-11: MDN/Web Audio platform guidance

- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- **What it does well:** MDN’s platform guidance is directly aligned with the project constraints: create or resume `AudioContext` inside a user gesture, handle suspended/running/closed states, use `AudioParam` automation for scheduled changes, choose generated oscillators or decoded buffers for short interactive sounds, and provide user volume/play controls.
- **What it lacks:** It is platform guidance, not a domain-specific sound design. It does not prescribe how to make dense traffic musically fuller.
- **What we can learn:** Keep sound off by default; only unlock through explicit top-bar interaction; automate gain/filter changes instead of abrupt value changes; and expose a volume control. This supports browser-local, opt-in, safe-under-load audio without hidden autoplay behavior.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** WebFetch — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- **Checked:** 2026-05-15

### ITEM-prior-art-12: AudioWorklet and Web Audio one-shot source patterns

- **URL:** https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Using_AudioWorklet
- **What it does well:** AudioWorklet is the modern pattern for custom high-performance audio processing off the main thread, avoiding deprecated main-thread `ScriptProcessorNode`. The Web Audio model also expects source nodes to be created per note/play while buffers can be kept memory-resident and reused.
- **What it lacks:** AudioWorklet adds extra files, async module loading, browser support considerations, and more implementation complexity than needed for a small oscillator/sample overlay if node counts are bounded.
- **What we can learn:** Do not add AudioWorklet for this fix unless profiling shows main-thread audio synthesis is causing glitches. Instead, keep DSP simple, reuse decoded buffers/noise buffers, cap active sources, and maintain bounded cleanup. If a future “continuous density synthesizer” becomes DSP-heavy, AudioWorklet is the correct next step.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** WebFetch — https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Using_AudioWorklet; https://www.w3.org/TR/2021/REC-webaudio-20210617/#AudioBufferSourceNode
- **Checked:** 2026-05-15

### ITEM-prior-art-13: Responsive mobile map overlay patterns

- **URL:** https://www.maplibrary.org/10067/7-best-practices-for-responsive-map-design/
- **What it does well:** Current mobile map UX guidance is consistent: start at 320px width, keep top UI minimal, show only essential information, hide secondary controls in collapsible menus, use 44px touch targets with spacing, place frequent controls in thumb-friendly lower zones, and test on real phones.
- **What it lacks:** The Map Library article is practical secondary guidance, not a formal standard; it does not cover the specific CoreScope DOM or Colorado Mesh top-bar constraints.
- **What we can learn:** On portrait phones, the top bar should collapse aggressively: brand + one sound button/state + analyzer/menu action, with volume and mode details behind a compact popover/sheet. Do not try to fit desktop select+slider+status+focus+analyzer+site controls in one row at 320–420px.
- **License:** N/A
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://www.maplibrary.org/10067/7-best-practices-for-responsive-map-design/
- **Checked:** 2026-05-15

### ITEM-prior-art-14: Mobile viewport and safe-area platform patterns

- **URL:** https://web.dev/blog/viewport-units
- **What it does well:** Modern viewport guidance explains why `100vh` breaks on mobile browser chrome and recommends `svh`, `lvh`, and `dvh` depending on whether the UI should fit the small viewport, large viewport, or dynamic viewport. MDN documents `env(safe-area-inset-*)` for notches, rounded corners, toolbars, and home indicators.
- **What it lacks:** It is CSS platform guidance, not a polished visual design. It must be applied carefully around CoreScope’s resize handlers and Leaflet map invalidation behavior.
- **What we can learn:** Use `100dvh`/`100svh` and `env(safe-area-inset-*)` for full-screen/minimal/focus modes, and compute top-bar height as visual height plus safe-area padding. Move map controls/panels away from the top bar and bottom home indicator; call/trigger Leaflet resize handling when actual map dimensions change.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** WebFetch — https://web.dev/blog/viewport-units; https://developer.mozilla.org/en-US/docs/Web/CSS/env; https://leafletjs.com/reference
- **Checked:** 2026-05-15

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-prior-art-1 | HIGH | WebFetch | https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0195948 |
| ITEM-prior-art-2 | HIGH | Local codebase | /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio.js; /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/public/audio-v1-constellation.js; /Users/cjvana/Documents/GitHub/denvermc-org/vendor/CoreScope/AUDIO-PLAN.md |
| ITEM-prior-art-3 | HIGH | Local codebase | /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-shell.js |
| ITEM-prior-art-4 | HIGH | WebFetch | https://tonejs.github.io/; https://github.com/Tonejs/Tone.js/wiki/Performance |
| ITEM-prior-art-5 | HIGH | WebFetch | https://github.com/goldfire/howler.js/ |
| ITEM-prior-art-6 | HIGH | WebFetch | https://twotone.io/; https://github.com/sonifydata/twotone |
| ITEM-prior-art-7 | MEDIUM | WebFetch/WebSearch | https://github.com/see-mike-out/erie-web; https://arxiv.org/abs/2402.00156 |
| ITEM-prior-art-8 | MEDIUM | WebFetch | https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c |
| ITEM-prior-art-9 | MEDIUM | WebFetch | https://lclarkmaps.github.io/ |
| ITEM-prior-art-10 | MEDIUM | WebFetch/WebSearch | https://github.com/bbbenji/meshmap-map; https://github.com/zenitraM/malla; https://github.com/ajvpot/meshexplorer; https://github.com/meshtastic/web |
| ITEM-prior-art-11 | HIGH | WebFetch | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay |
| ITEM-prior-art-12 | HIGH | WebFetch | https://developer.mozilla.org/docs/Web/API/Web_Audio_API/Using_AudioWorklet; https://www.w3.org/TR/2021/REC-webaudio-20210617/#AudioBufferSourceNode |
| ITEM-prior-art-13 | MEDIUM | WebFetch | https://www.maplibrary.org/10067/7-best-practices-for-responsive-map-design/ |
| ITEM-prior-art-14 | HIGH | WebFetch | https://web.dev/blog/viewport-units; https://developer.mozilla.org/en-US/docs/Web/CSS/env; https://leafletjs.com/reference |
