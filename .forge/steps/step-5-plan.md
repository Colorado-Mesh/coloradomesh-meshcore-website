# Step 5 Execution Plan: Port utilities into a first-class `/tools` experience

## Goal
Create a first-class `/tools` area with integrated repeater naming, companion naming, prefix matrix, and Serial USB utilities, while migrating prefix-conflict checks to the Step 3 map data contracts.

## Current Code Observations
- Navigation and footer already link to `/tools`, but no `/tools` route exists.
- `NamingWizard` and `PrefixMatrix` still import `NodeWithStats` and fetch `/api/nodes`.
- `CompanionNamer` already implements useful companion naming behavior and can be surfaced as its own tool page with minimal logic changes.
- The naming-standard guide and homepage still embed tool components directly; this step should avoid the Step 6 homepage redesign, but tool routes should be available for callers.
- `src/app/sitemap.ts` includes `/observer` and omits `/tools` plus tool subroutes; `/observer` removal is Step 7, but `/tools` routes should be added now.
- Upstream `meshcore-utilities-site` utilities are DOM-script/Flask shaped. The feasible Step 5 port is behavior-level integration in typed Next components, not vendoring Flask or raw DOM scripts.

## Upstream Utility Matrix
| Utility | Step 5 action | Notes |
| --- | --- | --- |
| Repeater name tool | Port/integrate | Use existing `NamingWizard` foundation, update branding, map-derived conflict checks, and expose at `/tools/repeater-name`. Full server-generated settings JSON/keygen flow is deferred unless already cleanly available. |
| Companion name tool | Port/integrate | Reuse current `CompanionNamer`, expose at `/tools/companion-name`, preserve 23-character limit and suffix strategies. |
| Prefix matrix | Replace data source | Keep existing React UI behavior, migrate to `MapNode` and `/api/map/nodes`, expose at `/tools/prefix-matrix`. |
| Serial USB tool | Add progressive-enhancement component | Implement Web Serial feature detection, secure-context fallback, connect/disconnect, canned command runner using default serial command profile, terminal log, and unsupported-browser guidance. No hardware-only claims without device validation. |
| Browser key generation | Defer | Upstream keygen code needs a separate license/security review. Keep links/instructions only in this step. |
| Recommended settings/regions JSON | Defer unless needed | Existing naming data covers the integrated naming UI; full upstream settings import can be a later tool enhancement. |

## Files to Change
- `src/app/tools/page.tsx` — add tools hub route.
- `src/app/tools/repeater-name/page.tsx` — add repeater naming tool route.
- `src/app/tools/companion-name/page.tsx` — add companion naming tool route.
- `src/app/tools/prefix-matrix/page.tsx` — add prefix matrix tool route.
- `src/app/tools/serial-usb/page.tsx` — add Serial USB route.
- `src/components/NamingWizard.tsx` — migrate conflict data to `MapNode`/`/api/map/nodes`, update visible Colorado Mesh copy, and allow prefix matrix link target customization if needed.
- `src/components/PrefixMatrix.tsx` — migrate to `MapNode`/`/api/map/nodes`, update field names and copy.
- `src/components/tools/ToolShell.tsx` — shared non-visual shell for tool pages.
- `src/components/tools/SerialUsbTool.tsx` — client Web Serial utility.
- `src/lib/tools/serial-commands.ts` — typed default command profile derived from upstream `default_serial_commands.json`.
- `src/app/sitemap.ts` — add `/tools` and tool subroutes.
- `src/components/index.ts` — export new tool components if needed.

## Ordered Implementation Checklist
1. Add tool data/types for the default Serial USB command profile with typed action/step contracts and no dynamic JSON fetch.
2. Add `SerialUsbTool` as a client component with Web Serial type shims, support detection, secure-context messaging, connect/disconnect, send-line, canned action runner, terminal output, and clear local state.
3. Migrate `PrefixMatrix` from `NodeWithStats`/`/api/nodes` to `MapNode`/`/api/map/nodes`, updating `publicKey`, `isOnline`, and `lastHeardAt` field usage.
4. Migrate `NamingWizard` conflict checks to `MapNode`/`/api/map/nodes` and update stale Denver-branded strings plus the Nominatim User-Agent.
5. Add route pages for `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb`, using existing visual primitives only where straightforward.
6. Add `ToolShell` to keep route pages consistent without deep visual redesign.
7. Update sitemap to include `/tools` and concrete tool routes, leaving `/observer` untouched for Step 7.
8. Run automated verification and fix TypeScript/lint/build issues.
9. Start the dev server and manually validate the tool routes in a browser; record if Web Serial hardware validation cannot be performed.
10. Stage only Step 5 files, run the Forge reviewer, save `.forge/reviews/claude-step-5.json`, fix blockers if any, then commit.

## Interfaces and Data Contracts
- `PrefixMatrix` consumes `ApiResponse<MapNode[]>` from `/api/map/nodes` and uses `MapNode.publicKey`, `MapNode.name`, `MapNode.isOnline`, and `MapNode.lastHeardAt`.
- `NamingWizard` conflict checks consume the same map node response and do not import legacy `NodeWithStats`.
- `SerialUsbTool` uses browser-only Web Serial APIs behind feature detection and only calls `navigator.serial.requestPort()` from an explicit button click.
- Serial command profile shape:
  - `serial.baudRate`, `dataBits`, `stopBits`, `parity`, `flowControl`, `defaultLineEnding`
  - `actions[].steps[]` where steps are `send` or `wait`
- Tool routes are static pages except client components embedded within them.

## Verification Plan
- Automated:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- Manual:
  - Run the dev server.
  - Visit `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb`.
  - Confirm naming conflict checks and prefix matrix network requests hit `/api/map/nodes`.
  - Confirm Serial USB shows an unsupported/insecure fallback if Web Serial is unavailable and does not prompt before clicking Connect.
- Regression:
  - Existing naming-standard guide still renders embedded `NamingWizard` and `PrefixMatrix`.
  - Navigation/footer `/tools` links resolve.
  - `/map` remains unchanged from Step 4.

## Stop Conditions
- Pause before importing upstream browser key-generation code because it needs separate license/security review.
- Pause before deleting homepage inline tools because Step 6 owns homepage redesign unless a minimal link-only change is required for compilation.
- Pause before removing `/observer` or old `/api/nodes`; Step 7 owns hard removal.
- Pause if Web Serial implementation requires browser permissions or hardware validation that cannot be performed locally; record the limitation instead of claiming hardware validation.
