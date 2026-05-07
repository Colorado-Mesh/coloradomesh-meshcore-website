# Step 6 Execution Plan: Full 4-character PrefixMatrix parity and reserved/collision logic

## Goal
Replace first-byte-only prefix occupancy with shared 4-character prefix analysis that supports reserved IDs, collision severity, deterministic free suggestions, PrefixMatrix drilldown behavior, and NamingWizard conflict checks.

## Current Code Observations
- `src/components/PrefixMatrix.tsx` fetches `API_ROUTES.MAP_NODES` directly and builds a 256-cell first-byte grid from `publicKey.slice(0, 2)`.
- `src/components/PrefixMatrix.tsx` currently suggests a random second byte for a free first-byte prefix, which is not deterministic and only indirectly produces a 4-character prefix.
- `src/components/NamingWizard.tsx` also fetches `API_ROUTES.MAP_NODES` directly and warns on first-byte usage only.
- `src/hooks/useMapSnapshot.ts` already provides the canonical `/api/map/snapshot` client data source with nodes, connection/source metadata, loading, and error state.
- Upstream `prefix_matrix` builds a primary 2-character grid plus a secondary 16×16 grid for the third/fourth characters, marks reserved IDs, distinguishes repeater/room-server duplicate conflicts, and searches across node metadata.
- `src/lib/parity/manifest.ts` has `prefix-matrix-4-character-planning` as planned with only `src/components/PrefixMatrix.tsx` listed.
- Existing tests use Vitest for pure helpers and Playwright for critical route smoke; no prefix-specific tests exist yet.

## Files to Change
- `src/lib/meshcore-tools/prefixes.ts` — add pure prefix normalization, analysis, reserved/collision logic, search, and deterministic suggestion helpers.
- `src/lib/meshcore-tools/__tests__/prefixes.test.ts` — cover reserved IDs, collisions, rollups, search, malformed keys, and deterministic suggestions.
- `src/components/PrefixMatrix.tsx` — consume `useMapSnapshot`, display primary 2-character rollups and selected 4-character subgrid from shared analysis, use deterministic suggestions, and keep existing visual styling patterns.
- `src/components/NamingWizard.tsx` — consume `useMapSnapshot` and shared 4-character analysis for public-key conflict/reserved warnings instead of first-byte checks.
- `src/app/tools/prefix-matrix/page.tsx` — update copy/API tag to describe 4-character planning from `/api/map/snapshot`.
- `src/lib/parity/manifest.ts` — mark PrefixMatrix parity implemented and include helper/test/component refs.
- `tests/e2e/smoke.spec.ts` — add prefix page smoke coverage for loading, searching, and deterministic suggestion/select behavior.

## Ordered Implementation Checklist
1. Add `prefixes.ts` with `normalizePublicKeyPrefix`, `buildPrefixAnalysis`, `searchPrefixAnalysis`, `suggestFreePrefix`, stable reserved-prefix data, role/status helpers, and typed analysis results.
2. Add Vitest coverage for exact 4-character collisions, repeater/room-server collision severity, reserved two-character and four-character IDs, malformed public keys, primary rollups, search matches, and deterministic suggestions.
3. Refactor `PrefixMatrix` to call `useMapSnapshot`, derive prefix analysis with `useMemo`, render the existing primary 16×16 grid plus a selected secondary 16×16 grid, and call `onSelectPrefix` only with available 4-character prefixes.
4. Refactor `NamingWizard` to use `useMapSnapshot` and `buildPrefixAnalysis`, then show full 4-character uniqueness, collision, crowding, reserved, and incomplete states from the shared helper.
5. Update the prefix matrix page copy and parity manifest refs/status.
6. Extend Playwright smoke tests for `/tools/prefix-matrix` without relying on external services.
7. Run lint, typecheck, unit tests, e2e smoke, and build; fix scoped issues before staging/review.

## Interfaces and Data Contracts
- `normalizePublicKeyPrefix(value, length = 4): string | null` returns uppercase hex prefixes only when enough hex characters exist.
- `buildPrefixAnalysis(nodes, options?)` returns primary cells keyed by first two chars, secondary cells keyed by full four chars, counts, collision severity, reserved status, active/inactive state, and searchable node metadata.
- `suggestFreePrefix(analysis, options?)` returns a deterministic available 4-character prefix, never a reserved or occupied prefix.
- Prefix UI consumes `useMapSnapshot()` instead of `API_ROUTES.MAP_NODES`.
- NamingWizard public-key warnings are derived from the same `buildPrefixAnalysis` output used by PrefixMatrix.

## Verification Plan
- Automated: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run build`.
- Manual: open `/tools/prefix-matrix`, verify primary grid, select a prefix byte, inspect 4-character cells, search for a sample node/prefix, suggest a free prefix, and verify the repeater naming tool warns on occupied/reserved/crowded prefixes.
- Regression: existing repeater/companion JSON tests, map page smoke tests, and critical page accessibility smoke should continue to pass.

## Stop Conditions
- If upstream reserved ID source cannot be represented locally without importing unavailable runtime data, use a small typed static reserved list and record the limitation in manifest notes rather than guessing a large hidden registry.
- If functional changes require substantial visual redesign of the PrefixMatrix layout, pause and delegate that UI work to Opus UI.
- If Playwright e2e cannot reliably exercise dynamic grid interactions due to dev-server timing, keep deterministic unit coverage and add only stable page smoke assertions.
