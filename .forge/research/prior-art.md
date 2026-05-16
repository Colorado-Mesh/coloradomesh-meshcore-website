# Prior Art Research: Musical/Event-Accent Map Audio

Project context: brownfield improvement of Colorado Mesh browser-local CoreScope overlay audio. Goal is richer, less repetitive, pleasant map event accents, especially Orchestral Ensemble and Space Blaster, without using message contents or creating unbounded audio nodes/samples.

### ITEM-prior-art-1: Current Colorado Mesh CoreScope sound overlay

- **URL:** /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js
- **What it does well:** Already has the right architectural primitives for this project: Web Audio API only, user-unlocked browser-local audio, event normalization without message-content sonification, queue scheduling, token-bucket throttling, dedupe, max active voices, cleanup timers, density bed via AudioWorklet, and a sample-manifest path for orchestral mode.
- **What it lacks:** Orchestral manifest currently contains only four samples and roles map most message events to two instruments, so repeated traffic can feel like the same cues. Space Blaster is purely procedural saw/square/noise with narrow pitch sets and high-Q filtered transients, which can become harsh and fatiguing. The implementation has no sample-variant velocity layers, no broader orchestral role palette, and limited timbral round-robin beyond choosing among already-loaded role samples.
- **What we can learn:** Preserve the existing event pipeline, queue, cooldowns, voice caps, density worklet, local-only privacy model, and manifest loader. Improve perceived quality by expanding the manifest and role mappings, adding controlled randomization/round-robin, making Space Blaster shorter/cleaner/less abrasive, and using existing diagnostics to prove variety rather than replacing the whole engine.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** Codebase Read — /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json
- **Checked:** 2026-05-15

### ITEM-prior-art-2: Tone.js browser music scheduling and instruments

- **URL:** https://tonejs.github.io/
- **What it does well:** Tone.js is mature prior art for interactive browser music: accurate AudioContext-time scheduling, a global transport, loops/parts, musical time values, synths, polyphony, sample players, samplers, effects, and routing. Its Sampler model directly addresses the current orchestral gap: map note names/ranges to samples and pitch-shift nearby notes instead of manually picking one or two buffers.
- **What it lacks:** Pulling Tone.js into this static CoreScope overlay would add a substantial dependency and a new abstraction layer around code that already implements the necessary unlock, scheduling, sample loading, and cleanup behavior. The GitHub release visible from fetch was old (14.7.39 in 2020), even though the project remains prominent.
- **What we can learn:** Do not add Tone.js for this brownfield fix. Borrow its concepts: schedule against AudioContext time, separate transport/queue from synthesis, use sample maps by note/role, use polyphony caps, and keep repeatable musical timing. Implement those ideas in the existing lightweight overlay.
- **License:** MIT
- **Confidence:** HIGH
- **Source:** Official docs/repo — https://tonejs.github.io/; https://github.com/tonejs/tone.js/
- **Checked:** 2026-05-15

### ITEM-prior-art-3: MDN Web Audio API and webaudio-examples

- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **What it does well:** MDN documents Web Audio as the browser-standard foundation for local synthesis, sample playback, filtering, compression, routing, spatialization, analysis, and precise low-latency timing. It also identifies AudioWorklet as the modern off-main-thread custom processing path and ScriptProcessorNode as obsolete/deprecated. The MDN examples repository includes sequencing, AudioParam automation, AudioWorklet, compression, panning, spatialization, and buffer-source examples.
- **What it lacks:** MDN is API prior art, not a complete musical design system. It does not decide how packet events should map to melody, timbre, hierarchy, or user fatigue constraints.
- **What we can learn:** Stay with Web Audio API and AudioWorklet. Use the platform directly for small procedural and sample cues, avoid deprecated ScriptProcessorNode, keep AudioParam ramps/envelopes for click-free changes, and keep output compression/limiting for safe rapid accents.
- **License:** MDN content/examples vary; mdn/webaudio-examples visible license is CC0-1.0
- **Confidence:** HIGH
- **Source:** Official docs/repo — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API; https://github.com/mdn/webaudio-examples
- **Checked:** 2026-05-15

