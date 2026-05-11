# Stack Research: Submodule-backed MeshCore Utilities Integration

Project: add `https://github.com/Colorado-Mesh/meshcore-utilities-site` as a git submodule and redesign/integrate the utilities experience into the existing Colorado MeshCore public website. Current host app is a brownfield Next.js 16 / React 19 / Tailwind CSS 4 site with Node 24, npm, TypeScript, Vitest, Playwright, Lighthouse CI, Docker standalone output, and Netlify configuration.

### ITEM-stack-1: Keep the host stack as Next.js 16 App Router on Node 24

- **Recommendation:** Build the integrated utilities inside the existing Next.js App Router application using the current Node.js 24/npm runtime. Use Server Component page shells for metadata/layout and focused Client Components for interactive tools.
- **Rationale:** The project is brownfield and already runs `next@^16.2.5`, `react@19.2.3`, `react-dom@19.2.3`, strict TypeScript, App Router routes under `src/app`, and `output: 'standalone'`. Official Next.js 16 docs show App Router as the current full-stack model and document Node.js server/Docker deployments as supporting all Next.js features. Replatforming to the upstream Flask runtime would add a second production app and fight the existing public-site design and CI.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://nextjs.org/docs/app/getting-started ; https://nextjs.org/docs/app/getting-started/deploying ; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not mount the upstream Flask app as the primary runtime. Do not create a separate SPA/Vite app for utilities; it would duplicate routing, layout, CSP, SEO, and deployment concerns already solved by the host site.

### ITEM-stack-2: Use React 19.2 Client Components for browser-only utility islands

- **Recommendation:** Keep React 19.2 and implement interactive utility flows as explicit `'use client'` islands: naming wizard, prefix matrix, serial USB console, settings JSON preview/apply, file upload/download, clipboard, and any future browser-side key generation.
- **Rationale:** React 19 is stable and aligned with modern Next.js features. The existing package already pins React 19.2.3, while npm currently reports React 19.2.6; this small patch drift does not justify a stack change for the integration. Browser APIs such as Web Serial, clipboard, `Blob`, and file inputs cannot run in Server Components and should remain isolated behind client boundaries.
- **Confidence:** HIGH
- **Source:** Official docs + npm registry + codebase — https://react.dev/blog/2024/12/05/react-19 ; `npm view react version` => 19.2.6 ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/SerialUsbTool.tsx`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not make the entire tools section client-rendered. Do not introduce another UI runtime such as Vue/Svelte/vanilla-microfrontend solely to consume upstream static scripts.

### ITEM-stack-3: Keep TypeScript strict with local typed adapters and Zod validation

- **Recommendation:** Keep TypeScript as the implementation language for host integration code, with strict mode, route-aware Next types where useful, and Zod for validating imported upstream JSON/config schemas before generating local typed artifacts.
- **Rationale:** The existing repo is already TypeScript-first (`strict: true`, `moduleResolution: bundler`, `@/*` path alias), and Next.js 16 has built-in TypeScript support plus App Router type helpers. Upstream utility data includes JSON files and schemas; validating them during generation/parity checks gives safer upstream pull-forward than importing raw Python/static JS behavior.
- **Confidence:** HIGH
- **Source:** Official docs + codebase + npm registry — https://nextjs.org/docs/app/api-reference/config/typescript ; `/Users/cjvana/Documents/GitHub/denvermc-org/tsconfig.json` ; `npm view typescript version` => 6.0.3 ; `npm view zod version` => 4.4.3
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not rewrite host utility logic in Python to match upstream. Do not accept untyped JSON imports from the submodule without validation; upstream data/schema changes should fail visibly in tests or generation.

### ITEM-stack-4: Use the upstream repository as a Git submodule under `vendor/`, not as an npm workspace initially

- **Recommendation:** Add `Colorado-Mesh/meshcore-utilities-site` as a Git submodule at `vendor/meshcore-utilities-site` tracking `main`, and use scripts/parity tests to read selected upstream files. Do not add it to npm workspaces unless upstream later exposes a real package with a `package.json`.
- **Rationale:** Official Git submodule docs support pinning an external repo to an exact commit and advancing it deliberately with `git submodule update --remote`. The upstream repo is a Flask app with `app.py`, `templates`, `static`, `requirements.txt`, and no `package.json`, so npm workspaces would add no value today. A vendor path makes the external boundary obvious and prevents accidental Next routing/imports.
- **Confidence:** HIGH
- **Source:** Official docs + GitHub inspection — https://git-scm.com/docs/git-submodule/2.54.0 ; https://github.com/Colorado-Mesh/meshcore-utilities-site ; `gh api repos/Colorado-Mesh/meshcore-utilities-site/contents`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not use Git subtree/vendor-copy because the project explicitly requires a submodule relationship. Do not force the Flask repo into npm workspaces; npm workspaces are appropriate only when each workspace path contains a package.

