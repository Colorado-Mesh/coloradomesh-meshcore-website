# Forge Project

## Description
Replace the existing Colorado MeshCore site `/map` experience with the CoreScope live map from https://github.com/Kpa-clawbot/CoreScope, using CoreScope as a git submodule and serving CoreScope directly from the same Docker container as the existing Next.js site.

## Constraints
- Brownfield integration into the existing Colorado MeshCore Next.js repository.
- `/map` must be a direct on-site implementation, not an external redirect.
- Production runtime is Docker only; Netlify is no longer relevant for this feature.
- Everything must live in the same Docker container because the deployment host/Linode is not directly controllable.
- CoreScope must be included as a git submodule so updates can arrive through Dependabot PRs.
- The container should run CoreScope internally alongside the existing Next app.
- `/map` should serve the CoreScope page itself, defaulting to a redesigned Colorado Mesh live-map experience.
- Users should be able to access the full CoreScope analyzer from the map experience.
- A small local patch/overlay layer on top of CoreScope is acceptable for minimal/fullscreen mode and Colorado Mesh polish.
- Data source should match what `analyzer.meshcore.coloradomesh.org` uses as closely as possible; exact MQTT/config secrets are currently unknown.
- No redaction is requested beyond keeping runtime credentials server-side.
- Visual/frontend aesthetic implementation must be delegated to native Opus UI / `co-ui` because this session is Codex-backed.

## Context
- Greenfield/Brownfield: Brownfield
- Platform: Existing Next.js 16 / React 19 / Tailwind 4 / Node 24 site, Docker standalone output
- Deliverable type: code
- Date: 2026-05-14

## Intake Answers
1. **Project type:** Existing site.
2. **Map target:** Replace the current `/map` live map.
3. **Submodule preference:** Use CoreScope as a git submodule.
4. **Deliverable type:** Code project.

## Refined Decision Set
1. **Public access:** CoreScope will be public; no node/packet redaction requested beyond keeping secrets out of the browser.
2. **Canonical URL:** Existing `/map` remains the public entry point and should serve CoreScope directly.
3. **Container model:** One Docker image/container runs both the Next site and CoreScope.
4. **CoreScope surface:** `/map` defaults to the redesigned/minimal live map; full analyzer remains reachable from the map experience.
5. **CoreScope updates:** Use a pinned CoreScope submodule with Dependabot gitsubmodule PRs.
6. **Runtime data:** Replicate the current analyzer data source/config where possible; deployment must provide any required MQTT credentials through environment variables.
7. **Patch policy:** Keep CoreScope upstream files untouched in the submodule and apply a tracked local overlay/patch layer during build.
8. **Visual polish:** Use `co-ui`/Opus UI for the Colorado Mesh CoreScope shell/minimal mode design work.
