# Forge Project

## Description
Add map sound modes to the embedded CoreScope live map using the existing CoreScope packet/audio/visualization event stream where possible. The selector should support Sound Off, Native+, Generative Key, Orchestral Ensemble, and Space Blaster. Sound Off is the default. The selected mode should persist locally for each user.

Native+ should improve the existing built-in/CoreScope-style packet audio with polished packet/message sounds, rate limiting, tasteful mixing, pitch variation, and per-event sound design.

Generative Key should turn packet/message activity into melodies, arpeggios, and chords in one key using browser synth/Web Audio.

Orchestral Ensemble should lazy-load a small legally safe/CC0 sample set if bundled, or otherwise be structured so samples can be added safely later. Desired mapping: messages as harp/celeste/woodwinds, nodes/dots as pizzicato strings, priority/emergency as brass/timpani accents.

Space Blaster should be procedural/license-safe sci-fi laser/zap sounds, not actual Star Wars samples.

## Constraints
- Do not edit files under `vendor/CoreScope` directly.
- Use the existing local CoreScope overlay/patch layer where possible.
- Preserve the Docker/single-container setup.
- Do not include copyrighted Star Wars samples or Andrew Huang Collisions assets without permission.
- Default sound state must be off because browser autoplay restrictions require a user gesture and because sound should be opt-in.
- Save selected mode locally, not server-side.
- The map shell logo is currently wrong; use the same main-site logo asset/branding rather than the alternate logo currently shown on the map.
- The favicon should also be updated to use the correct logo.

## Context
- Greenfield/Brownfield: Brownfield feature added to existing Colorado MeshCore site and CoreScope overlay.
- Platform: Browser-based map UI served from Docker image; CoreScope static assets are patched by overlay during build.
- Deliverable type: code
- Date: 2026-05-14

## Q&A Decisions
1. Returning users: show their previously selected non-off mode visually, but keep playback muted/locked until an explicit click each session.
2. Selector placement: top bar only.
3. CoreScope old audio control: hide/disable it; user-facing naming must say Colorado Mesh, not DenverMC.
4. Logo behavior: reuse the exact main-site header logo behavior.
5. Priority/emergency accents: use channel names, especially emergency channel names, plus available priority metadata if present.
6. Orchestral Ensemble: include real samples in the first implementation; research and find legally usable assets if needed.
7. Sample licenses: CC0 and CC-BY are acceptable; include attribution/provenance where required.
8. Generative Key feel: musical motifs with short melodies/arpeggios/chords, not constant background soundtrack.
9. Sample size budget: large pack is acceptable if needed for quality.
10. Preview/Test button: no preview button in the first release.
11. Volume: include a simple local volume slider.
12. Hidden tab/non-live route behavior: keep playing if the user enabled sound.
13. Privacy: metadata only; never use message text contents for sound design.
14. Dependencies: adding browser audio dependencies is acceptable if it improves quality.
15. Spatial audio: no panning/spatial audio; keep output centered.
16. Mobile/high-traffic performance: drop/merge low-priority sounds under load.

## Refined Understanding
Build an opt-in Colorado Mesh sound layer for the CoreScope live map using the existing CoreScope packet sonification call as the event source. It should own sound mode UI/state, suppress old CoreScope audio controls, persist selected mode and volume locally, require a user gesture to start playback each session, and provide four active sound modes: Native+, Generative Key, Orchestral Ensemble with real legally usable samples, and procedural Space Blaster. The map shell and favicon should use the correct main-site Colorado Mesh logo assets.
