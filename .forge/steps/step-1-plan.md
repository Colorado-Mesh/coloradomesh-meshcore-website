# Step 1 Execution Plan: Add and verify the CoreScope submodule

## Goal
Vendor CoreScope as a pinned git submodule and add an early verification script so Docker/runtime work fails clearly when the submodule is missing or structurally incompatible.

## Current Code Observations
- `.gitmodules` currently contains `vendor/meshcore-utilities-site` only.
- `.github/dependabot.yml` already has a weekly `gitsubmodule` update entry for the repository root, so a new submodule should be covered automatically.
- `scripts/check-utilities-submodule.mjs` provides a good pattern: resolve repo root, check required upstream files, verify `git rev-parse HEAD`, and print a clear recovery command.
- `package.json` already has utility submodule scripts and can add a parallel `corescope:check-submodule` script.
- CoreScope upstream has the required runtime/build files: `Dockerfile`, `config.example.json`, `cmd/server/go.mod`, `cmd/ingestor/go.mod`, `public/index.html`, `public/live.js`, `public/app.js`, and `LICENSE`.

## Files to Change
- `.gitmodules` — add the CoreScope submodule entry.
- `vendor/CoreScope` — gitlink to the pinned upstream commit.
- `scripts/check-corescope-submodule.mjs` — new submodule structure checker.
- `package.json` — add the `corescope:check-submodule` script.
- `.forge/steps/step-1-plan.md` — this execution plan.

## Ordered Implementation Checklist
1. Add CoreScope as a submodule at `vendor/CoreScope` from `https://github.com/Kpa-clawbot/CoreScope`.
2. Create `scripts/check-corescope-submodule.mjs` modeled after `scripts/check-utilities-submodule.mjs`.
3. Require CoreScope files that future Docker/runtime steps depend on.
4. Add `corescope:check-submodule` to `package.json` without changing existing scripts.
5. Run the new checker and `git submodule status vendor/CoreScope`.
6. Stage only Step 1 files for Forge review.
7. Save the Claude review JSON to `.forge/reviews/claude-step-1.json` after review.

## Interfaces and Data Contracts
- `npm run corescope:check-submodule` must exit `0` when `vendor/CoreScope` is initialized at a readable git commit.
- On failure, the checker must print `git submodule update --init --recursive vendor/CoreScope`.
- The checker validates only source structure; it does not build CoreScope or inspect credentials.

## Verification Plan
- Automated: `npm run corescope:check-submodule`
- Automated: `git submodule status vendor/CoreScope`
- Regression: ensure existing `utilities:check-submodule` remains unchanged and package scripts still parse as JSON.

## Stop Conditions
- Pause if `git submodule add` fails because `vendor/CoreScope` already exists with unexpected content.
- Pause if CoreScope upstream does not expose the required files at the pinned commit.
- Pause if adding the submodule would require overwriting existing tracked files.
