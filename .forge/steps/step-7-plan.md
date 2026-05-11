# Step 7 Execution Plan: Add Submodule Update Automation and Final Integration Gates

## Goal
Make upstream utility submodule updates visible through reviewable weekly PRs and make CI fail when committed generated utility artifacts are stale relative to the pinned submodule.

## Current Code Observations
- `.github/workflows/ci.yml` already uses `submodules: recursive` for quality, browser smoke, accessibility, Lighthouse, and Docker smoke jobs.
- The quality job already runs `npm run utilities:check-submodule` after `npm ci`.
- The quality job does not yet run `npm run utilities:check`, so CI does not currently enforce generated utility artifact freshness.
- `package.json` already exposes `utilities:check-submodule`, `utilities:generate`, and `utilities:check` scripts.
- `.github/dependabot.yml` does not exist yet.
- `src/lib/parity/manifest.ts` still says utilities stale-artifact checks are planned after generated artifacts land in CI.

## Files to Change
- `.github/dependabot.yml` — add weekly Dependabot updates for the root `gitsubmodule` ecosystem without auto-merge.
- `.github/workflows/ci.yml` — add `npm run utilities:check` to the quality job after the submodule check and before lint/type/test/build gates.
- `src/lib/parity/manifest.ts` — update CI parity notes to reflect that stale generated utility artifacts are now enforced in CI.
- `.forge/steps/step-7-plan.md` — record this execution plan for Forge review.

## Ordered Implementation Checklist
1. Create `.github/dependabot.yml` with version 2 config and a weekly `gitsubmodule` entry for `/`.
2. Keep Dependabot scope narrow to submodule updates only so this step does not alter npm dependency update policy.
3. Edit `.github/workflows/ci.yml` to run `npm run utilities:check` immediately after `npm run utilities:check-submodule` in the quality job.
4. Edit `src/lib/parity/manifest.ts` so the CI quality gate note names the utilities submodule and stale-artifact checks as implemented.
5. Run submodule and generated-artifact checks, then lint, typecheck, unit tests, targeted/full browser checks as feasible, a11y, build, and Docker smoke if Docker is available.
6. Stage only Step 7 implementation files and request Claude Forge review.

## Interfaces and Data Contracts
- Dependabot ecosystem: `gitsubmodule` at root directory `/`.
- CI quality command order: install dependencies, check submodule, check generated artifacts, then lint/type/unit/build.
- Existing scripts remain unchanged: `npm run utilities:check-submodule`, `npm run utilities:generate`, `npm run utilities:check`.
- No runtime source imports from `vendor/meshcore-utilities-site`; generated artifacts remain the application boundary.

## Verification Plan
- Automated:
  - `npm run utilities:check-submodule`
  - `npm run utilities:check`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e -- --grep "tools|serial-usb|prefix-matrix|critical page smoke"`
  - `npm run test:a11y`
  - `npm run build`
  - Docker image build plus `npm run docker:smoke -- --image colorado-meshcore-site:ci` if local Docker is available.
- Manual:
  - Inspect Dependabot YAML syntax and scope.
  - Browser-test `/tools`, the four local utility routes, and representative upstream compatibility redirects against a fresh production server.
- Regression:
  - CI keeps recursive submodule checkout for all build/test jobs.
  - Dependabot does not auto-merge submodule updates.
  - No broad npm dependency update policy is introduced.
  - No contacts export, Flask proxy, iframe, or runtime vendor import is introduced.

## Stop Conditions
- Stop before adding auto-merge or broad dependency-update policy.
- Stop before changing generated artifacts manually unless `npm run utilities:generate` produces the change.
- Stop if `npm run utilities:check` reports stale generated output that requires a submodule/generated artifact decision beyond this CI-gate step.
- Stop before releasing or starting map-data work until Forge Step 7 review and final Forge completion are done.
