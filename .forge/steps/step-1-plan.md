# Step 1 Execution Plan: Add the upstream utilities submodule and submodule health checks

## Goal
Add `Colorado-Mesh/meshcore-utilities-site` as a read-only submodule at `vendor/meshcore-utilities-site`, add a local health-check script, and update CI checkout so submodule-backed future steps do not fail from missing upstream files.

## Current Code Observations
- `.github/workflows/ci.yml` uses `actions/checkout@v4` in five jobs and none currently specify `submodules: recursive`.
- `package.json` has build/test/map verification scripts but no utilities/submodule scripts.
- `Dockerfile` builder stage copies the whole repository and runs `npm run build`; final runtime stage copies only `public`, `.next/standalone`, and `.next/static`, so runtime should remain independent from `vendor/`.
- `.gitignore` does not ignore `vendor/`, so a submodule gitlink can be tracked normally.
- No `vendor` directory or `meshcore-utilities-site` path currently exists.

## Files to Change
- `.gitmodules` — add the upstream submodule metadata.
- `vendor/meshcore-utilities-site` — add the submodule gitlink.
- `scripts/check-utilities-submodule.mjs` — add a Node health check for expected upstream files and pinned SHA.
- `package.json` — add `utilities:check-submodule`.
- `eslint.config.mjs` — ignore `vendor/**` so host lint does not lint upstream submodule JavaScript.
- `.github/workflows/ci.yml` — make checkout recursive and run the submodule check in the quality job.

## Ordered Implementation Checklist
1. Add the submodule with `git submodule add https://github.com/Colorado-Mesh/meshcore-utilities-site vendor/meshcore-utilities-site`.
2. Inspect the upstream tree after checkout to identify stable required files for the health check.
3. Write `scripts/check-utilities-submodule.mjs` using Node built-ins only so it can run immediately after `npm ci` or without extra dependencies.
4. Add `utilities:check-submodule` to `package.json`.
5. Add `vendor/**` to ESLint global ignores so the upstream submodule remains read-only source material.
6. Add `submodules: recursive` to every CI checkout step in `.github/workflows/ci.yml`.
7. Add a `Check utilities submodule` step in the CI quality job after dependency install and before lint/type/test/build.
8. Run submodule status, submodule health check, typecheck, and lint.
9. Ensure `git status` does not show modified files inside `vendor/meshcore-utilities-site`.

## Interfaces and Data Contracts
- Submodule path: `vendor/meshcore-utilities-site`.
- Script command: `npm run utilities:check-submodule`.
- Health-check output must include the upstream commit SHA on success and actionable initialization guidance on failure.
- Required file list will be based on actual upstream files present after checkout.

## Verification Plan
- Automated: `git submodule status`; `npm run utilities:check-submodule`; `npm run typecheck`; `npm run lint`.
- Manual: inspect `.gitmodules` URL/path and confirm Docker final stage still does not copy `vendor/`.
- Regression: CI still runs existing lint, typecheck, unit tests, and build in the same order after checkout/dependency setup.

## Stop Conditions
- Pause if the upstream repository cannot be cloned.
- Pause if the upstream tree lacks stable source/data files for a meaningful health check.
- Pause if adding the submodule modifies unrelated tracked files or creates dirty changes inside the submodule.
