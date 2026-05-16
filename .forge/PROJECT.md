# Forge Project

## Description
Fix the live map audio so all map sounds are high quality and musical. Orchestral mode currently feels like it only uses about two samples; it should feel richer and more like a symphony. Space Blaster currently sounds bad and needs a redesign. Preserve existing behavior where appropriate, but improve the sound engine/assets/presets so map audio is richer, less repetitive, pleasant, and event-accent focused.

## Constraints
- Brownfield change to the existing Colorado Mesh site/CoreScope overlay.
- User-facing labels and branding must say Colorado Mesh, not DenverMC.
- Focus on sound quality, musicality, variation, and event accents rather than UI redesign.
- Preserve existing behavior where appropriate.
- Keep map audio browser-local and user-triggered; do not use message contents for sound generation.
- Avoid unbounded audio node/sample creation under busy map traffic.

## Context
- Greenfield/Brownfield: Brownfield
- Platform: Browser-based live map/CoreScope overlay in the existing repository and Docker-served static assets
- Deliverable type: code
- Primary sound target: Event accents
- Date: 2026-05-16

## Q&A Decisions
1. Audible event scope: most traffic should be audible, not only rare events; routine traffic may produce accents as long as the engine stays bounded.
2. Orchestral feel: Orchestral Ensemble should go big cinematic rather than subtle chamber-only.
3. Existing motifs: no existing sound motif has to remain recognizable; mode names/control behavior should remain stable, but timbre and mappings may be replaced.
4. High-priority/big accents: busy bursts may trigger larger accents, not just explicit priority/emergency metadata.
5. Asset budget: flexible; quality matters more than a tiny bundle, as long as loading and runtime behavior remain bounded.
6. Audio licensing: any legally redistributable bundled assets are acceptable, with license/source/attribution metadata maintained.
7. Space Blaster: redesign as procedural musical sci-fi; do not rely on sample packs for this pass.
8. Browser/device acceptance: validate Chromium and Safari/WebKit paths where feasible.
9. Panning: do not add stereo panning; keep accents centered.
10. Controls: keep current user controls and mode names; do not expand UI controls for this pass.
11. Refactor scope: a deeper sound-engine rewrite is acceptable if public contracts remain stable.
12. Privacy/trust: metadata only; never use message contents or raw payload for sound generation.
13. Audio quality acceptance: use automated checks plus manual 5–10 minute quiet/busy listening in Orchestral Ensemble and Space Blaster.
14. Busy traffic annoyance mitigation: users can lower volume; still enforce hard safety bounds to prevent clipping/runaway nodes.
15. Sample sourcing: downloading and vendoring legal redistributable orchestral samples is acceptable if needed.
16. Naming: keep current visible mode names: Sound Off, Native+, Generative Key, Orchestral Ensemble, and Space Blaster.
