# Step 2 Execution Plan: Global navigation, footer, active state, and accessibility orientation

## Goal
Make the global header, mobile menu, footer, and skip-link orientation reflect the approved IA using the Step 1 metadata foundation.

## Current Code Observations
- `src/components/Navigation.tsx` is a client component with a local `PRIMARY_NAV_LINKS` array: Home, Map, Tools, Guides, Blog, About.
- `src/components/Navigation.tsx` does not use `usePathname`, so desktop links do not expose active/current route state.
- `src/components/MobileMenu.tsx` receives `navLinks` from `Navigation` and preserves focus trap, close button focus, Escape close behavior, and body scroll locking through the parent.
- `src/components/MobileMenu.tsx` does not expose active/current state for mobile links.
- `src/components/Footer.tsx` has separate hardcoded quick/community/resource arrays; quick links partially overlap the approved IA and do not include all first-class tool pages.
- `src/app/layout.tsx` renders `Navigation`, then `<main className="flex-1 pt-16">`, then `Footer`; there is no global skip link or `main` id target.
- `tests/e2e/smoke.spec.ts` currently covers only `/`, `/map`, and `/tools` as critical pages and does not assert nav labels, active states, mobile menu behavior, or skip-link behavior.
- This Codex-backed session must not directly implement visual/frontend aesthetic work; header/footer component implementation should be delegated to Opus UI via `co-ui`.

## Files to Change
- `src/components/Navigation.tsx` — consume metadata-derived primary nav, add active route semantics, pass active state to mobile menu.
- `src/components/MobileMenu.tsx` — expose active route semantics while preserving existing focus trap and Escape close behavior.
- `src/components/Footer.tsx` — derive internal route groups from site metadata while preserving external community/resource links.
- `src/app/layout.tsx` — add a global skip link and `main` target.
- `tests/e2e/smoke.spec.ts` — add smoke coverage for approved nav labels, active state, mobile menu behavior, and skip-link behavior.
- `.forge/steps/step-2-plan.md` — this execution plan.

## Ordered Implementation Checklist
1. Delegate component implementation to Opus UI with a prompt scoped to metadata-driven navigation/footer, active state semantics, skip link, and tests.
2. Replace the hardcoded primary nav array with `getPrimaryNavLinks()` from `src/lib/site.ts` so labels become `Get Started`, `Live Map`, `Tools`, `Guides`, `Learn`, `About`.
3. Add active-route matching for exact routes and section routes: nested `/tools/*` activates Tools, nested `/guides/*` activates Guides, and learning routes such as `/why-meshcore`, `/use-cases`, and `/blog/*` activate Learn.
4. Add `aria-current` and non-disruptive current-state classes to desktop and mobile nav links without introducing a broad visual redesign.
5. Update `MobileMenu` to use the same metadata-derived links and active-state logic while preserving close-on-click, Escape close, and focus wrapping.
6. Update the footer to render internal route groups from `getFooterRouteGroups()` and keep Discord/GitHub/MeshCore docs/LetsMesh external links safe with `target="_blank"` and `rel="noopener noreferrer"`.
7. Add a keyboard-focusable skip link before the fixed header and set the main landmark id to the skip target.
8. Expand Playwright smoke tests for desktop nav labels, active state on `/map`, `/tools/repeater-name`, `/guides/getting-started`, and `/blog`, mobile open/close behavior, and skip link focus/target behavior.
9. Run Step 2 verification and inspect the actual diff for scope drift before staging.

## Interfaces and Data Contracts
- Desktop and mobile primary nav labels must be exactly: `Get Started`, `Live Map`, `Tools`, `Guides`, `Learn`, `About`.
- `getPrimaryNavLinks()` is the single source for primary nav hrefs and labels.
- `getFooterRouteGroups()` is the single source for internal footer route groups.
- Active matching must not mark Home active for every path.
- Learning-section matching must cover `/why-meshcore`, `/use-cases`, `/use-cases/*`, `/blog`, `/blog/*`, and blog tag routes.
- Skip link must point to `#main-content`, and `<main>` must expose `id="main-content"`.
- External links must keep `target="_blank"` and `rel="noopener noreferrer"`.

## Verification Plan
- Automated: `npm run test:e2e -- tests/e2e/smoke.spec.ts`
- Automated: `npm run test:a11y`
- Automated: `npm run typecheck`
- Automated: `npm run build`
- Manual: inspect desktop/mobile navigation behavior and footer grouping in a browser if the automated browser run does not cover a visible state.
- Regression: mobile menu Escape close and focus trap continue to work; existing serial USB, prefix matrix, map diagnostics, and axe smoke tests remain intact.

## Stop Conditions
- If Opus UI changes broad page layout, visual branding, route structure, or unrelated content, stop and narrow or revert before review.
- If active-state tests conflict with current `/start` redirect behavior, defer `/start`-specific active assertions to Step 3 rather than changing `/start` early.
- If Playwright cannot run because browser dependencies are missing or a server conflict exists, document the blocker and run typecheck/build before asking how to proceed.
