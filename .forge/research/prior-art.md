# Prior Art Research: CoreScope Map Sound Modes

Checked: 2026-05-14

Project context: brownfield browser feature layered onto the existing CoreScope live map. The best prior art points away from raw packet capture and toward a small client-side sonification engine fed by the existing CoreScope packet/message/node event stream, with opt-in audio state persisted in `localStorage` and no copyrighted sample assets.

### ITEM-prior-art-1: SoNSTAR network-traffic sonification

- **URL:** https://paulvickers.github.io/SoNSTAR/
- **What it does well:** Turns TCP/IP traffic flows and packet-header flag combinations into a real-time soundscape for cyber situational awareness. It emphasizes event sequence, rhythm/timing, and loudness as useful operator cues rather than trying to make every packet literally audible.
- **What it lacks:** It is packet-capture oriented, not browser/Web Audio based. The GitHub project uses Python 2.7 and Max/MSP, has no clear active-maintenance signal, and does not map directly to MeshCore/CoreScope domain events.
- **What we can learn:** Treat CoreScope packet/message activity as semantically grouped events, not as a raw stream to beep for every packet. Map event class, urgency, and recency to distinct sounds; throttle density so operators can learn a normal soundscape and notice deviations.
- **License:** Not clearly stated on the project page/repository.
- **Confidence:** HIGH
- **Source:** WebFetch — https://paulvickers.github.io/SoNSTAR/ and https://github.com/nuson/SoNSTAR
- **Checked:** 2026-05-14

### ITEM-prior-art-2: Network-Sonification desktop packet visualizer

- **URL:** https://github.com/dmeldrum6/Network-Sonification
- **What it does well:** Provides a simple, understandable sonification model: packet size influences pitch/loudness, protocol influences waveform/timbre, and visual particles reinforce the audio mapping. It also includes useful UX precedents such as muted startup, anti-clipping, overlapping-tone handling, and local-only processing.
- **What it lacks:** It is a Windows WPF desktop app using NAudio, SharpPcap, and PacketDotNet; it depends on packet capture privileges and is not suitable as browser code. Its mapping is protocol-centric, while the CoreScope feature needs MeshCore event-centric mappings.
- **What we can learn:** Native+ should borrow the simple dimension mapping: event magnitude/frequency to volume or brightness, event type to timbre, and priority/emergency to clearly separated accents. Avoid complex mappings that require a legend to understand.
- **License:** MIT shown, with an additional unknown license file noted by GitHub metadata.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://github.com/dmeldrum6/Network-Sonification
- **Checked:** 2026-05-14

### ITEM-prior-art-3: SonNet network-data sonification interface

- **URL:** https://sonnet.cs.princeton.edu/
- **What it does well:** Wraps low-level network sniffing and connection-state analysis behind a composer-friendly ChucK API, letting users focus on mapping live network behavior to sound.
- **What it lacks:** It is a ChucK/free-software research tool, not a browser library. The page does not give enough detail on exact network fields, supported platforms, license, or production use.
- **What we can learn:** Build a small sound adapter layer between CoreScope events and instruments. The UI should not let every mode inspect raw DOM state directly; instead normalize incoming activity into stable event objects like `message`, `nodeSeen`, `packetBurst`, `priority`, and `emergency`.
- **License:** Page says free software; exact license not found.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://sonnet.cs.princeton.edu/
- **Checked:** 2026-05-14

### ITEM-prior-art-4: SIREN Web Audio sonification workstation

- **URL:** https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c
- **What it does well:** Demonstrates a Web Audio-based sonification architecture where data matrices become tracks/channels and data can modulate sound parameters. It validates using browser-native audio for exploratory sonification.
- **What it lacks:** It is a general workstation, not a drop-in map sound library or network-monitoring implementation. The publication license is CC BY-NC 4.0, which is not appropriate to copy into a permissive/commercial-safe asset pipeline.
- **What we can learn:** Structure sound modes as channels with shared rate limiting, gain staging, and scheduling rather than scattered `playSound()` calls. This matters for Native+, Generative Key, and Orchestral Ensemble sharing the same event stream.
- **License:** Publication CC BY-NC 4.0; code license not verified from the fetched page.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c
- **Checked:** 2026-05-14

### ITEM-prior-art-5: Tone.js for Generative Key and scheduled Web Audio synthesis

