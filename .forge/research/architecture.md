# Architecture Research: Submodule-Backed MeshCore Utilities Integration

Project: integrate `https://github.com/Colorado-Mesh/meshcore-utilities-site` into the existing Colorado MeshCore Next.js 16 / React 19 / Tailwind 4 public site while preserving upstream updateability and the local design system.

### ITEM-architecture-1: Treat the upstream repo as a pinned source dependency, not a runtime app

- **Recommendation:** Add the upstream repository as a Git submodule at a clearly non-routable path such as `vendor/meshcore-utilities-site`, track its `main` branch in `.gitmodules`, and commit only the submodule pointer plus local integration/generation changes.
- **Rationale:** The upstream project is a Flask/Python app with templates, static JS/CSS, and data files; this site is a Next.js App Router application. The clean boundary is to pin upstream as source material and adapt its data/logic into local Next components, not to run two web apps inside one public-site surface. Official Git submodule workflow supports `git submodule add -b main`, `git submodule update --init --recursive`, and `git submodule update --remote` for pulling remote-tracking changes, then recording the new submodule commit in the superproject.
- **Confidence:** HIGH
- **Source:** Official docs + GitHub inspection — https://git-scm.com/docs/git-submodule.html ; https://github.com/Colorado-Mesh/meshcore-utilities-site
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not copy the upstream repo contents into `src/` by hand; that destroys update provenance. Do not deploy the Flask app as a reverse-proxied/iframe utility island; it creates styling, CSP, auth, routing, and operational drift inside a single public website.

### ITEM-architecture-2: Use a local adapter/generator boundary between upstream files and Next code

- **Recommendation:** Create a small adapter layer, e.g. `src/lib/upstream-utilities/`, plus an import/verification script that reads from `vendor/meshcore-utilities-site` and emits typed local artifacts under `src/lib/meshcore-data` or `src/lib/meshcore-tools/generated`. Keep hand-written integration code in `src/components/tools`, `src/lib/meshcore-tools`, and App Router pages.
- **Rationale:** The existing site already has deterministic TypeScript utility domains (`src/lib/meshcore-tools/*`, `src/lib/meshcore-data/*`) and a parity manifest. Upstream supplies Python models/routes plus static JSON/JS. A generator boundary lets upstream changes be pulled forward while preserving local type safety, unit tests, and UI conventions. It also makes upstream drift visible as diffs in generated artifacts or parity tests.
- **Confidence:** HIGH
- **Source:** Codebase + GitHub inspection — `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/meshcore-tools/config-export.ts`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/parity/manifest.ts`; https://github.com/Colorado-Mesh/meshcore-utilities-site
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not import upstream Python or browser scripts directly into React components. Do not make the submodule itself part of the TypeScript app structure; keep it as an external source dependency with explicit adapters.

### ITEM-architecture-3: Prefer build-time generated JSON/TS artifacts over runtime reads from the submodule

- **Recommendation:** For stable upstream utility data such as `static/data/default_serial_commands.json`, `serial_commands.schema.json`, `static/data/recommended_settings.json`, region/emoji data, and naming constants, ingest them at build/update time into local typed modules and validate them with the existing test stack. Runtime pages should import local TS/JSON modules, not read files from the submodule on demand.
- **Rationale:** The current Next config uses `output: 'standalone'`, and Next standalone output traces server dependencies/files during build. Runtime `fs` reads into submodule paths are easy to omit from file tracing and Docker images unless `outputFileTracingIncludes` is carefully configured. Build-time generation keeps deployed runtime small and predictable, and generated diffs make upstream updates reviewable.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://nextjs.org/docs/app/api-reference/config/next-config-js/output ; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js`; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Avoid runtime `fs.readFile` from `vendor/meshcore-utilities-site` for public tool data unless there is a strong reason; if used, add narrow `outputFileTracingIncludes` and a Docker smoke test. Avoid serving raw upstream JSON from `public/` unless it truly must be public and cache headers are intentionally managed.

### ITEM-architecture-4: Preserve `/tools` as the canonical route family and adapt upstream route names only as aliases

