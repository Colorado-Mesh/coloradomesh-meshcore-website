# Step 5 Execution Plan: Utility data model and generated repeater/companion settings JSON

## Goal
Promote repeater and companion naming/config generation into typed pure modules, then wire both tools to deterministic MeshCore settings JSON preview/download flows without broad visual redesign.

## Current Code Observations
- `src/components/NamingWizard.tsx` owns repeater domain rules inline: region/city/landmark/type/pubkey state, generated name construction, 23-character validation, map-node prefix conflict fetching, and a direct Nominatim lookup that remains deferred to Step 7.
- `src/components/CompanionNamer.tsx` owns companion rules inline: emoji/handle/suffix state, role options, generated name construction, and 23-character display. It has no settings JSON export yet.
- `src/lib/tools/serial-commands.ts` defines serial profile/action contracts but does not yet consume generated settings JSON; serial application remains Step 7.
- `src/lib/parity/manifest.ts` still marks `utilities-repeater-settings-json` and `utilities-companion-settings-json` as `planned` with no coverage refs.
- `src/app/guides/radio-settings/page.tsx` duplicates radio defaults that also exist in the upstream `recommended_settings.json` fixture.
- `/tmp/meshcore-utilities-site/backend/api/routes/repeater_name_tool/index.py` generates repeater settings by applying recommended node-type settings, all region codes, home region, generated name, and `owner_info = None`; file name prefix is `coloradomesh_meshcore_repeater_config_`.
- `/tmp/meshcore-utilities-site/backend/api/routes/companion_name_tool/index.py` reuses recommended settings, sets `name`, recommends/generated public key id upstream, and returns file name prefix `coloradomesh_meshcore_companion_config_`.
- `/tmp/meshcore-utilities-site/static/data/recommended_settings.json` contains the canonical radio defaults: frequency `910525`, bandwidth `62500`, spreading factor `7`, coding rate `8`, and tx power `22`.
- `/tmp/meshcore-utilities-site/static/data/regions.json` has upstream airport/city data, but local `src/lib/data/airports.ts`, `cities.ts`, and `landmarks.ts` already contain curated UI data; this step should add typed canonical modules rather than replace UI datasets wholesale.
- Vitest runs in node mode and includes `src/**/*.test.ts`, so pure lib tests should avoid DOM/browser APIs.

## Files to Change
- `src/lib/meshcore-data/settings.ts` — add canonical radio defaults, region list, node type settings, and provenance metadata.
- `src/lib/meshcore-data/regions.ts` — expose typed MeshCore region codes derived from current airport data.
- `src/lib/meshcore-data/node-types.ts` — expose repeater/room node type definitions shared by UI and settings generation.
- `src/lib/meshcore-tools/naming.ts` — move repeater and companion naming/validation helpers out of client components.
- `src/lib/meshcore-tools/config-export.ts` — add deterministic settings JSON output and safe filename helpers for repeater and companion tools.
- `src/lib/meshcore-tools/__tests__/config-export.test.ts` — cover naming validation, generated JSON shapes, filenames, invalid inputs, 23-character limits, and canonical fixture parity.
- `src/components/NamingWizard.tsx` — consume shared node type/naming/export helpers and add JSON preview/download UI.
- `src/components/CompanionNamer.tsx` — consume shared companion helpers and add JSON preview/download UI.
- `src/app/guides/radio-settings/page.tsx` — read displayed radio settings/commands from canonical settings data to avoid drift.
- `src/lib/parity/manifest.ts` — mark repeater and companion settings JSON parity as implemented with local/test coverage refs.

## Ordered Implementation Checklist
1. Create typed MeshCore data modules for radio defaults, region codes, and repeater node types using current local data and upstream provenance notes.
2. Create pure naming helpers for repeater and companion flows, preserving current formatting, validation rules, suffix strategies, role definitions, and 23-character limit behavior.
3. Create pure config export helpers that validate inputs and return deterministic `{ fileName, settingsJson, warnings }` style results for repeater and companion settings without private keys.
4. Update `NamingWizard` to use shared node type definitions/naming helpers, generate repeater config export only when inputs are valid, and provide copy/download/preview affordances via browser Blob.
5. Update `CompanionNamer` to use shared role/naming helpers, validate companion export inputs, and provide download/preview affordances via browser Blob.
6. Update the radio settings guide to use canonical radio defaults from `src/lib/meshcore-data/settings.ts`.
7. Add Vitest unit coverage for pure naming/config exports, canonical radio fixture parity, invalid input blocking, safe file names, warnings, and 23-character limits.
8. Update `src/lib/parity/manifest.ts` with implemented statuses and coverage refs for both JSON export items.
9. Run automated verification, fix Step 5 issues, then stage only Step 5 files for Forge review.

## Interfaces and Data Contracts
- `MeshCoreSettingsJson` is a JSON-safe object with at least `radio_settings` and `name`; repeater settings also include `node_type`, `regions`, `owner_info`, and recommended role flags where applicable.
- `createRepeaterConfigExport(input)` returns a discriminated result: success with `{ fileName, settingsJson, warnings }`, or failure with `{ errors }`.
- `createCompanionConfigExport(input)` returns the same result shape and never invents/stores private keys.
- Download filenames must be deterministic and safe: `coloradomesh_meshcore_repeater_config_${safeName}.json` and `coloradomesh_meshcore_companion_config_${safeName}.json`.
- UI download generation uses `Blob` and `URL.createObjectURL` only on user action in client components.
- Existing Step 7 direct Nominatim proxy work is not part of this step; do not change that behavior here unless required by tests.

## Verification Plan
- Automated:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
- Manual:
  - Run the app and use `/tools/repeater-name` with a valid sample to preview/download JSON; inspect the filename and JSON content.
  - Use `/tools/companion-name` with pubkey, role, and numeric suffix samples to preview/download JSON; inspect filenames and JSON content.
  - Verify invalid/over-limit inputs do not offer a successful export.
- Regression:
  - Existing repeater and companion generated-name previews, copy behavior, selectors, and validation messages still work.
  - `/guides/radio-settings` still shows the same canonical values and CLI commands.
  - Step 7 serial-apply scope remains untouched.

## Stop Conditions
- Pause before implementing if upstream fixture shape requires storing or generating private keys.
- Pause before replacing large existing UI datasets with upstream datasets if doing so would change user-facing naming choices beyond JSON export parity.
- Pause before visual redesign; only add minimal preview/download controls in this session.
- Pause if generated JSON cannot be made deterministic from current form inputs without adding new required user inputs.
