# Step 3 Execution Plan: Wire deterministic utility logic to generated upstream-derived data

## Goal
Make local MeshCore utility logic consume or assert against the generated upstream artifacts from `@/lib/upstream-utilities` while preserving deterministic local APIs and serial safety behavior.

## Current Code Observations
- `src/lib/meshcore-data/settings.ts` still hard-codes Colorado radio settings and manual provenance, but Step 2 now exposes generated upstream recommended settings and provenance.
- `src/lib/meshcore-data/regions.ts` derives local region codes from `src/lib/data/airports`; Step 2 generated upstream regions include an `airports` collection with matching airport codes plus broader city/alternative data that should not all become local region codes yet.
- `src/lib/tools/serial-commands.ts` still defines a hand-copied `DEFAULT_SERIAL_COMMAND_PROFILE`; generated upstream serial profile now exists and can be adapted into the local `SerialCommandProfile` shape.
- Upstream serial line endings use symbolic values (`CRLF`, `CR`, `LF`, `NONE`), while local serial command types use actual line-ending strings.
- Upstream serial steps use `delayMs`; local wait steps use `durationMs`.
- Existing serial settings conversion remains conservative and blocks private/secret/password keys; Step 3 should preserve that and add generated-profile assertions, not broaden automatic writes.
- Config export tests already assert local radio settings match `UPSTREAM_UTILITIES_RECOMMENDED_SETTINGS`.

## Files to Change
- `src/lib/meshcore-data/settings.ts` — source canonical radio settings and provenance from generated upstream artifacts.
- `src/lib/meshcore-data/regions.ts` — derive local region list from generated upstream airport regions.
- `src/lib/tools/serial-commands.ts` — adapt generated upstream serial command profile into local `SerialCommandProfile`.
- `src/lib/meshcore-tools/__tests__/config-export.test.ts` — add generated regions/provenance assertions.
- `src/lib/meshcore-tools/__tests__/serial-settings.test.ts` — add generated serial profile and safety assertions.
- `src/lib/parity/manifest.ts` — update notes/coverage if Step 3 changes parity meaning.

## Ordered Implementation Checklist
1. Import generated recommended settings/provenance in `settings.ts`, map snake_case fields to `MeshCoreRadioSettings`, and expose provenance with submodule path/SHA.
2. Import generated regions in `regions.ts`, map only upstream `airports` to local region codes/labels, and keep sorting/case behavior stable.
3. Import generated serial command profile in `serial-commands.ts` and add a narrow adapter for serial config, line endings, actions, send steps, and wait steps.
4. Preserve local safety overrides in the adapter, including confirmation on region management if upstream data marks it non-confirmed.
5. Add tests proving local settings/regions align with generated upstream artifacts and provenance includes the generated upstream SHA/source.
6. Add tests proving the default serial command profile is generated-backed, line endings are mapped, generated actions are present, and state-changing/destructive actions remain confirmation-gated.
7. Rerun utilities check, targeted unit tests, typecheck, and lint.

## Interfaces and Data Contracts
- `COLORADO_MESH_RADIO_SETTINGS` remains a `MeshCoreRadioSettings` constant with camelCase fields.
- `buildRadioSettingsJson()` still returns snake_case upstream-compatible radio settings.
- `COLORADO_MESH_REGIONS`, `COLORADO_MESH_REGION_CODES`, and `isColoradoMeshRegionCode()` keep their public behavior.
- `DEFAULT_SERIAL_COMMAND_PROFILE` remains a local `SerialCommandProfile`; it is adapted from generated upstream JSON and must not expose raw upstream JSON shapes to components.
- Serial line ending mapping: `CRLF -> '\r\n'`, `CR -> '\r'`, `LF -> '\n'`, `NONE -> ''`.

## Verification Plan
- Automated: `npm run utilities:check`; `npm run test:unit -- --run src/lib/meshcore-tools/__tests__/config-export.test.ts src/lib/meshcore-tools/__tests__/serial-settings.test.ts src/lib/parity/__tests__/manifest.test.ts`; `npm run typecheck`; `npm run lint`.
- Manual: inspect imports to confirm runtime code imports only generated artifacts, not `vendor/`.
- Regression: serial settings JSON apply remains confirmation-gated and private/secret/password blocking remains unchanged.

## Stop Conditions
- Pause if generated airport regions do not preserve the existing local region code set.
- Pause if adapting upstream serial commands would require enabling destructive commands without confirmation.
- Pause if generated data shape forces broad UI or component API changes.
- Pause if any runtime code would need direct `vendor/` filesystem imports.