### ITEM-prior-art-4: VSCO 2 Community Edition orchestral sample library

- **URL:** https://versilian-studios.com/vsco-community/
- **What it does well:** VSCO 2 Community Edition is CC0/public-domain orchestral sample prior art with raw WAV and SFZ material across strings, woodwinds, brass, percussion, keys, and miscellany. It is a strong fit for adding orchestral color without license friction. The existing repo already uses VSCO violin pizzicato and timpani, so the asset provenance path is established.
- **What it lacks:** The full library is large for a website overlay; SFZ mappings are not directly usable without an SFZ sampler; individual samples may need trimming, normalization, conversion, and curation. Blindly bundling many samples would hurt static asset size and decode time.
- **What we can learn:** Expand orchestral mode with a small curated VSCO subset, not the whole library: 2–4 samples per event role, multiple families (pizz strings, harp/celesta-like plucks, woodwinds, light brass, percussion), and round-robin/velocity variants where available. Keep files short, compressed or carefully selected, and manifest-driven.
- **License:** CC0-1.0 / public domain
- **Confidence:** HIGH
- **Source:** Official site/repo — https://versilian-studios.com/vsco-community/; https://github.com/sgossner/VSCO-2-CE
- **Checked:** 2026-05-15

### ITEM-prior-art-5: FreePats orchestral/percussion sample banks

- **URL:** https://freepats.zenvoid.org/Percussion/orchestral-percussion.html
- **What it does well:** FreePats provides CC0-compatible SFZ/FLAC/WAV/SF2 sample banks, including orchestral percussion assembled from Versilian material, with round-robin layers. The current repo already uses FreePats harp and clarinet samples, and the attribution file records source archives and licenses.
- **What it lacks:** FreePats pages are sample banks, not ready-made browser UI instruments. Asset quality, loudness, tail length, and mappings still need curation; some banks may be larger or have more articulations than the overlay needs.
- **What we can learn:** Use FreePats for lightweight color expansion where it has already-cleaned public-domain banks. Especially useful additions: short harp/pluck variants for normal traffic, clarinet/flute/woodwind alternates for message accents, and soft percussion/triangle/timpani variants for priority accents. Prefer round-robin samples over pitch-randomizing the same file endlessly.
- **License:** CC0 / public domain where specified by bank
- **Confidence:** HIGH
- **Source:** Official sample bank and local attribution — https://freepats.zenvoid.org/Percussion/orchestral-percussion.html; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/ATTRIBUTION.md
- **Checked:** 2026-05-15

### ITEM-prior-art-6: Highcharts Maps sonification API

- **URL:** https://api.highcharts.com/highmaps/sonification
- **What it does well:** Highcharts Maps exposes declarative map/chart sonification options such as enablement, duration, master volume, ordering, default instrument/speech options, tracks, context tracks, tooltip/crosshair synchronization, point grouping, and update intervals. It is strong prior art for treating map audio as a structured layer with global defaults and synchronized visual context.
- **What it lacks:** It is part of a commercial charting product; the fetched API page shows top-level options more than implementation guidance. It targets chart/data accessibility and playback rather than this project's live packet stream, custom CoreScope overlay, and event-accent musicality.
- **What we can learn:** Borrow the mental model, not the product: define per-role instrument defaults, separate global context/density bed from event tracks, group/coalesce dense events, and keep audio synchronized with visible map state. Do not replace the existing Leaflet/CoreScope map just to gain Highcharts sonification.
- **License:** Commercial/source-available product; not suitable as a dependency without license review
- **Confidence:** MEDIUM
- **Source:** Official API/product pages — https://api.highcharts.com/highmaps/sonification; https://www.highcharts.com/products/maps/
- **Checked:** 2026-05-15

### ITEM-prior-art-7: TwoTone data-to-music web app

