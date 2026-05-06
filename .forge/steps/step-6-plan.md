# Step 6 Execution Plan: Redesign homepage and preserve/rebrand core content

## Goal
Deliver the balanced-audience Colorado MeshCore homepage, replace homepage legacy stats/tool embeds with map-derived stats and `/tools` links, and rebrand core content away from Denver MeshCore without deleting legacy routes before Step 7.

## Current Code Observations
- `src/app/page.tsx` still has a legacy Denver MeshCore hero, embeds `NamingWizard` and `PrefixMatrix` inline, and links to `/observer` through the resource card.
- `src/components/StatsSection.tsx` still uses `useStats` and `/api/stats`-shaped `CommunityStats` fields instead of `MapStats` from `/api/map/stats`.
- `/tools` and tool subroutes now exist, so the homepage can demote the inline naming and prefix utilities to cards.
- `src/app/about/page.tsx` still has Denver MeshCore metadata, page headings, community copy, and an `/observer` link.
- `grep` shows stale Denver branding and `/observer` links across route pages, guide pages, use-case pages, blog pages, blog OG image code, MDX posts, and schema helpers.
- `src/app/sitemap.ts` still includes `/observer`, but hard removal is Step 7; this step should avoid deleting the observer route while removing new homepage/content dependence on it.
- `src/lib/map/types.ts` defines `MapStats` with `totalNodes`, `onlineNodes`, `visibleNodes`, `locatedNodes`, `repeaterNodes`, `staleNodes`, `lastUpdated`, `source`, and `connectionState` for homepage metrics.
- There is no dedicated `useMapStats` hook yet; `StatsSection` can fetch `API_ROUTES.MAP_STATS` directly or a small hook can be added if needed.
- This session is Codex-backed, so homepage visual/page-layout implementation must be delegated to native Opus UI via `co-ui`.

## Files to Change
- `src/app/page.tsx` — rewrite homepage structure to Colorado MeshCore, map/tools/guides/Discord CTAs, and no inline tool embeds.
- `src/components/StatsSection.tsx` — replace old `/api/stats` hook usage with map-derived `/api/map/stats` data and honest empty/error states.
- `src/app/about/page.tsx` — rebrand metadata/body copy and replace `/observer` resource links with `/map` or `/tools`.
- `src/app/why-meshcore/page.tsx` — replace stale Denver URLs/brand copy while preserving MeshCore rationale.
- `src/app/guides/*.tsx` — rebrand guide metadata/body copy and replace `/observer` links with `/map` or `/tools`.
- `src/app/use-cases/**/*.tsx` — rebrand use-case metadata/body copy while preserving Colorado/front-range context.
- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/tag/[tag]/page.tsx`, `src/app/blog/[slug]/opengraph-image.tsx` — update blog metadata/labels/OG branding.
- `content/blog/*.mdx` — rebrand visible author/copy and replace `/observer` references with `/map` where the old health article is still retained.
- `src/lib/blog.ts`, `src/lib/schemas/blog.ts`, `src/lib/schemas/howto.ts`, `src/lib/discord.ts` — update user-facing default brand strings if touched by grep results.

## Ordered Implementation Checklist
1. Delegate homepage/page-layout work to native Opus via `co-ui`, with instructions to use existing brand primitives, map stats, `/tools` links, and to avoid deleting `/observer` in this step.
2. Review Opus changes for scope, then inspect diffs before adding any non-visual mechanical fixes.
3. Ensure homepage no longer imports or renders `NamingWizard` or `PrefixMatrix`, and all utility entry points are `/tools/*` cards.
4. Ensure `StatsSection` uses `MapStats` from `API_ROUTES.MAP_STATS`, exposes source/freshness text, and displays no fake fallback numbers on error/empty data.
5. Rebrand core route metadata and visible copy from Denver MeshCore/Denver mesh to Colorado MeshCore/Colorado Mesh while preserving regional details such as Denver, Front Range, and Colorado when contextually meaningful.
6. Replace content links to `/observer` with `/map` or `/tools` for homepage/content pages, but do not delete `src/app/observer/page.tsx` or remove it from sitemap until Step 7.
7. Update blog/MDX author defaults and OG branding to Colorado MeshCore.
8. Run grep guards for stale Denver branding, `denvermc.com`, `/observer`, `useStats`, and old stats API references; classify remaining hits as either Step 7 legacy internals or fix them in this step.
9. Run lint, typecheck, build, and browser validation for homepage, representative content pages, blog, guides, and key CTAs.
10. Stage Step 6 files, request Forge reviewer approval, write `.forge/reviews/claude-step-6.json`, fix findings if any, and commit.

## Interfaces and Data Contracts
- `StatsSection` consumes `GET /api/map/stats` returning `ApiResponse<MapStats>`.
- Homepage links point to `/map`, `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, `/tools/serial-usb`, `/guides/getting-started`, `/guides`, `/blog`, `/about`, and `DISCORD_INVITE_URL`.
- Content pages stay statically renderable; no new server-only runtime config is introduced.
- `/observer` still exists until Step 7, but Step 6 should not promote it in homepage or general content.

## Verification Plan
- Automated: `npm run lint`
- Automated: `npx tsc --noEmit`
- Automated: `npm run build`
- Grep: `grep -R "Denver MeshCore\|Denver mesh\|denvermc.com\|/observer\|useStats\|/api/stats" -n src content public || true`
- Manual: run/use the dev server, open `/`, `/about`, `/why-meshcore`, `/guides`, `/guides/getting-started`, `/guides/naming-standard`, `/blog`, one blog post, and one use-case page.
- Manual: click homepage CTAs for Map, Tools, Guides/Get Started, and Discord; verify no homepage link points to `/observer`.
- Regression: `/map` and `/tools` routes from Steps 4-5 still render and route network requests to `/api/map/*` where applicable.

## Stop Conditions
- If Opus proposes deleting `/observer` or legacy APIs in this step, stop and defer that deletion to Step 7.
- If rebranding would rewrite technical facts about Denver-specific locations, preserve the factual geography and only change the brand/community label.
- If `StatsSection` cannot get map stats without expanding map APIs, pause instead of reintroducing `/api/stats`.
- If content changes require substantial new docs or new routes, pause and update the master plan before proceeding.