### ITEM-stack-5: Treat upstream Flask/Python as source material only; do not run Flask in production

- **Recommendation:** Do not add Flask, Pydantic, ObjectREST, or the `coloradomesh` Python package to the host production stack. Use the upstream Flask app as the canonical reference for behavior/data and port/reimplement the public UX natively in Next.js.
- **Rationale:** Upstream currently declares `Flask==3.1.2`, `pydantic==2.12.5`, `objectrest==2.0.0`, and `coloradomesh==0.11.1`, with a Docker app on port 50000. Current Flask is 3.1.3, so directly running upstream would immediately introduce a second runtime and dependency update path. The host app already has equivalent tool routes and public-site security/design expectations.
- **Confidence:** HIGH
- **Source:** GitHub inspection + official/PyPI docs — https://github.com/Colorado-Mesh/meshcore-utilities-site ; https://flask.palletsprojects.com/en/stable/changes/ ; https://pypi.org/project/Flask/
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not proxy/iframe the Flask UI as the main experience. Keep a separate upstream deployment only as a reference/fallback link if maintainers need to compare behavior.

### ITEM-stack-6: Keep Tailwind CSS 4 and the existing CSS-first design system

- **Recommendation:** Build UI with the current Tailwind CSS 4 setup (`tailwindcss`, `@tailwindcss/postcss`) and local design tokens/components (`ToolShell`, `HeroPanel`, `ToolCard`, `.panel`, `.card-mesh`, button classes). Delegate final visual implementation to `co-ui`/native Opus UI per the project constraint.
- **Rationale:** Official Tailwind v4 PostCSS setup matches the existing `postcss.config.mjs`. The site already has a polished operations-console design; copying upstream `static/css` would leak global styles and undermine brand/a11y consistency. Tailwind 4 is the standard stack choice for this brownfield site, not an experiment.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://tailwindcss.com/docs/installation/using-postcss ; https://tailwindcss.com/blog/tailwindcss-v4 ; `/Users/cjvana/Documents/GitHub/denvermc-org/postcss.config.mjs`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not import upstream CSS wholesale. Do not add a component library such as MUI/Chakra/Shadcn for this task; it would create a second design language and extra migration surface.

### ITEM-stack-7: Use build/update-time generators plus parity tests instead of runtime submodule reads

- **Recommendation:** Add a Node/TypeScript generator script, run manually or in CI, that reads upstream data such as `static/data/default_serial_commands.json`, `static/data/recommended_settings.json`, `static/data/regions.json`, `static/data/emojis.json`, and `serial_commands.schema.json`, validates them, and emits local typed artifacts/tests. Runtime pages should import local generated modules.
- **Rationale:** Next standalone output and Docker copy only the built app/runtime artifacts into the final image. Runtime `fs` reads into a submodule path are easy to omit from output tracing and deployments. Build/update-time generation makes upstream updates reviewable as diffs and keeps the production runtime independent of the submodule directory.
- **Confidence:** HIGH
- **Source:** Official docs + upstream/codebase inspection — https://nextjs.org/docs/app/getting-started/deploying ; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js` ; `gh api repos/Colorado-Mesh/meshcore-utilities-site/git/trees/HEAD?recursive=1`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not serve raw upstream files directly from `vendor/`. Do not require the deployed container/serverless function to include the entire submodule unless a future tool has a proven need.

### ITEM-stack-8: Keep Vitest, Playwright, axe, and Lighthouse CI as the quality stack

- **Recommendation:** Extend the existing test stack: Vitest for deterministic utility/parity tests, Playwright for route/interaction coverage, axe/Playwright for accessibility, and Lighthouse CI for public-site performance/regression gates.
- **Rationale:** The repository already has scripts for `lint`, `typecheck`, `test:unit`, `test:e2e`, `test:a11y`, and `test:lighthouse`. This stack maps directly to the integration risks: tool algorithms must match upstream, Web Serial unsupported states need browser-level tests, and the redesigned utilities must preserve public-site a11y/performance quality.
- **Confidence:** HIGH
- **Source:** Codebase + npm registry — `/Users/cjvana/Documents/GitHub/denvermc-org/package.json` ; `npm view vitest version` => 4.1.5 ; `npm view @playwright/test version` => 1.59.1
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not introduce Jest/Cypress for this feature; adding parallel test frameworks increases maintenance cost without solving a unique problem.