- **URL:** https://twotone.io/
- **What it does well:** TwoTone is a free open-source web app for turning datasets into music without code. It demonstrates that sonification can be made musical and understandable through intentional data-to-sound mapping rather than raw beeps.
- **What it lacks:** It is dataset/composition-oriented, not a real-time map event accent engine. The public page does not show live stream handling, packet-event hierarchy, voice caps, browser unlock/cleanup behavior, or geospatial interaction.
- **What we can learn:** Use a musical mapping mindset: pitch, rhythm, timbre, and density should communicate event class and urgency while staying pleasant. But keep implementation event-driven and local to the existing overlay rather than adopting a dataset-composition workflow.
- **License:** Open source stated on site; exact license not verified from fetched page
- **Confidence:** MEDIUM
- **Source:** Project site — https://twotone.io/
- **Checked:** 2026-05-15

### ITEM-prior-art-8: SIREN aesthetic web sonification workstation

- **URL:** https://arxiv.org/abs/2403.19763
- **What it does well:** SIREN is a web-based general-purpose interface for auditory data display using JavaScript and Web Audio API synthesizers. Its DAW-like framing is valuable: treat data sonification as sound design with modules, controls, and aesthetic quality, not merely accessibility beeps.
- **What it lacks:** The visible paper summary does not establish map-specific behavior, live low-latency stream handling, or high-rate event throttling. It is a workstation/research system, not a small production overlay.
- **What we can learn:** Prioritize aesthetic parameter mapping and reusable synth/sample modules. For Colorado Mesh, that means making each event role a small instrument patch with bounded controls (pitch range, envelope, filter, sample family), and auditioning in-context against realistic map traffic.
- **License:** N/A for paper; implementation license not verified
- **Confidence:** MEDIUM
- **Source:** Research paper — https://arxiv.org/abs/2403.19763
- **Checked:** 2026-05-15

### ITEM-prior-art-9: Erie declarative grammar for web sonification

- **URL:** https://npm.io/package/erie-web
- **What it does well:** Erie/erie-web is a declarative grammar for data sonification in web environments using Web Audio API and Web Speech API. It supports browser/Node usage and sample instruments through configurable base URLs. The grammar approach is useful prior art for separating data mapping from sound rendering.
- **What it lacks:** The package page showed last release as two years ago, unfinished CDN notes, and dependencies such as D3/Arquero/Moment/Vega. It is heavier and broader than needed for this overlay, and speech output is outside this project's musical event-accent scope.
- **What we can learn:** Use a declarative-ish manifest/config layer for roles, sample families, allowed pitch ranges, and event-to-cue mappings. Do not add Erie as a dependency; the current code can gain most of the maintainability by expanding the existing manifest and role tables.
- **License:** MIT
- **Confidence:** MEDIUM
- **Source:** Package page — https://npm.io/package/erie-web
- **Checked:** 2026-05-15

### ITEM-prior-art-10: WebAudioXML Sonification Toolkit

- **URL:** https://hanslindetorp.github.io/SonificationToolkit/
- **What it does well:** This toolkit demonstrates browser-based mapping from tabular data sources to audio parameters, with a workflow of choosing data, audio target, parameter, playback/scrubbing, and range tuning. It supports multiple mappings and external configuration files for data and audio setup.
- **What it lacks:** It is aimed at dataset playback/scrubbing, not live packet accent triggering. The page describes Firefox/Chrome support and configurable audio XML, but not production constraints like burst coalescing, voice cleanup, user gesture unlock, or event priority.
- **What we can learn:** Keep mappings inspectable and tunable. For this project, expose musical choices in simple data structures (role sample IDs, MIDI ranges, envelope defaults, pitch offsets, cooldowns) rather than burying every design decision in procedural branches.
- **License:** Not verified from fetched page
- **Confidence:** MEDIUM
- **Source:** Project site — https://hanslindetorp.github.io/SonificationToolkit/
- **Checked:** 2026-05-15

### ITEM-prior-art-11: iSonic interactive map sonification