- **URL:** https://tonejs.github.io/
- **What it does well:** Provides a mature Web Audio framework for interactive music: synths, `PolySynth`, samplers, effects, routing, automation, and a global Transport for synchronized scheduling. It is directly aligned with browser melodies, arpeggios, chords, tasteful effects, and sample playback.
- **What it lacks:** It is not map- or network-specific. Audio still must be started from a user gesture, and sample loading is asynchronous. The visible GitHub latest release metadata surfaced an old release, so implementation should verify npm package state during build planning.
- **What we can learn:** Use Tone.js if adding an npm dependency is acceptable. It is the strongest fit for Generative Key and can also support Native+ mixing and future sample-backed Orchestral Ensemble. Keep Sound Off default and only call audio start/unmute from the selector gesture.
- **License:** MIT.
- **Confidence:** HIGH
- **Source:** WebFetch — https://tonejs.github.io/ and https://github.com/Tonejs/Tone.js
- **Checked:** 2026-05-14

### ITEM-prior-art-6: Scribbletune pattern generation

- **URL:** https://scribbletune.com/
- **What it does well:** Provides a JavaScript music-pattern language with scale-based note generation, chord/arpeggio helpers, pattern strings, MIDI generation, and browser playback when paired with Tone.js.
- **What it lacks:** It is composition-focused, not a sonification engine. The fetched page did not expose a license, and adding it would likely be excessive for a small map feature.
- **What we can learn:** Borrow the concept, not necessarily the dependency: represent Generative Key patterns as short deterministic note-pattern strings and scale degrees. Implement a small internal pattern mapper first; only add Scribbletune if composition requirements become more complex.
- **License:** Not visible from fetched page.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://scribbletune.com/
- **Checked:** 2026-05-14

### ITEM-prior-art-7: WebAudioFont browser instrument catalog

- **URL:** https://surikov.github.io/webaudiofont/
- **What it does well:** Offers browser Web Audio sample/wavetable playback with MIDI-style notes, chords, strums, pitch bends, scheduling, EQ, reverb, and dynamic instrument loading. Its catalog includes many orchestral-relevant GM instruments such as harp, pizzicato strings, timpani, celesta, brass, and woodwinds.
- **What it lacks:** Licensing is not simply CC0; the site points to separate project and underlying soundfont licenses such as GeneralUserGS and FluidR3. Loaded instruments stay cached in memory, and the sound quality is GM/wavetable style rather than a bespoke orchestral palette.
- **What we can learn:** WebAudioFont is a useful reference for dynamic instrument loading and GM-style mapping, but do not use its sounds unless each preset's license is audited. For this project, prefer CC0 assets from VCSL/FreePats or procedural synths.
- **License:** Mixed/needs per-soundfont verification.
- **Confidence:** HIGH
- **Source:** WebFetch — https://surikov.github.io/webaudiofont/
- **Checked:** 2026-05-14

### ITEM-prior-art-8: webaudio-tinysynth sample-free GM synth

- **URL:** https://github.com/g200kg/webaudio-tinysynth
- **What it does well:** Implements a browser WebAudio synthesizer and MIDI player with General MIDI-style program changes, note on/off, pitch bend, volume, pan, sustain, rhythm channel, sequencer support, no dependencies, and no PCM samples.
- **What it lacks:** It is synthetic and GM-like, not realistic orchestral audio. Higher quality and polyphony can cost CPU, and some advanced MIDI expression features are unsupported.
- **What we can learn:** If avoiding sample licensing and bundle size is more important than orchestral realism, webaudio-tinysynth is a viable fallback idea: use procedural GM-ish timbres for Orchestral Ensemble until CC0 samples are added. Prefer Tone.js for richer generative control unless dependency budget rejects it.
- **License:** Apache-2.0.
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/g200kg/webaudio-tinysynth
- **Checked:** 2026-05-14

### ITEM-prior-art-9: tonejs-instruments quick-loader

- **URL:** https://github.com/nbrosowsky/tonejs-instruments
- **What it does well:** Provides a convenient `SampleLibrary.load()` wrapper for Tone.js and a broad set of acoustic/orchestral instruments including harp, flute, clarinet, bassoon, French horn, trumpet, trombone, tuba, violin, cello, contrabass, piano, and xylophone. It supports MP3 with OGG fallback and minified sample sets.
- **What it lacks:** The samples are listed as CC-BY 3.0, not CC0. Attribution obligations and source-tracking make it less aligned with the project's legally safe/CC0 preference. Loading all instruments may be slow, and instruments are not connected to output by default.
- **What we can learn:** Reuse the loading pattern, not the assets by default: per-instrument manifests, lazy loading, MP3/OGG variants, and minified sample maps. Use CC0 samples instead.
- **License:** Code MIT; samples CC-BY 3.0 per repository text.
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/nbrosowsky/tonejs-instruments
- **Checked:** 2026-05-14

