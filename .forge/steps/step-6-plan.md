# Step 6 Execution Plan: Delegate Utilities Visual Redesign and Interaction Polish to Native Opus UI

## Goal
Have native Opus UI polish the utilities experience across `/tools` and the utility pages while preserving route contracts, generated-data imports, serial safety behavior, smoke selectors, and no-runtime-submodule constraints.

## Current Code Observations
- This session is Codex-backed, so frontend visual/aesthetic implementation must be delegated to `co-ui`/native Opus UI rather than hand-coded here.
- `/tools` already includes four first-class local tools plus the external analyzer card and generated upstream provenance copy from Step 4.
- `ToolShell` provides shared hero/breadcrumb/action/aside scaffolding for utility pages.
- `SerialUsbTool` now has stable safety selectors: `serial-support-banner`, `serial-support-status`, `serial-connect`, `serial-settings-input`, `serial-settings-apply`, `serial-settings-preview`, `serial-settings-error`, `serial-settings-warnings`, and `serial-settings-unsupported`.
- Critical Playwright tests depend on visible tool links, prefix-matrix controls, serial settings selectors, redirect outcomes, and nav/current states.
- Generated utility data is consumed through `@/lib/upstream-utilities`; runtime UI must not import from `vendor/meshcore-utilities-site` or copy upstream templates/CSS/assets.

## Files to Change
- Likely `src/app/tools/page.tsx` — tools hub presentation and provenance/analyzer surfacing.
- Likely `src/app/tools/repeater-name/page.tsx` — page shell/copy polish only.
- Likely `src/app/tools/companion-name/page.tsx` — page shell/copy polish only.
- Likely `src/app/tools/prefix-matrix/page.tsx` — page shell/copy polish only.
- Likely `src/app/tools/serial-usb/page.tsx` — safety/requirements copy polish only.
- Likely `src/components/tools/ToolShell.tsx` — shared shell visual polish.
- Likely `src/components/tools/SerialUsbTool.tsx` — interaction polish that does not weaken safety logic.
- Optional `src/components/NamingWizard.tsx`, `src/components/CompanionNamer.tsx`, `src/components/PrefixMatrix.tsx` if Opus UI identifies low-risk interaction polish.
- Optional `tests/e2e/smoke.spec.ts` only if intentional copy/selector changes require updates.

## Ordered Implementation Checklist
1. Run `co-ui` from the repository root with a concise prompt containing exact scope, files, current contracts, smoke selectors, serial safety invariants, and forbidden changes.
2. Inspect the resulting diff for any edits to `vendor/`, runtime `vendor/` imports, copied upstream templates/CSS/assets, iframe/proxy behavior, removed test IDs, or weakened serial guards.
3. If Opus UI changed visual labels or markup intentionally, update smoke tests only to match user-visible behavior while preserving stable critical selectors.
4. Run targeted typecheck, lint, unit, e2e, a11y, and build checks from the Step 6 verification plan.
5. Start the app and manually browser-test `/tools`, all four local tool routes, representative compatibility redirects, serial unsupported/no-connection preview, and prefix matrix search/suggestion behavior.
6. If visual issues remain, delegate a focused follow-up to `co-ui`; do not hand-code visual/aesthetic fixes in this Codex-backed session.
7. Stage only Step 6 implementation files and request Forge review.

## Interfaces and Data Contracts
- Canonical routes remain `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb`.
- Compatibility redirects from Step 4 remain intact.
- Serial safety selectors and disabled states remain intact.
- Serial mutating actions continue to require confirmation and settings Apply remains disabled without a connected port.
- Prefix matrix continues to use local `/api/map/snapshot`/local live-map data, not upstream contacts export.
- External links retain `target="_blank"` and `rel="noopener noreferrer"`.

## Verification Plan
- Automated:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test:unit`
  - `npm run test:e2e -- --grep "tools|serial-usb|prefix-matrix|critical page smoke"`
  - `npm run test:a11y`
  - `npm run build`
- Manual:
  - Start the app and test `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb` in Chromium.
  - Visit `/repeater_name_tool`, `/companion_name_tool`, `/prefix_matrix`, and `/serial_usb_tool` and confirm redirects land on canonical routes.
  - Validate mobile and desktop widths for nav, tools cards, forms, serial preview, and prefix matrix.
  - Monitor browser console and network errors.
- Regression:
  - No direct runtime imports from `vendor/meshcore-utilities-site`.
  - No upstream Flask runtime/proxy/iframe is introduced.
  - No removal of critical smoke selectors.

## Stop Conditions
- Stop and delegate back to `co-ui` if a needed change is visual/aesthetic.
- Stop before accepting any change that edits `vendor/`, imports from `vendor/` at runtime, copies upstream UI/CSS/templates, weakens serial safety, removes smoke selectors, or introduces iframe/proxy behavior.
- Stop before broadening scope to contacts export or new utility capabilities.
