# Step 2 Execution Plan: Expand and validate the orchestral sample manifest

## Goal
Replace the sparse four-sample Orchestral Ensemble manifest with a richer role-balanced same-origin sample palette and strengthen validation so every referenced sample has metadata, attribution, and a reachable non-empty file.

## Current Code Observations
- `corescope-overlay/sound/orchestral/manifest.json` currently defines only four samples: harp, clarinet, violin pizzicato, and timpani.
- Existing high-frequency roles are sparse: `messages` has two variants, `node` has one, and `priority` has two with one reused harp sample.
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` already tracks legal metadata for FreePats and VSCO CC0/public-domain sources.
- `scripts/docker-smoke.mjs` validates required sample fields and fetches sample URLs, but it does not require role diversity, role references to exist, or attribution text for every manifest sample.
- `tests/e2e/smoke.spec.ts` uses a mocked manifest with the same small role shape; Step 2 should update the mock so later orchestral tests exercise richer roles without depending on real decoded audio.

## Files to Change
- `corescope-overlay/sound/orchestral/manifest.json` — add role-balanced sample entries and expanded role mappings.
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` — document every bundled and derived sample variant.
- `corescope-overlay/sound/orchestral/samples/**` — add short CC0-compatible orchestral variants derived from existing CC0/public-domain bundled sources.
- `scripts/docker-smoke.mjs` — validate role diversity, role references, required metadata, non-empty files, and attribution coverage.
- `tests/e2e/smoke.spec.ts` — expand mocked orchestral manifest role/sample coverage.
- `.forge/steps/step-2-plan.md` — this execution plan.
- `.forge/reviews/claude-step-2.json` — review output after staging.

## Ordered Implementation Checklist
1. Create a curated set of short derived sample variants from existing CC0/public-domain source files to expand strings, harp/mallet, woodwind, and percussion colors without adding external runtime dependencies.
2. Update the manifest sample list with stable IDs, role, URL, root/range, instrument, family, articulation/variant metadata, license, source URL, and attribution for each sample.
3. Expand role mappings so `messages`, `node`, and `priority` each have multiple variants; add additive helper roles for later cinematic cue templates only if they do not break the current loader.
4. Update attribution with included file names, source material, transformation notes, source URLs, and license for every added variant.
5. Strengthen Docker smoke validation to reject missing role references, sparse required roles, missing sample metadata, missing attribution references, and empty sample assets.
6. Update the Playwright mocked orchestral manifest to include the richer role shape and enough decoded fake samples to keep tests deterministic.
7. Run lint for changed JS/TS files and a targeted Orchestral Ensemble smoke test.
8. Stage specific files, run Forge reviewer, address findings, and commit Step 2.

## Interfaces and Data Contracts
- Manifest remains served at `/sound/orchestral/manifest.json` with top-level `version`, `samples`, and `roles`.
- Existing runtime-required fields stay valid: `id`, `role`, `url`, `rootNote`, `minMidi`, `maxMidi`, `license`, `sourceUrl`, and `attribution`.
- New manifest metadata is additive only, e.g. `family`, `instrument`, `articulation`, `variant`, and `derivedFrom`.
- Runtime sample URLs remain same-origin `/sound/orchestral/samples/**` paths.
- Visible mode names and public sound API do not change.

## Verification Plan
- Automated: `npm run lint -- scripts/docker-smoke.mjs tests/e2e/smoke.spec.ts`
- Automated: `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Orchestral Ensemble"`
- Static validation: use a local manifest/asset check to verify every manifest role references existing sample IDs and every sample URL points at a non-empty local file.
- Regression: Existing Orchestral Ensemble mocked sample rotation and pitch-class checks must still pass.

## Stop Conditions
- Pause if adding real external samples would require unclear licensing or source attribution.
- Pause if the manifest shape would require Step 3 runtime loader changes before existing tests can pass.
- Pause if sample generation would require adding a new build tool or runtime audio dependency.