### ITEM-prior-art-10: Versilian Community Sample Library (VCSL)

- **URL:** https://versilian-studios.com/vcsl/
- **What it does well:** Provides a large CC0/public-domain sample library with over 4,000 samples, SFZ mappings, WAV sources, and explicit commercial reuse friendliness. Relevant instruments include concert harp, folk harp, timpani, bells/chimes, glockenspiel, vibraphone, recorders, saxophone-family instruments, whistles, and plucked/bowed psaltery.
- **What it lacks:** It is about 5 GB in total and raw instruments can be 20-75 MB, so it is inappropriate to bundle wholesale. The page did not show conventional orchestral brass section coverage, and celeste/pizzicato strings were not clearly present in the official page results.
- **What we can learn:** Use VCSL as the legally safe source-of-truth for any bundled Orchestral Ensemble samples, but curate a very small subset and lazy-load it. Convert selected WAV/SFZ material into compact browser formats and ship attribution/license metadata even though CC0 does not require attribution.
- **License:** CC0-1.0/Public Domain dedication.
- **Confidence:** HIGH
- **Source:** WebFetch — https://versilian-studios.com/vcsl/ and https://github.com/sgossner/VCSL
- **Checked:** 2026-05-14

### ITEM-prior-art-11: FreePats CC0 harp and orchestral percussion banks

- **URL:** https://freepats.zenvoid.org/OrchestralStrings/harp.html
- **What it does well:** Provides compact CC0 Concert Harp sound banks derived from VCSL, with SFZ+FLAC, SFZ+WAV, and SF2 variants. The full harp bank is small enough for web consideration (single-digit MiB sizes listed), and FreePats also surfaces CC0 orchestral percussion/timpani options in search results.
- **What it lacks:** The harp page states only two velocity layers and does not describe round-robin, detailed articulations, or browser-ready MP3/OGG packaging. It covers individual instruments, not the full requested ensemble.
- **What we can learn:** For the first Orchestral Ensemble implementation, start with one or two compact CC0 FreePats/VCSL-derived instruments, such as harp and timpani, and design the loader so celeste, pizzicato strings, woodwinds, and brass can be added later without touching mode logic.
- **License:** CC0-1.0.
- **Confidence:** HIGH
- **Source:** WebFetch — https://freepats.zenvoid.org/OrchestralStrings/harp.html; WebSearch — https://freepats.zenvoid.org/Percussion/orchestral-percussion.html
- **Checked:** 2026-05-14

### ITEM-prior-art-12: Signature Sounds Orchestral CC0 sample pack

- **URL:** https://signaturesounds.org/store/p/orchestral-cc0
- **What it does well:** Offers a free CC0-positioned orchestral WAV pack with 23 orchestral score loops and individual instrument loops covering strings, brass, woodwinds, percussion, and full score-style material. The 87 MB zipped size is manageable for offline asset review.
- **What it lacks:** It appears loop/motif-based rather than a playable multi-sampled instrument library. The page does not expose detailed metadata such as tempo, key, sample rate, bit depth, stems, velocity layers, or browser-ready formats.
- **What we can learn:** Consider it only for optional future ambience or one-shot accents after license verification. Do not make it the foundation for event-responsive Orchestral Ensemble, where per-event note triggering from CC0 instrument samples is a better fit.
- **License:** Claimed Royalty-Free CC0 on product page.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://signaturesounds.org/store/p/orchestral-cc0
- **Checked:** 2026-05-14

### ITEM-prior-art-13: ZzFX tiny procedural sound effects

- **URL:** https://github.com/KilledByAPixel/ZzFX
- **What it does well:** Provides a tiny JavaScript/Web Audio procedural sound-effect generator with no audio assets, no dependencies, one-line sounds, and a permissive MIT license. It is well-suited to short pings, zaps, UI cues, alerts, and game-like effects without downloading samples.
- **What it lacks:** It is not map-specific, does not expose an obvious laser preset in the fetched README, and is intentionally synthetic rather than cinematic. Music requires ZzFXM or another sequencer.
- **What we can learn:** Space Blaster should be procedural, not sampled. ZzFX is the safest prior-art model for license-safe sci-fi zaps: generate short oscillator/noise/filter/envelope sounds and randomize parameters slightly per event.
- **License:** MIT.
- **Confidence:** HIGH
- **Source:** WebFetch — https://github.com/KilledByAPixel/ZzFX
- **Checked:** 2026-05-14