- **Recommendation:** Keep the current public Next routes as canonical: `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, and `/tools/serial-usb`. If upstream users expect Flask paths like `/repeater_name_tool`, add explicit redirects or compatibility route handlers, but do not expose the Flask URL shape as the primary IA.
- **Rationale:** Next App Router uses folders as URL segments, and this codebase already has well-structured `/tools/*` pages with metadata, breadcrumbs, JSON-LD, and design-system wrapping. Route groups can organize implementation without changing URLs, but they are unnecessary unless the tools need a subset layout. Multiple root layouts would create full page reloads between sections and should be avoided for this unified public site.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://nextjs.org/docs/app/getting-started/project-structure ; https://nextjs.org/docs/app/api-reference/file-conventions/route-groups ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/tools/page.tsx`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not mirror upstream Flask routes one-for-one as the main Next routes. Do not introduce a separate root layout for utilities unless intentionally accepting full page reloads and a different app shell.

### ITEM-architecture-5: Keep Server Component shells and Client Component tool islands

- **Recommendation:** Render each utility page as a Server Component shell for metadata, SEO, JSON-LD, breadcrumbs, and shared layout, then mount a focused Client Component for interactive workflows such as naming, prefix analysis, serial USB, and browser-side key generation.
- **Rationale:** Next’s `'use client'` boundary is intended for state, event handlers, and browser APIs; props passed into Client Components must be serializable. This matches the current pattern: `src/app/tools/repeater-name/page.tsx` is a server page that renders `ToolShell` and mounts `NamingWizard`, while `NamingWizard` owns state, clipboard, fetch, and generated download behavior.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://nextjs.org/docs/app/api-reference/directives/use-client ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/tools/repeater-name/page.tsx`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/NamingWizard.tsx`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not make the whole tools area client-rendered; it weakens SEO and consistency. Do not pass functions/classes from server code into client components; use serializable data and local client handlers.

### ITEM-architecture-6: Put browser-only and secret-sensitive workflows entirely in client islands

- **Recommendation:** Keep Web Serial access, clipboard/download behavior, and vanity/private-key generation in `'use client'` components. Server APIs may provide public data or validation, but private keys and raw device interaction must not traverse Next route handlers.
- **Rationale:** Upstream explicitly generates key material client-side to avoid server knowledge of secrets, and this site already blocks private/secret/password fields in serial settings application. Browser APIs like Web Serial and Web Crypto belong behind client boundaries, while the server shell can still provide documentation and structured data.
- **Confidence:** HIGH
- **Source:** GitHub inspection + codebase inspection — https://github.com/Colorado-Mesh/meshcore-utilities-site/blob/main/static/js/repeater_name_tool.js ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/meshcore-tools/serial-settings.ts`; https://nextjs.org/docs/app/api-reference/directives/use-client
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not port upstream key generation to a server route. Do not send uploaded settings containing private/secret/password fields to the server for convenience.

### ITEM-architecture-7: Use Route Handlers only for bounded server responsibilities

- **Recommendation:** Add or keep App Router `route.ts` handlers only where the utility needs server-side mediation: external geocoding/rate limiting, map data snapshots, compatibility redirects, or serving validated generated data with explicit cache headers. Pure deterministic utility logic should remain local TS functions used by Client Components and unit tests.
- **Rationale:** Next Route Handlers support Web `Request`/`Response`, HTTP methods, query parsing, and segment config. They are a good fit for the existing `/api/geocode` and `/api/map/*` style boundaries, but overusing them for every upstream Flask endpoint would recreate the upstream backend unnecessarily.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://nextjs.org/docs/app/api-reference/file-conventions/route ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/api/geocode/route.ts`; `/Users/cjvana/Documents/GitHub/denvermc-org/README.md`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not rebuild Flask blueprints as a parallel Next API surface unless a client workflow truly needs server mediation. Do not expose broad CORS/public APIs for internal utility calculations.

### ITEM-architecture-8: Drive design-system adaptation from local shells, not upstream CSS/templates

- **Recommendation:** Recreate upstream utility experiences using local brand components (`HeroPanel`, `ToolShell`, `ToolCard`, panels, buttons, form styles) and Tailwind/design tokens. Treat upstream templates/CSS as functional reference only, and delegate final visual implementation to `co-ui`/native Opus UI per project constraint.
- **Rationale:** The existing site has a mature dark operations-console design system in `globals.css` plus brand components. Importing upstream Flask templates and CSS would bypass accessibility, navigation, metadata, and public-site polish standards. The local architecture should expose clean props/data/contracts so UI work can be delegated without entangling upstream files.
- **Confidence:** HIGH
- **Source:** Codebase inspection — `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/globals.css`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/ToolShell.tsx`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/brand/ToolCard.tsx`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not iframe `tools.meshcore.coloradomesh.org` or paste upstream CSS into the app. Do not hand-code a new visual system in the Codex-backed session; provide architecture and contracts for UI delegation.

### ITEM-architecture-9: Make upstream updates a repeatable, test-gated workflow

- **Recommendation:** Add a documented script/workflow roughly equivalent to: initialize submodule, update from upstream `main`, run the generator/parity checks, run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`, then commit the submodule pointer and any generated/local integration diffs together. Add CI checks that fail when the submodule is missing or generated artifacts are stale.
- **Rationale:** Submodule updates are explicit: `git submodule update --remote` moves the submodule worktree to a remote-tracking commit, and the superproject records that commit only after `git add <submodule-path>`. Without a repeatable workflow, maintainers will either forget to pull upstream data forward or silently drift from it.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://git-scm.com/docs/git-submodule.html ; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/parity/manifest.ts`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not rely on developers manually inspecting upstream diffs with no generated parity output. Do not auto-track upstream HEAD at runtime; pin and review each submodule pointer bump.

### ITEM-architecture-10: Keep deployment submodule-aware but runtime submodule-independent

- **Recommendation:** Ensure all build environments initialize submodules before build, but design the deployed standalone Next runtime so it does not require the submodule directory to be present. Docker/CI should fail early if `vendor/meshcore-utilities-site` is absent when generation/parity checks run.
- **Rationale:** The Dockerfile copies the repository into a builder stage and then copies only `public`, `.next/standalone`, and `.next/static` into the runner. This is good if submodule-derived outputs are built into local artifacts; it is fragile if runtime code expects the submodule path. Next standalone tracing can include extra files, but narrow generated artifacts are simpler than tracing an entire upstream repo.
- **Confidence:** HIGH
- **Source:** Official docs + codebase inspection — https://nextjs.org/docs/app/api-reference/config/next-config-js/output ; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not ship the whole upstream repo in the production image by default. Do not assume platform checkouts include submodules unless CI/build config explicitly initializes them.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-architecture-1 | HIGH | Official docs + GitHub inspection | https://git-scm.com/docs/git-submodule.html ; https://github.com/Colorado-Mesh/meshcore-utilities-site |
| ITEM-architecture-2 | HIGH | Codebase + GitHub inspection | `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/meshcore-tools/config-export.ts`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/parity/manifest.ts`; https://github.com/Colorado-Mesh/meshcore-utilities-site |
| ITEM-architecture-3 | HIGH | Official docs + codebase inspection | https://nextjs.org/docs/app/api-reference/config/next-config-js/output ; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js` |
| ITEM-architecture-4 | HIGH | Official docs + codebase inspection | https://nextjs.org/docs/app/getting-started/project-structure ; https://nextjs.org/docs/app/api-reference/file-conventions/route-groups ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/tools/page.tsx` |
| ITEM-architecture-5 | HIGH | Official docs + codebase inspection | https://nextjs.org/docs/app/api-reference/directives/use-client ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/tools/repeater-name/page.tsx` |
| ITEM-architecture-6 | HIGH | GitHub + codebase inspection | https://github.com/Colorado-Mesh/meshcore-utilities-site/blob/main/static/js/repeater_name_tool.js ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/lib/meshcore-tools/serial-settings.ts` |
| ITEM-architecture-7 | HIGH | Official docs + codebase inspection | https://nextjs.org/docs/app/api-reference/file-conventions/route ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/api/geocode/route.ts` |
| ITEM-architecture-8 | HIGH | Codebase inspection | `/Users/cjvana/Documents/GitHub/denvermc-org/src/app/globals.css`; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/ToolShell.tsx` |
| ITEM-architecture-9 | HIGH | Official docs + codebase inspection | https://git-scm.com/docs/git-submodule.html ; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json` |
| ITEM-architecture-10 | HIGH | Official docs + codebase inspection | https://nextjs.org/docs/app/api-reference/config/next-config-js/output ; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile` |
