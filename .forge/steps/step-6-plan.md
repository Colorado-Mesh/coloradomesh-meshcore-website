# Step 6 Execution Plan: Final route, accessibility, Lighthouse, and browser validation

## Goal
Validate the completed UI/UX pass across route coverage, accessibility, Lighthouse, browser journeys, and final Forge review readiness, fixing only validation-scope defects.

## Current Code Observations
- `tests/e2e/smoke.spec.ts` covers the primary route smoke set, `/start` journeys, map diagnostics, all four tool links, `/guides` guide/tool handoffs, serial settings preview behavior, prefix matrix behavior, global nav labels/current states, mobile menu Escape behavior, and skip link behavior.
- The Playwright `criticalPages` array currently includes `/`, `/start`, `/map`, and `/tools`, while `src/lib/__tests__/site.test.ts` expects metadata-derived critical routes to include `/guides` and `/about` as well.
- `.lighthouserc.json` previously audited `/`, `/map`, and `/tools` only, so Step 6 adds `/start` and `/guides` and moves Lighthouse to a dedicated local port to avoid stale process reuse on port 3000.
- `package.json` exposes the required Step 6 gates: `lint`, `typecheck`, `test:unit`, `build`, `test:e2e`, `test:a11y`, and `test:lighthouse`.
- Step 1 through Step 5 review artifacts exist for completed steps; Step 5 is committed as `dbcab44` with no reviewer findings.
- The working tree still has pre-existing `.forge` artifact churn and `.forge.bak.*` archived directories, so staging must remain specific to Step 6 files and the final review artifact.

## Files to Change
- `tests/e2e/smoke.spec.ts` — include `/guides` in the axe-critical page set to match final high-value template coverage.
- `.lighthouserc.json` — include `/start` and `/guides` in Lighthouse collection URLs.
- `.forge/steps/step-6-plan.md` — record this execution plan.
- `.forge/reviews/final-claude-review.json` — save the final Forge review result.
- `src/components/Navigation.tsx` — restore focus to the mobile menu trigger before closing the drawer so the hidden/inert panel never retains focused descendants.
- Source files only if validation reveals another real defect; otherwise no UI/source edits.

## Ordered Implementation Checklist
1. Make the small validation-coverage updates to Playwright axe coverage and Lighthouse URLs.
2. Run `npm run lint` and fix only direct validation-scope failures.
3. Run `npm run typecheck` and fix only direct validation-scope failures.
4. Run `npm run test:unit` to confirm metadata, sitemap, and route invariants still pass.
5. Run `npm run build` to validate production compilation and generated routes.
6. Run `npm run test:e2e` and `npm run test:a11y` against the built app defaults or configured test server behavior.
7. Run `npm run test:lighthouse` after the build to audit `/`, `/start`, `/map`, `/tools`, and `/guides`.
8. Start a known-current production server on `127.0.0.1:4574` and browser-check `/`, `/start`, `/map`, `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, `/tools/serial-usb`, `/guides`, `/guides/repeater-setup`, `/why-meshcore`, `/use-cases`, `/blog`, and `/about` at representative desktop/mobile widths.
9. Check header active state, skip link, mobile menu open/close/Escape, footer groups, journey cards, tool visibility, guide handoffs, sitemap/robots responses, and console/network cleanliness.
10. Stage only Step 6 validation files and final review artifact, request final Forge review over the complete UI/UX pass, fix blockers if any, then commit the approved Step 6 validation changes.

## Interfaces and Data Contracts
- Public routes remain unchanged, including `/`, `/start`, `/map`, `/tools`, all four tool routes, `/guides`, five guide routes, `/why-meshcore`, `/use-cases`, `/blog`, and `/about`.
- Primary nav labels remain `Get Started`, `Live Map`, `Tools`, `Guides`, `Learn`, `About`.
- External links keep `target="_blank"` and `rel="noopener noreferrer"` where they open third-party destinations.
- Lighthouse config remains local-only and does not upload reports outside `.lighthouseci`.
- No new dependencies, shared service changes, pushes, releases, workflows, forms, disclaimers, or feature scope.

## Verification Plan
- Automated: `npm run lint`
- Automated: `npm run typecheck`
- Automated: `npm run test:unit`
- Automated: `npm run build`
- Automated: `npm run test:e2e`
- Automated: `npm run test:a11y`
- Automated: `npm run test:lighthouse`
- Manual: production browser validation on `127.0.0.1:4574` for the routes and interactions listed in the checklist.
- Regression: confirm archived `.forge.bak.*` directories and unrelated stale Forge artifacts are not staged or committed.

## Stop Conditions
- Pause if validation failures imply new product behavior, new dependencies, CI workflow changes, or source changes beyond validation fixes.
- Pause if Lighthouse instability is environmental rather than a real page regression and document the exact failure instead of masking thresholds.
- Pause if any browser route cannot be loaded locally, if console/network errors indicate runtime breakage, or if final Forge review returns blocking findings that require scope changes.
