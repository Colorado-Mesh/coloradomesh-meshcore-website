# Step 2 Execution Plan: Generate local typed artifacts and provenance from upstream source files

## Goal
Create a deterministic generator that reads selected upstream utility data from `vendor/meshcore-utilities-site`, emits narrow committed local artifacts under `src/lib/upstream-utilities/generated/`, and gives tests/CI a stale-checkable provenance contract.

## Current Code Observations
- Step 1 added `scripts/check-utilities-submodule.mjs`, `npm run utilities:check-submodule`, recursive CI checkout, and `vendor/**` lint ignores.
- `package.json` has no generator or stale-check command yet.
- `tsconfig.json` has `resolveJsonModule: true`, so generated JSON can be imported by TypeScript through a stable `index.ts` wrapper.
- Existing parity fixtures live under `src/lib/parity/fixtures/utilities/` and `src/lib/parity/fixtures/provenance.json`; provenance still references `/tmp/meshcore-utilities-site` rather than the submodule.
- `src/lib/parity/manifest.ts` currently points several utilities items at static fixtures and some old backend paths, while the real submodule has Flask app/templates/static files.
- Upstream selected source files are present at `static/data/recommended_settings.json`, `static/data/regions.json`, `static/data/default_serial_commands.json`, and `serial_commands.schema.json`.
- Upstream recommended settings use snake_case radio fields that match the local config export contract.
- Upstream regions have top-level `airports`, `cities`, `counties`, `regions`, and `alternatives` collections; some collections may be empty and should still validate.
- Existing parity tests load static fixture JSON and validate the serial command fixture against the schema with Ajv.

## Files to Change
- `scripts/generate-utilities-artifacts.mjs` — add deterministic generation and stale-check modes.
- `package.json` — add `utilities:generate` and `utilities:check` scripts.
- `src/lib/upstream-utilities/generated/recommended-settings.json` — generated upstream recommended settings.
- `src/lib/upstream-utilities/generated/regions.json` — generated upstream region data.
- `src/lib/upstream-utilities/generated/serial-command-profile.json` — generated upstream serial command profile.
- `src/lib/upstream-utilities/generated/serial-command-schema.json` — generated upstream serial command schema.
- `src/lib/upstream-utilities/generated/provenance.json` — generated source-path and commit metadata.
- `src/lib/upstream-utilities/index.ts` — stable typed exports for generated artifacts.
- `src/lib/parity/fixtures/provenance.json` — update utility provenance to submodule-backed generated data while preserving live-map provenance.
- `src/lib/parity/manifest.ts` — update utility upstream/local refs to generated artifacts and submodule paths.
- `src/lib/parity/__tests__/manifest.test.ts` — validate generated artifacts/provenance and schema compatibility.

## Ordered Implementation Checklist
1. Add `scripts/generate-utilities-artifacts.mjs` using Node built-ins only, invoking the existing submodule check first.
2. Read and validate the four upstream JSON/schema files with narrow runtime assertions for expected top-level shape, radio fields, serial actions, and regions collections.
3. Generate deterministic pretty-printed JSON artifacts under `src/lib/upstream-utilities/generated/`, including provenance with the submodule commit SHA and stable source list.
4. Implement `--check` mode that builds expected output in memory and compares it to tracked generated files without rewriting them.
5. Add `utilities:generate` and `utilities:check` scripts to `package.json`.
6. Add `src/lib/upstream-utilities/index.ts` typed JSON exports without importing from `vendor/`.
7. Update parity manifest/provenance references from static utility fixtures and stale `/tmp` paths to submodule source paths and generated local artifacts.
8. Update parity tests to import generated artifacts, validate serial profile against the generated schema, and assert provenance includes the submodule commit/source files.
9. Run generation and stale check, then targeted unit tests and typecheck.

## Interfaces and Data Contracts
- Commands: `npm run utilities:generate` and `npm run utilities:check`.
- Generated local import boundary: `@/lib/upstream-utilities`.
- Generated provenance fields: `upstreamRepository`, `upstreamUrl`, `submodulePath`, `upstreamCommit`, and `sources`.
- Each provenance source maps an upstream path to a generated path and includes a stable `kind` string.
- Generated JSON files must be deterministic; no generation timestamp is included.

## Verification Plan
- Automated: `npm run utilities:check-submodule`; `npm run utilities:generate`; `npm run utilities:check`; `npm run test:unit -- --run src/lib/parity/__tests__/manifest.test.ts`; `npm run typecheck`.
- Manual: inspect generated files for narrow JSON/schema/provenance only and confirm no upstream templates/CSS/JS implementation code was copied.
- Regression: existing parity report generation still includes required utility domains and live-map provenance remains present.

## Stop Conditions
- Pause if upstream JSON is invalid or missing one of the selected source files.
- Pause if upstream region data no longer exposes the expected top-level collections.
- Pause if serial command data no longer validates against its upstream schema.
- Pause if implementing the generator would require copying upstream UI templates, CSS, or large implementation JavaScript into runtime code.
