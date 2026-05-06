# Step 7 Execution Plan: Remove legacy observer and Turso metrics

## Goal
Hard-remove the old `/observer` surface, legacy `/api/health`, `/api/stats`, `/api/nodes`, and Turso/bot-derived metric pipeline now that the homepage, map, and tools use `/api/map/*`.

## Current Code Observations
- `src/app/observer/page.tsx` is the only app route using `ObserverStats`, `NetworkHealthCard`, and `TopContributors`.
- `src/app/sitemap.ts` still includes `/observer`; content and navigation no longer promote it after Step 6.
- Legacy public API routes are concentrated in `src/app/api/health`, `src/app/api/stats`, `src/app/api/nodes`, and `src/app/api/cleanup`.
- `src/app/api/discord-webhook/route.ts` still calls `/api/health` and stores legacy health state through `src/lib/db`, so keeping it would preserve the old health pipeline.
- `src/components/ObserverStats.tsx`, `src/components/NetworkHealthCard.tsx`, `src/components/TopContributors.tsx`, and `src/hooks/useStats.ts` only support the old observer/health pages.
- `src/lib/db`, `src/lib/bot-api.ts`, and `src/lib/discord.ts` are only referenced by the old health/stat/node/cleanup/discord routes after Step 6.
- `netlify/functions/discord-scheduled.ts`, `netlify/functions/discord-status-check.ts`, and `netlify/functions/scheduled-cleanup.ts` only call the old deleted `/api/discord-webhook` and `/api/cleanup` routes.
- `services/mqtt-collector` is the old Turso/libSQL MQTT collector service and is coupled to the removed database schema, `@libsql/client`, and `TURSO_*` runtime variables.
- `README.md` still documented the removed Denver/Turso/observer architecture and legacy API table.
- `src/lib/db/migrations` still contained legacy Turso migration SQL after the DB layer removal.
- `src/lib/map/normalize.ts` still exports `normalizeLegacyNode` only for the staged Turso migration path; it is unused by the live map APIs and can be removed to drop `NodeWithStats` imports.
- `src/lib/types.ts` still contains legacy Turso database, health, Discord webhook, and helper types; the active map/tool routes only need the map type exports plus `ApiResponse`.
- `API_ROUTES.NODES`, `API_ROUTES.STATS`, `API_ROUTES.HEALTH`, `API_ROUTES.PACKETS`, `API_ROUTES.DISCORD_WEBHOOK`, `API_CACHE_TIMES`, and `OBSERVER_REFRESH_INTERVAL` are stale after this removal.

## Files to Change
- Delete `src/app/observer/page.tsx`.
- Delete legacy routes under `src/app/api/health`, `src/app/api/stats`, `src/app/api/nodes`, `src/app/api/cleanup`, and `src/app/api/discord-webhook`.
- Delete observer-only components: `src/components/ObserverStats.tsx`, `src/components/NetworkHealthCard.tsx`, `src/components/TopContributors.tsx`.
- Delete `src/hooks/useStats.ts` and remove its export from `src/hooks/index.ts`.
- Delete legacy support modules if no active imports remain: `src/lib/db`, `src/lib/bot-api.ts`, and `src/lib/discord.ts`.
- Delete legacy Netlify scheduled functions under `netlify/functions` that call removed cleanup/Discord webhook APIs.
- Delete `services/mqtt-collector` because it writes to the removed Turso schema and is no longer part of the Docker-primary map runtime.
- Update `src/components/index.ts` to remove deleted component exports.
- Update `src/app/sitemap.ts` to remove `/observer`.
- Update `src/lib/constants.ts` to remove legacy route/cache/observer constants.
- Update `src/lib/map/normalize.ts` and `src/lib/map/index.ts` to remove the unused legacy-node normalizer.
- Reduce `src/lib/types.ts` to active map exports and shared API wrappers.
- Delete leftover `src/lib/db/migrations` SQL files with the rest of the removed DB layer.
- Update package dependencies and scripts if `@libsql/client`, `@netlify/functions`, and `db:migrate` become unused.
- Remove or update stale internal README files and root `README.md` references that document deleted APIs/components.

## Ordered Implementation Checklist
1. Delete the old observer page and observer-only components/hook.
2. Delete legacy health/stats/nodes/cleanup/discord API routes and their old DB/bot/discord support modules.
3. Delete Netlify scheduled functions and the Turso MQTT collector that only target the removed routes/schema.
4. Remove exports/imports/constants that pointed to the deleted observer, legacy APIs, and DB migration script.
5. Remove the unused `normalizeLegacyNode` path and legacy Turso/health types from `src/lib/types.ts`.
6. Update or remove internal README files and root README references that document deleted APIs/components so grep results reflect active behavior.
7. Delete leftover Turso migration SQL files with the rest of `src/lib/db`.
8. Remove unused legacy dependencies/scripts from `package.json` and refresh `package-lock.json` through npm.
9. Run the legacy-reference grep guard and fix active-source hits, allowing only route text that remains valid such as `/api/map/*`.
10. Run lint, typecheck, and build.
11. Manually validate that `/observer`, `/api/health`, `/api/stats`, and `/api/nodes` return 404 while `/`, `/map`, `/tools`, `/api/map/nodes`, and `/api/map/stats` still work.
12. Stage specific Step 7 files, request Forge review, save `.forge/reviews/claude-step-7.json`, and commit if approved.

## Interfaces and Data Contracts
- Supported public live-data endpoints after this step are `GET /api/map/nodes` and `GET /api/map/stats`.
- Removed routes intentionally return 404 with no redirects: `/observer`, `/api/health`, `/api/health/history`, `/api/stats`, `/api/nodes`, `/api/nodes/[id]`, `/api/cleanup`, and `/api/discord-webhook`.
- `src/lib/types.ts` remains the import location for `ApiResponse` and map types used by active components/routes.
- `src/lib/map/normalize.ts` supports live-map-like payloads only; Turso `NodeWithStats` normalization is removed.

## Verification Plan
- Automated: `npm run lint`
- Automated: `npx tsc --noEmit`
- Automated: `npm run build`
- Grep: `grep -R "ObserverStats\|NetworkHealthCard\|TopContributors\|useStats\|/observer\|/api/stats\|/api/health\|/api/nodes\|@libsql/client\|@netlify/functions\|TURSO_" -n src content public package.json package-lock.json .github README.md 2>/dev/null || true`
- Manual: run the production server and verify removed routes 404.
- Manual: fetch `/api/map/nodes` and `/api/map/stats` and verify they still return `success: true` payloads.
- Regression: open `/`, `/map`, `/tools`, and representative content pages to confirm no removed links or legacy network requests remain.

## Stop Conditions
- If an active, non-legacy route still requires Turso data after deleting the old API routes, pause and update the master plan instead of silently preserving duplicate metrics.
- If removing `src/lib/db` breaks map/tool behavior, revert the DB deletion and inspect the import path before proceeding.
- If package-lock changes show unrelated dependency churn beyond removing unused legacy packages, stop and inspect before committing.
- If manual validation shows the homepage, map, or tools still request deleted endpoints, fix the caller before review.