- **URL:** https://www.cs.umd.edu/projects/hcil/audiomap/
- **What it does well:** iSonic is directly map-sonification prior art. It combines nonspeech audio with speech/detail, supports overview-to-detail map exploration, and uses pitch, timbre, MIDI, and optional 3-D audio to make geographic data navigable. It shows that map audio should distinguish overview density/patterns from focused event details.
- **What it lacks:** It is older, Java/Java Web Start based, tied to Windows speech components for some demos, and not a modern browser Web Audio implementation. It solves accessibility exploration of choropleth data rather than live packet accents.
- **What we can learn:** Separate ambient overview from event detail. The existing density bed should remain low and contextual; accents should be sparse, meaningful, and optionally differentiated by spatial/pan or register so users can perceive map activity without an undifferentiated stream of notes.
- **License:** Not specified on fetched page
- **Confidence:** MEDIUM
- **Source:** Research/project page — https://www.cs.umd.edu/projects/hcil/audiomap/
- **Checked:** 2026-05-15

### ITEM-prior-art-12: Modern game UI and sci-fi interface sound design guidance

- **URL:** https://sfxengine.com/blog/best-practices-for-game-ui-sounds
- **What it does well:** Recent game/UI sound guidance consistently emphasizes hierarchy, short microinteraction cues, frequency separation, restrained adaptive variation, intentional silence, controlled tails, and clarity over loudness. Sci-fi UI design guidance specifically recommends crisp transients, light digital texture, clean synthetic tones, functional mapping, subtle pitch/timbre/volume variation, and avoiding noisy/distracting or overbuilt sounds.
- **What it lacks:** These are design guides, not drop-in code or open-source assets. Some guidance is broad game/UI advice and must be adapted to packet accents that can arrive rapidly.
- **What we can learn:** Redesign Space Blaster as a tasteful sci-fi UI accent system, not a loud weapon effect: 80–250 ms primary cues, soft attacks where needed to avoid clicks, controlled filter sweeps, subtle FM/ring/noise layers at low gain, short tails, limited high-Q harshness, role-specific vocabulary, and variation that preserves meaning. Priority events can be brighter/stronger, but normal traffic should be quiet and pleasant.
- **License:** N/A
- **Confidence:** HIGH
- **Source:** Design guides — https://sfxengine.com/blog/best-practices-for-game-ui-sounds; https://ocularsounds.com/en-dk/blogs/sound-design-tips-tricks/what-makes-interface-audio-feel-modern; https://www.asoundeffect.com/sci-fi-ui-sound-effects/
- **Checked:** 2026-05-15

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-prior-art-1 | HIGH | Codebase Read | /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/denvermc-sound.js; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/manifest.json |
| ITEM-prior-art-2 | HIGH | Official docs/repo | https://tonejs.github.io/; https://github.com/tonejs/tone.js/ |
| ITEM-prior-art-3 | HIGH | Official docs/repo | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API; https://github.com/mdn/webaudio-examples |
| ITEM-prior-art-4 | HIGH | Official site/repo | https://versilian-studios.com/vsco-community/; https://github.com/sgossner/VSCO-2-CE |
| ITEM-prior-art-5 | HIGH | Official sample bank/codebase | https://freepats.zenvoid.org/Percussion/orchestral-percussion.html; /Users/cjvana/Documents/GitHub/denvermc-org/corescope-overlay/sound/orchestral/ATTRIBUTION.md |
| ITEM-prior-art-6 | MEDIUM | Official API/product pages | https://api.highcharts.com/highmaps/sonification; https://www.highcharts.com/products/maps/ |
| ITEM-prior-art-7 | MEDIUM | Project site | https://twotone.io/ |
| ITEM-prior-art-8 | MEDIUM | Research paper | https://arxiv.org/abs/2403.19763 |
| ITEM-prior-art-9 | MEDIUM | Package page | https://npm.io/package/erie-web |
| ITEM-prior-art-10 | MEDIUM | Project site | https://hanslindetorp.github.io/SonificationToolkit/ |
| ITEM-prior-art-11 | MEDIUM | Research/project page | https://www.cs.umd.edu/projects/hcil/audiomap/ |
| ITEM-prior-art-12 | HIGH | Design guides | https://sfxengine.com/blog/best-practices-for-game-ui-sounds; https://ocularsounds.com/en-dk/blogs/sound-design-tips-tricks/what-makes-interface-audio-feel-modern; https://www.asoundeffect.com/sci-fi-ui-sound-effects/ |