### ITEM-stack-9: Keep Web Serial as a browser capability with feature detection and secure-context UX

- **Recommendation:** Continue using the native Web Serial API directly from client components for `/tools/serial-usb`; guard it with `window.isSecureContext`, `navigator.serial` feature detection, user-gesture connection, and clear unsupported-browser copy.
- **Rationale:** MDN marks Web Serial as limited availability and secure-context only. A browser-native implementation avoids a local daemon or server-mediated device access, preserving the privacy/security model that device bytes stay between the user’s browser and hardware. The current local implementation already follows this shape.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/SerialUsbTool.tsx`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not add a Node native serial bridge, Electron app, or backend WebSocket serial proxy for the public website. Do not promise Safari/iOS support for serial operations.

### ITEM-stack-10: Deploy as the existing Next standalone/Docker/Netlify-compatible site, not a two-service app

- **Recommendation:** Keep deployment centered on `next build`, `next start`, Docker standalone output, and the existing Netlify configuration. Ensure CI/build checkouts initialize the submodule before generator/parity steps, but make the runtime independent of it.
- **Rationale:** Official Next.js docs state Node.js server and Docker support all Next.js features, and Netlify’s OpenNext adapter supports App Router, SSR, Route Handlers, Server Actions, middleware, and caching. The host repo already has `output: 'standalone'`, Dockerfile, Compose, Netlify config, and Lighthouse CI. A separate Flask service would complicate routing, CSP, cache headers, monitoring, and local setup.
- **Confidence:** HIGH
- **Source:** Official docs + codebase — https://nextjs.org/docs/app/getting-started/deploying ; https://docs.netlify.com/frameworks/next-js/overview/ ; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile`
- **Checked:** 2026-05-10
- **Alternatives rejected:** Do not deploy Flask side-by-side for the main utilities. Do not switch to static export because the site uses route handlers/live data and static export has limited feature support.

## Confidence Summary

| Item ID | Level | Source Type | URL/Reference |
|---------|-------|-------------|---------------|
| ITEM-stack-1 | HIGH | Official docs + codebase | https://nextjs.org/docs/app/getting-started ; https://nextjs.org/docs/app/getting-started/deploying ; `/Users/cjvana/Documents/GitHub/denvermc-org/package.json` |
| ITEM-stack-2 | HIGH | Official docs + npm registry + codebase | https://react.dev/blog/2024/12/05/react-19 ; `npm view react version` ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/SerialUsbTool.tsx` |
| ITEM-stack-3 | HIGH | Official docs + codebase + npm registry | https://nextjs.org/docs/app/api-reference/config/typescript ; `/Users/cjvana/Documents/GitHub/denvermc-org/tsconfig.json` ; `npm view zod version` |
| ITEM-stack-4 | HIGH | Official docs + GitHub inspection | https://git-scm.com/docs/git-submodule/2.54.0 ; https://github.com/Colorado-Mesh/meshcore-utilities-site |
| ITEM-stack-5 | HIGH | GitHub inspection + official/PyPI docs | https://github.com/Colorado-Mesh/meshcore-utilities-site ; https://flask.palletsprojects.com/en/stable/changes/ ; https://pypi.org/project/Flask/ |
| ITEM-stack-6 | HIGH | Official docs + codebase | https://tailwindcss.com/docs/installation/using-postcss ; https://tailwindcss.com/blog/tailwindcss-v4 ; `/Users/cjvana/Documents/GitHub/denvermc-org/postcss.config.mjs` |
| ITEM-stack-7 | HIGH | Official docs + upstream/codebase inspection | https://nextjs.org/docs/app/getting-started/deploying ; `/Users/cjvana/Documents/GitHub/denvermc-org/next.config.js` ; https://github.com/Colorado-Mesh/meshcore-utilities-site |
| ITEM-stack-8 | HIGH | Codebase + npm registry | `/Users/cjvana/Documents/GitHub/denvermc-org/package.json` ; `npm view vitest version` ; `npm view @playwright/test version` |
| ITEM-stack-9 | HIGH | Official docs + codebase | https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API ; `/Users/cjvana/Documents/GitHub/denvermc-org/src/components/tools/SerialUsbTool.tsx` |
| ITEM-stack-10 | HIGH | Official docs + codebase | https://nextjs.org/docs/app/getting-started/deploying ; https://docs.netlify.com/frameworks/next-js/overview/ ; `/Users/cjvana/Documents/GitHub/denvermc-org/Dockerfile` |