### ITEM-prior-art-14: jsfxr / sfxr laser sound designer

- **URL:** https://sfxr.me/
- **What it does well:** Browser-based 8-bit sound generator with explicit `Laser/shoot` preset generation, mutation, waveform/envelope/frequency/vibrato/arpeggiation/duty-cycle/retrigger/flanger/filter controls, WAV/JSON export, permalinks, code copy, and unrestricted commercial use via Unlicense-linked terms.
- **What it lacks:** Its aesthetic is retro 8-bit, not polished cinematic sci-fi. Free exports shown are WAV/JSON only, and it is a design tool/library rather than a full mixing/scheduling framework.
- **What we can learn:** Use jsfxr/sfxr as a parameter-design workbench for Space Blaster. Generate a few laser/zap parameter recipes, then implement equivalent procedural Web Audio/ZzFX-style synthesis in the overlay so no Star Wars or third-party samples are shipped.
- **License:** Unlicense for jsfxr repository/page indications.
- **Confidence:** HIGH
- **Source:** WebFetch — https://sfxr.me/ and https://github.com/chr15m/jsfxr
- **Checked:** 2026-05-14

### ITEM-prior-art-15: howler.js for sample playback and sprites

- **URL:** https://howlerjs.com/
- **What it does well:** Provides a small modern web audio playback abstraction with audio sprites, fades, looping, playback rate, format fallback, auto caching, Web Audio default with HTML5 Audio fallback, and spatial/stereo features. It is strong for UI/game sample playback.
- **What it lacks:** It is not a synth, sequencer, or generative music library. It does not solve musical key/chord/arpeggio logic and overlaps with Tone.js if Tone is already selected.
- **What we can learn:** If Native+ uses pre-rendered one-shot UI samples, audio sprites are the right pattern. However, do not add howler.js if Tone.js is already introduced; use one audio engine to avoid duplicate lifecycle, unlock, and mixing code.
- **License:** Not visible from fetched page; project license should be verified before adoption.
- **Confidence:** MEDIUM
- **Source:** WebFetch — https://howlerjs.com/
- **Checked:** 2026-05-14

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-prior-art-1 | HIGH | WebFetch | https://paulvickers.github.io/SoNSTAR/; https://github.com/nuson/SoNSTAR |
| ITEM-prior-art-2 | MEDIUM | WebFetch | https://github.com/dmeldrum6/Network-Sonification |
| ITEM-prior-art-3 | MEDIUM | WebFetch | https://sonnet.cs.princeton.edu/ |
| ITEM-prior-art-4 | MEDIUM | WebFetch | https://repository.gatech.edu/entities/publication/7d3d302f-2818-455c-8df5-d28762e2af1c |
| ITEM-prior-art-5 | HIGH | WebFetch | https://tonejs.github.io/; https://github.com/Tonejs/Tone.js |
| ITEM-prior-art-6 | MEDIUM | WebFetch | https://scribbletune.com/ |
| ITEM-prior-art-7 | HIGH | WebFetch | https://surikov.github.io/webaudiofont/ |
| ITEM-prior-art-8 | HIGH | WebFetch | https://github.com/g200kg/webaudio-tinysynth |
| ITEM-prior-art-9 | HIGH | WebFetch | https://github.com/nbrosowsky/tonejs-instruments |
| ITEM-prior-art-10 | HIGH | WebFetch | https://versilian-studios.com/vcsl/; https://github.com/sgossner/VCSL |
| ITEM-prior-art-11 | HIGH | WebFetch/WebSearch | https://freepats.zenvoid.org/OrchestralStrings/harp.html; https://freepats.zenvoid.org/Percussion/orchestral-percussion.html |
| ITEM-prior-art-12 | MEDIUM | WebFetch | https://signaturesounds.org/store/p/orchestral-cc0 |
| ITEM-prior-art-13 | HIGH | WebFetch | https://github.com/KilledByAPixel/ZzFX |
| ITEM-prior-art-14 | HIGH | WebFetch | https://sfxr.me/; https://github.com/chr15m/jsfxr |
| ITEM-prior-art-15 | MEDIUM | WebFetch | https://howlerjs.com/ |
