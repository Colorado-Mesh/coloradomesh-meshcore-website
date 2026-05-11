# Forge Project

## Description
Add `https://github.com/Colorado-Mesh/meshcore-utilities-site` as a git submodule and redesign/integrate the utilities experience so this site keeps receiving updates as the upstream tools are updated.

## Constraints
- Brownfield integration into the existing Colorado MeshCore Next.js site.
- Preserve the existing site design system and public-site quality standards.
- Use a submodule-based relationship so upstream utility changes can be pulled forward.
- The current session is Codex-backed; frontend visual implementation must be delegated to `co-ui`/native Opus UI rather than hand-coded directly here.
- Do not silently commit `.forge` research/planning artifacts unless the Forge process step explicitly calls for it.

## Context
- Greenfield/Brownfield: Brownfield
- Platform: Existing Next.js 16 / React 19 / Tailwind 4 public website
- Deliverable type: code
- Date: 2026-05-10

## Forge Decision Set
The current instruction is to continue without further clarification prompts, so the implementation plan will use the research-backed default recommendations from `.forge/research/SYNTHESIS.md`.

1. **First-release scope:** Integrate and parity-check the existing public tools first: repeater naming/config, companion naming/config, prefix matrix, and serial USB. Contacts export and Flask deployment internals are out of scope.
2. **Route compatibility:** Keep `/tools/*` canonical and add permanent redirects only for known upstream Flask route paths that map cleanly to current tools.
3. **Submodule path:** Add the upstream repository at `vendor/meshcore-utilities-site` and treat it as read-only source material.
4. **Generated artifacts:** Commit narrow generated typed artifacts and fail CI when they are stale.
5. **Parity level:** Require exact parity for deterministic data/config outputs; document intentional divergence for safety, accessibility, browser support, and local live-map integration.
6. **Serial USB safety:** Keep guarded previews, block private/secret/password fields by default, require explicit confirmation, and leave destructive full-parity flows out of scope.
7. **Web Serial UX:** Make unsupported-browser and insecure-context states prominent on the serial tool.
8. **Contacts export:** Do not expose upstream `/contacts`-style export in this integration.
9. **Submodule updates:** Configure weekly Dependabot `gitsubmodule` PRs after generator/parity checks exist; do not auto-merge.
10. **License posture:** Do not copy substantial upstream source code, templates, CSS, or assets until upstream has an explicit compatible license; reimplement behavior locally from contracts/tests meanwhile.
11. **Upstream UI fallback:** Do not proxy or iframe the Flask UI; include provenance/reference links where useful.
12. **Visual implementation:** Provide data contracts, tests, and integration boundaries here; delegate final frontend visual redesign/polish to `co-ui`/native Opus UI.
13. **CI/deploy support:** Support local development, GitHub Actions, Docker builds, and Netlify-compatible builds with early missing-submodule failures and runtime independence from `vendor/`.
14. **Future upstream cooperation:** Do not block on upstream packaging; document shared JS/TS core as a future enhancement only.
