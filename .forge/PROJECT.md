# Forge Project

## Description
Fix the Colorado Mesh CoreScope map sound and mobile/portrait overlay issues. The current sound modes sound bad, do not align musically with map activity, and busy map traffic makes the sound thin out or stop, which is the opposite of the desired behavior. Rework the sound engine so high traffic feels fuller and denser while staying browser-local, opt-in, metadata-only, and safe under load. Also fix the map overlay, top bar, sound controls, fullscreen/minimal UI so it looks polished on mobile/portrait screens.

## Constraints
- Do not edit files under `vendor/CoreScope` directly.
- Use the existing CoreScope overlay/patch layer where possible.
- Preserve the Docker/single-container setup.
- Sound must remain browser-local, opt-in, and unlocked only by explicit user gesture.
- Sound must use metadata only and never message text contents.
- High traffic should feel fuller/denser, not quieter or stopped.
- Keep audio safe under load: bounded scheduling, no runaway AudioNodes, no unbounded sample playback.
- Use Colorado Mesh branding in user-facing labels.
- Update site-wide logo usage to the new Colorado Mesh icon source provided by the user: https://github.com/Colorado-Mesh/icons/blob/main/color/mesh-color.png.
- Do not print, commit, or document secrets.
- This session must not directly perform visual/UI implementation in Codex; mobile/portrait visual implementation should be delegated to Opus UI if file edits are required for visual polish.

## Context
- Greenfield/Brownfield: Brownfield fix to existing Colorado MeshCore site and CoreScope overlay.
- Platform: Browser-based map UI served from Docker image with CoreScope static assets patched by overlay during build.
- Deliverable type: hybrid
- Date: 2026-05-15

## Q&A Decisions
1. Main sound feel: ambient orchestral. The polished sound-on experience should be a fuller musical bed that grows with traffic, with soft motifs and restrained accents.
2. Mode scope: keep all existing user-selectable modes: Sound Off, Native+, Generative Key, Orchestral Ensemble, and Space Blaster, but retune them around the new density engine.
3. Mobile sound controls: use a bottom sheet on portrait/mobile screens. The top bar should show compact sound/status access, with mode and volume in the sheet.
4. Logo asset: vendor the new Colorado Mesh logo locally from the provided GitHub source and reference it same-origin across the site.
5. Replay/historical traffic: replay packets may make sound too, but should be treated so users can tell the behavior is playback/replay rather than only current live activity.
6. Priority/emergency accents: use metadata only, including existing packet type/channel/priority metadata; never message text or raw payload.
7. Mobile acceptance targets: 320px through 430px portrait widths must pass, including common 320, 360, 390/393, and 430 CSS px screens.
8. Final acceptance: include a 5-10 minute live or synthetic busy-traffic listening/browser check plus mobile visual verification in addition to automated tests.
9. Sound texture: use a procedural Web Audio density bed as the always-on foundation; orchestral samples may remain as bounded accents.
10. Accessibility announcements: keep sound announcements quiet/minimal; do not add noisy counter or volume announcements beyond necessary state labels.
11. Audio architecture: introduce AudioWorklet in this pass for continuous density generation.
12. Overlay file structure: let tests decide; keep one file unless splitting is necessary for Worklet delivery/injection order.
