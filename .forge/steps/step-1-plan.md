# Step 1 Execution Plan: Brand foundation, runtime configuration, and URL baseline

## Goal
Establish Colorado MeshCore brand/runtime constants, update app-shell metadata and generated discovery files, move CI/security runtime declarations to Node 24, and add a reusable typecheck script.

## Current Code Observations
- `src/lib/constants.ts` is the main shared constants file but still identifies the app as Denver MeshCore, uses `https://denvermc.com`, points GitHub to a personal account, and names the bot as `denvermc.com BOT`.
- `src/app/layout.tsx` hard-codes Denver MeshCore in metadata, OpenGraph, Twitter handles, author/publisher fields, and logo alt text instead of consuming constants.
- `src/components/JsonLd.tsx` hard-codes Denver MeshCore organization/community names, Discord URL, logo path, and Denver-specific schema comments.
- `src/app/sitemap.ts` uses `BASE_URL` correctly but still includes `/observer`; full removal is Step 7, so this step will not remove it yet.
- `src/app/feed.xml/route.ts`, `public/manifest.json`, `public/robots.txt`, `public/_headers`, and `netlify.toml` contain stale Denver naming or `denvermc.com` URLs.
- `.github/workflows/ci.yml` and `.github/workflows/security.yml` both use `node-version: '20'`.
- `package.json` lacks a `typecheck` script and an `engines.node` declaration; local Node is `v25.8.2`, which satisfies the planned `>=24 <26` range.
- Broad grep shows many Denver references in pages/content that are intentionally covered by later content redesign/rebrand steps, not this foundation step.

## Files to Change
- `src/lib/constants.ts` — add central brand/runtime config while preserving existing named exports for current callers.
- `src/app/layout.tsx` — consume brand constants for metadata/OpenGraph/Twitter/image alt text.
- `src/components/JsonLd.tsx` — consume brand/link constants for schema data and remove Denver-specific schema strings.
- `src/app/feed.xml/route.ts` — use shared description/community naming.
- `public/manifest.json` — update PWA app name/short name/description.
- `public/robots.txt` — update comments and sitemap URL.
- `public/_headers` — update stale file comment only.
- `.github/workflows/ci.yml` — update Node 24 and use `npm run typecheck`.
- `.github/workflows/security.yml` — update Node 24.
- `netlify.toml` — update stale app comment and Node version to 24 while leaving broader Netlify migration for Docker step.
- `package.json` — add `typecheck` script and `engines.node`.
- `package-lock.json` — mirror root package engine metadata if needed.

## Ordered Implementation Checklist
1. Rewrite `src/lib/constants.ts` to export `BRAND`, `RUNTIME_ENV`, `API_ROUTES`, and backwards-compatible named constants for existing imports.
2. Update `src/app/layout.tsx` metadata fields to reference constants and Colorado MeshCore naming.
3. Update `src/components/JsonLd.tsx` schemas to reference constants for organization/community names, URLs, logos, Discord, and descriptions.
4. Update feed, manifest, robots, `_headers`, Netlify config, and GitHub workflows for the Step 1 brand/runtime baseline.
5. Add `typecheck` and `engines.node` to `package.json`, and keep `package-lock.json` root metadata in sync.
6. Run grep guards for Step 1 stale strings in touched files and leave later-step page/content references untouched.
7. Run lint, typecheck, and build; fix any Step 1 regressions.
8. Stage only Step 1 files, request Forge reviewer review, save review JSON, fix findings if needed, then commit.

## Interfaces and Data Contracts
- `BRAND.baseUrl` resolves from `NEXT_PUBLIC_SITE_URL` when set, otherwise `https://meshcore.coloradomesh.org`.
- Existing imports of `BASE_URL`, `SITE_NAME`, `SITE_TAGLINE`, `SITE_DESCRIPTION`, `DISCORD_INVITE_URL`, `MESHCORE_DOCS_URL`, `LETSMESH_URL`, `GITHUB_ORG_URL`, `API_ROUTES`, and threshold constants remain valid.
- New runtime env names are exported in `RUNTIME_ENV`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MAP_TILE_URL`, `MESHCORE_MQTT_URL`, `MESHCORE_MQTT_USERNAME`, `MESHCORE_MQTT_PASSWORD`, `MESHCORE_MQTT_TOPIC`, `MESHCORE_MQTT_CLIENT_ID`, `MESHCORE_MAP_HISTORY_ENABLED`, and `MESHCORE_MAP_SAMPLE_DATA`.
- CI/security workflows use Node 24.
- `npm run typecheck` runs `tsc --noEmit`.

## Verification Plan
- Automated: `npm run lint`, `npm run typecheck`, `npm run build`.
- Grep: `grep -R "Denver MeshCore\|denvermc.com\|@denver_meshcore\|node-version: '20'\|NODE_VERSION = \"20\"" -n src/lib/constants.ts src/app/layout.tsx src/components/JsonLd.tsx src/app/feed.xml/route.ts public/manifest.json public/robots.txt public/_headers .github/workflows package.json package-lock.json netlify.toml || true`.
- Manual: No browser validation is required for this foundation-only step; page-source/browser checks are scheduled after visual and route work, but build metadata must compile.
- Regression: Existing callers of constants must continue compiling without import changes.

## Stop Conditions
- Pause if adding `engines.node >=24 <26` conflicts with installed dependencies during `npm ci`/build.
- Pause if metadata needs a real social handle that is not known; do not invent a Colorado Mesh social account.
- Pause if Step 1 changes would require removing `/observer` or legacy APIs, because those are reserved for later steps.
