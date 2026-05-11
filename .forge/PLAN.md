# Forge Implementation Plan

## Overview
Add `Colorado-Mesh/meshcore-utilities-site` as a pinned Git submodule, then make the existing Colorado MeshCore `/tools` experience submodule-aware without running Flask in production. The implementation will treat `vendor/meshcore-utilities-site` as read-only upstream source material, generate narrow typed local artifacts from selected upstream files, enforce parity/staleness in tests and CI, preserve canonical `/tools/*` routes, add compatibility redirects for known upstream paths, and delegate final visual redesign/polish to `co-ui`/native Opus UI because this session is Codex-backed.

## Technical Decisions
- Keep the host stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, Node 24, existing Docker standalone output, and existing GitHub Actions quality gates. Research refs: ITEM-stack-1, ITEM-stack-2, ITEM-stack-6, ITEM-stack-10.
- Add the upstream utilities repo as a Git submodule at `vendor/meshcore-utilities-site`, tracking `main`, and do not convert it into an npm workspace or runtime dependency. Research refs: ITEM-stack-4, ITEM-architecture-1, ITEM-prior-art-3.
- Keep upstream Flask/Python/Jinja/static UI out of production; use it as behavior/data/schema/provenance reference only. Research refs: ITEM-stack-5, ITEM-pitfalls-3, ITEM-prior-art-1.
- Generate and commit narrow local artifacts from upstream JSON/schema files, then fail CI when generated outputs are stale. Research refs: ITEM-stack-7, ITEM-architecture-2, ITEM-architecture-3, ITEM-pitfalls-8.
- Preserve current `/tools` information architecture and add redirects only for known upstream Flask paths that map cleanly to local pages. Research refs: ITEM-architecture-4, ITEM-prior-art-2.
- Keep serial USB guarded: preview commands, block secret/private/password fields, explicit confirmation for state-changing operations, prominent unsupported-browser messaging. Research refs: ITEM-stack-9, ITEM-pitfalls-5, ITEM-pitfalls-6, ITEM-architecture-6.
- Do not expose upstream `/contacts` export in this pass; local `/api/map/snapshot` remains the browser-facing live-data source. Research refs: ITEM-pitfalls-10, ITEM-architecture-7.
- Do not copy substantial upstream implementation code, templates, CSS, or assets until upstream has an explicit compatible license. Use local reimplementation plus parity tests. Research refs: ITEM-pitfalls-9, ITEM-prior-art-1.
- Configure weekly Dependabot `gitsubmodule` update PRs after parity/stale checks exist; do not auto-merge. Research refs: ITEM-prior-art-4, ITEM-architecture-9.

## Implementation Steps

### Step 1: Add the upstream utilities submodule and submodule health checks
**Goal:** Add the upstream repository as a read-only pinned source dependency and make local/CI builds fail early when it is missing or uninitialized.
**Why now:** Every generator, parity check, and update workflow depends on a stable submodule path and a reliable way to detect missing upstream files.
**Dependencies:** Existing git repository, current clean working tree, upstream repository availability, Node 24.
**Files:**
- `.gitmodules` — new Git submodule metadata.
- `vendor/meshcore-utilities-site` — new submodule gitlink.
- `scripts/check-utilities-submodule.mjs` — new submodule presence/shape check.
- `package.json` — add `utilities:check-submodule` script.
- `eslint.config.mjs` — exclude the read-only upstream submodule from host linting.
- `.github/workflows/ci.yml` — use recursive checkout and run the submodule check before quality gates.
- `Dockerfile` — no runtime dependency expected; inspect builder context and add only an early build-time check if needed.
**Existing code to inspect first:**
- `.github/workflows/ci.yml` checkout steps.
- `Dockerfile` build stages.
- `package.json` scripts.
- `.gitignore` for vendor exclusions.
**Implementation plan:**
1. Run `git submodule add https://github.com/Colorado-Mesh/meshcore-utilities-site vendor/meshcore-utilities-site`.
2. Inspect the checked-out upstream tree and identify stable required files for the check script, such as `requirements.txt`, `app.py` or backend route files, `static/data/default_serial_commands.json`, `static/data/recommended_settings.json`, `static/data/regions.json`, and `serial_commands.schema.json` if present.
3. Add `scripts/check-utilities-submodule.mjs` that resolves the repo root, verifies `vendor/meshcore-utilities-site` exists, verifies it is not empty, verifies required files exist, and prints the pinned upstream SHA with actionable failure text.
4. Add `npm run utilities:check-submodule` to `package.json`.
5. Exclude `vendor/**` from host ESLint so the pinned upstream submodule remains read-only and is not linted as local source.
6. Update every `actions/checkout@v4` step in `.github/workflows/ci.yml` to use `submodules: recursive`.
7. Add the submodule check near the start of the CI quality job before generation/build/test steps.
8. Confirm the Docker build remains runtime-independent from `vendor/`; only add a builder-stage check if generation becomes part of `npm run build` in later steps.
**Contracts and interfaces:**
- Script command: `npm run utilities:check-submodule`.
- Submodule path contract: `vendor/meshcore-utilities-site`.
- Required upstream file list lives in the script, not in runtime code.
**State/data changes:**
- New gitlink and `.gitmodules` entry pinned to the current upstream commit.
- No production runtime state changes.
**Edge cases:**
- Submodule directory missing.
- Submodule directory present but uninitialized.
- Upstream file moved or renamed.
- CI checkout omits submodules.
- Docker build context includes a gitlink without contents.
**Acceptance criteria:**
- `git submodule status` shows `vendor/meshcore-utilities-site` pinned.
- `npm run utilities:check-submodule` passes locally with the submodule initialized and fails with actionable output if required files are missing.
- CI checkout steps initialize submodules recursively.
- No code under `vendor/meshcore-utilities-site` is edited.
**Verification commands:**
- `git submodule status`
- `npm run utilities:check-submodule`
- `npm run typecheck`
- `npm run lint`
**Manual validation:**
- Inspect `.gitmodules` and `vendor/meshcore-utilities-site` to confirm the URL and path match the project decision set.
- Confirm the final Docker runtime stage still copies only `public`, `.next/standalone`, and `.next/static`.
**Risks:**
- CI/deploy builds can omit submodule contents unless checkout is updated. Research refs: ITEM-pitfalls-1, ITEM-architecture-10.
- Editing inside the submodule would create dirty nested state instead of a reviewable upstream PR. Research refs: ITEM-pitfalls-2, ITEM-prior-art-3.
**Out of scope for this step:**
- Generating artifacts.
- Changing tool behavior or UI.
- Dependabot automation.

### Step 2: Generate local typed artifacts and provenance from upstream source files
**Goal:** Replace static upstream fixture assumptions with a repeatable generator that reads the submodule, validates selected upstream data, emits committed local artifacts, and records provenance.
**Why now:** UI and tool logic should consume stable local modules, not runtime `vendor/` reads; parity checks need generated source-of-truth artifacts before behavior changes.
**Dependencies:** Step 1 submodule path and check script.
**Files:**
- `scripts/generate-utilities-artifacts.mjs` or `scripts/generate-utilities-artifacts.ts` — new generator.
- `src/lib/upstream-utilities/generated/*` — new generated artifacts and metadata.
- `src/lib/upstream-utilities/index.ts` — stable exports for generated data.
- `src/lib/parity/manifest.ts` — update upstream refs and coverage notes to point at submodule provenance.
- `src/lib/parity/report.ts` — include upstream SHA/source-file information if the manifest shape changes.
- `src/lib/parity/__tests__/manifest.test.ts` — validate generated artifacts and provenance.
- `package.json` — add `utilities:generate` and `utilities:check` scripts.
**Existing code to inspect first:**
- `src/lib/parity/fixtures/utilities/*.json`.
- `src/lib/parity/fixtures/provenance.json`.
- `src/lib/parity/manifest.ts`.
- `src/lib/parity/__tests__/manifest.test.ts`.
- Upstream data/schema paths inside `vendor/meshcore-utilities-site` after Step 1.
**Implementation plan:**
1. Inspect the actual upstream file tree and select the smallest stable file set needed for first-release parity: recommended settings, region data, serial command profile, and serial command schema.
2. Add a generator that calls the submodule check, reads selected upstream JSON/schema files, validates expected object/array shapes using existing dependencies (`zod` for local validation and existing `ajv` where schema validation is already used), and captures the upstream commit SHA.
3. Emit generated TypeScript or JSON artifacts under `src/lib/upstream-utilities/generated/` with source path and SHA metadata.
4. Keep existing `src/lib/parity/fixtures/utilities/*` only if tests still need legacy fixture comparisons; otherwise migrate tests to generated artifacts and remove unused duplicates.
5. Add a stale check mode, exposed as `npm run utilities:check`, that regenerates into a temporary comparison or compares generated output to current tracked files and exits nonzero if stale.
6. Update parity manifest entries so upstream paths point to `vendor/meshcore-utilities-site/...` and generated artifacts are listed as local refs.
7. Add or update tests that prove generated artifacts load, provenance includes the upstream SHA, and serial command data validates against the upstream schema.
**Contracts and interfaces:**
- Script commands: `npm run utilities:generate`, `npm run utilities:check`.
- Generated export namespace: `@/lib/upstream-utilities`.
- Generated provenance shape includes at least `upstreamRepository`, `upstreamPath`, `upstreamCommit`, `generatedAt`, and `sources`.
**State/data changes:**
- Committed generated artifacts are added under `src/lib/upstream-utilities/generated/`.
- Parity manifest references move from static fixture-only provenance to submodule-backed provenance.
**Edge cases:**
- Upstream JSON has valid JSON but changed shape.
- Upstream serial schema validates old data but generator shape validation catches missing required fields.
- `generatedAt` timestamps can cause unnecessary diffs; use deterministic output unless a timestamp is required and intentionally stable.
- `vendor/` unavailable in CI.
**Acceptance criteria:**
- `npm run utilities:generate` updates generated artifacts deterministically.
- `npm run utilities:check` passes with tracked generated artifacts and fails when generated output is stale.
- Existing parity tests pass using generated data/provenance.
- Runtime app imports generated local files only, not `vendor/`.
**Verification commands:**
- `npm run utilities:check-submodule`
- `npm run utilities:generate`
- `npm run utilities:check`
- `npm run test:unit -- --run src/lib/parity/__tests__/manifest.test.ts`
- `npm run typecheck`
**Manual validation:**
- Inspect generated files to confirm they contain narrow data and provenance only, not copied upstream UI code/templates/CSS.
- Inspect `git diff` to confirm generated output is deterministic and reviewable.
**Risks:**
- Runtime filesystem reads from the submodule can break Docker/standalone deployments. Research refs: ITEM-stack-7, ITEM-architecture-10.
- Copying substantial upstream code/assets creates licensing uncertainty. Research refs: ITEM-pitfalls-9, ITEM-prior-art-1.
**Out of scope for this step:**
- Changing user-facing layouts.
- Adding Dependabot.
- Implementing contacts export.

### Step 3: Wire deterministic utility logic to generated upstream-derived data
**Goal:** Make the existing repeater, companion, prefix, and serial utility logic consume generated upstream-derived data where appropriate while preserving current safety and local live-data contracts.
**Why now:** After generated artifacts exist, the local tools can be tied to upstream updates through tests without introducing runtime submodule coupling.
**Dependencies:** Step 2 generated exports and stale checks.
**Files:**
- `src/lib/meshcore-data/settings.ts` — use generated recommended radio settings or assert exact parity against generated settings.
- `src/lib/meshcore-data/regions.ts` — use generated upstream regions if shape matches local expectations, or add explicit adapter mapping.
- `src/lib/tools/serial-commands.ts` — use generated upstream serial command profile through a safety adapter, not raw unfiltered execution.
- `src/lib/meshcore-tools/config-export.ts` — preserve deterministic local config output and warnings.
- `src/lib/meshcore-tools/serial-settings.ts` — preserve guarded settings-to-command behavior.
- `src/lib/meshcore-tools/__tests__/config-export.test.ts` — update parity assertions.
- `src/lib/meshcore-tools/__tests__/serial-settings.test.ts` — add generated serial profile assertions.
- `src/lib/parity/manifest.ts` — update statuses/coverage if coverage changes.
**Existing code to inspect first:**
- `src/lib/meshcore-data/settings.ts`.
- `src/lib/meshcore-data/regions.ts`.
- `src/lib/tools/serial-commands.ts`.
- `src/lib/meshcore-tools/config-export.ts`.
- `src/lib/meshcore-tools/serial-settings.ts`.
- Existing unit tests for config export and serial settings.
**Implementation plan:**
1. Compare generated recommended settings to `COLORADO_MESH_RADIO_SETTINGS` and choose the narrowest safe integration: direct generated source if field names and values match, otherwise local canonical settings with a test asserting generated parity for the supported fields.
2. Compare generated regions to `COLORADO_MESH_REGION_CODES`; if upstream contains additional metadata, add an adapter that extracts only local region codes and validates ordering/known defaults.
3. Adapt generated serial command profiles into `SerialCommandProfile` while preserving confirmation flags for state-changing actions and blocking any commands that match private/secret/password write patterns unless explicitly read-only.
4. Keep `buildSerialSettingsPlan` conservative: name/radio writes only, secret-field blocking, unsupported-key warnings, and no full destructive upstream setup flow.
5. Update config-export tests to assert local settings/config outputs match generated upstream-derived values for supported deterministic fields.
6. Update serial-settings tests to assert generated/default command profile compatibility, confirm state-changing actions require confirmation, and secret/private/password fields remain blocked.
7. Update parity manifest coverage refs and notes to distinguish exact parity from intentional safety divergence.
**Contracts and interfaces:**
- Local utility modules remain the public interfaces used by components.
- Generated artifacts may change via submodule update, but component props and tool APIs stay stable.
- Serial command adapter must return `SerialCommandProfile` with `SerialAction[]` and confirmation metadata.
**State/data changes:**
- Local settings/region/serial data now trace to generated upstream provenance.
- No new route/API contracts.
**Edge cases:**
- Upstream adds region formats that do not map to local IATA-style region codes.
- Upstream adds serial actions that write secrets, erase state, reboot, or alter radio state.
- Upstream changes radio defaults in a way that conflicts with Colorado Mesh public guidance.
- Generated data includes extra fields that should not become public UI by accident.
**Acceptance criteria:**
- Existing repeater and companion exports remain deterministic and safe.
- Tests assert supported settings/regions/serial commands stay aligned with generated upstream data.
- Serial USB still blocks private/secret/password fields and requires confirmation for state-changing generated actions.
- Prefix matrix continues to use local `/api/map/snapshot` data rather than upstream contacts export.
**Verification commands:**
- `npm run utilities:check`
- `npm run test:unit -- --run src/lib/meshcore-tools/__tests__/config-export.test.ts src/lib/meshcore-tools/__tests__/serial-settings.test.ts src/lib/parity/__tests__/manifest.test.ts`
- `npm run typecheck`
- `npm run lint`
**Manual validation:**
- Inspect generated-data imports to confirm no runtime code imports from `vendor/`.
- Review serial command labels/actions for confirmation coverage before browser testing.
**Risks:**
- Exact upstream parity can conflict with serial/device safety. Research refs: ITEM-pitfalls-5, ITEM-architecture-6.
- Duplicate contacts/live-data paths can confuse operator decisions. Research refs: ITEM-pitfalls-10, ITEM-architecture-7.
**Out of scope for this step:**
- Redesigning forms/cards visually.
- Adding contacts export.
- Running or proxying Flask.

### Step 4: Add route compatibility, provenance surfaces, and smoke coverage
**Goal:** Preserve the local `/tools/*` routes as canonical while helping users arriving from known upstream Flask routes land on the right local tool and understand the upstream relationship.
**Why now:** Once data and parity are wired, routing/provenance can be added without changing tool internals.
**Dependencies:** Steps 1–3 for submodule provenance and stable local routes.
**Files:**
- `next.config.js` — add known compatibility redirects via `redirects()` if route names are confirmed from upstream tree.
- `src/app/tools/page.tsx` — add non-visual provenance copy/link scaffolding if needed; final styling delegated later.
- `src/app/tools/repeater-name/page.tsx` — optional upstream-derived provenance/metadata copy.
- `src/app/tools/companion-name/page.tsx` — optional upstream-derived provenance/metadata copy.
- `src/app/tools/prefix-matrix/page.tsx` — optional upstream-derived provenance/metadata copy.
- `src/app/tools/serial-usb/page.tsx` — optional upstream-derived provenance/metadata copy and safety note hooks.
- `tests/e2e/smoke.spec.ts` — add redirect/provenance smoke checks.
- `src/lib/parity/manifest.ts` — add route compatibility item or coverage notes.
**Existing code to inspect first:**
- `next.config.js` headers implementation.
- `src/lib/site.ts` primary routes if nav labels are touched.
- Current `/tools/*` page metadata and `ToolShell` usage.
- `tests/e2e/smoke.spec.ts` critical page and navigation tests.
- Upstream Flask route names in `vendor/meshcore-utilities-site`.
**Implementation plan:**
1. Inspect upstream route declarations and build a short explicit redirect map for known utility paths, such as repeater, companion, prefix matrix, and serial USB route names.
2. Add `async redirects()` to `next.config.js` without altering existing security headers.
3. Keep redirects permanent only when mappings are exact and public; skip ambiguous upstream API/internal paths.
4. Add small provenance/reference data hooks to tool pages using generated provenance, avoiding broad UI redesign in this Codex-backed session.
5. Add Playwright smoke checks for representative redirects and canonical URL outcomes.
6. Add smoke coverage for visible upstream/provenance messaging if introduced.
7. Verify active nav behavior remains correct on canonical tool routes.
**Contracts and interfaces:**
- Canonical public routes remain `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, `/tools/serial-usb`.
- Redirected upstream paths return permanent redirects to canonical routes.
- Existing CSP/security headers remain global and unchanged unless a specific route requires explicit review.
**State/data changes:**
- Browser-visible redirects only.
- No new API/data persistence.
**Edge cases:**
- Upstream Flask paths overlap with existing Next routes.
- Redirects accidentally apply to API/static upstream paths.
- Permanent redirects for uncertain paths become hard to change.
- Provenance link opens externally and needs `noopener noreferrer`.
**Acceptance criteria:**
- Known upstream utility paths redirect to canonical local routes.
- `/tools/*` metadata/canonical URLs remain unchanged.
- Security headers still include `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- E2E smoke covers redirect behavior.
**Verification commands:**
- `npm run test:e2e -- --grep "tools|navigation|critical page smoke"`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
**Manual validation:**
- Start the dev server and visit redirected paths in a browser.
- Confirm no iframe/proxy behavior and no console errors.
**Risks:**
- Proxy/iframe integration would conflict with CSP and public-site security posture. Research refs: ITEM-pitfalls-7, ITEM-prior-art-6.
- Route compatibility can become maintenance burden if too many ambiguous upstream paths are redirected. Research refs: ITEM-architecture-4, ITEM-prior-art-2.
**Out of scope for this step:**
- Recreating upstream Flask API routes.
- Adding upstream contacts export.
- Visual redesign beyond minimal provenance hooks.

### Step 5: Strengthen serial USB safety and unsupported-browser contracts
**Goal:** Ensure serial USB remains safe and understandable as upstream-derived command profiles are integrated.
**Why now:** Serial USB has the highest hardware-safety risk and should be hardened before final visual polish.
**Dependencies:** Steps 2–3 generated serial data and adapters.
**Files:**
- `src/components/tools/SerialUsbTool.tsx` — client behavior/state surfaces; visual polish delegated but safety logic can be updated.
- `src/lib/tools/serial-commands.ts` — generated command adapter and confirmation metadata.
- `src/lib/meshcore-tools/serial-settings.ts` — settings JSON safety rules.
- `src/lib/meshcore-tools/__tests__/serial-settings.test.ts` — safety tests.
- `tests/e2e/smoke.spec.ts` — unsupported/no-connection and preview tests.
- `src/app/tools/serial-usb/page.tsx` — requirements/safety copy contract for Opus UI.
**Existing code to inspect first:**
- `src/components/tools/SerialUsbTool.tsx`.
- `src/lib/tools/serial-commands.ts`.
- `src/lib/meshcore-tools/serial-settings.ts`.
- Existing serial USB smoke test in `tests/e2e/smoke.spec.ts`.
**Implementation plan:**
1. Audit current Web Serial feature detection and secure-context handling in `SerialUsbTool`.
2. Ensure unsupported states distinguish missing `navigator.serial`, insecure context, disconnected state, and JSON preview errors.
3. Ensure generated/default serial actions that mutate device state require confirmation, including reboot, erase/factory reset, GPS, power, region save, clock sync, logging, and other state-changing commands.
4. Preserve blocked settings JSON keys matching private/secret/password patterns and add test cases for nested secret fields.
5. Ensure settings JSON Apply remains disabled until a connection exists and a valid guarded plan exists.
6. Add or adjust Playwright coverage for unsupported/no-connection apply behavior and invalid JSON error behavior.
7. Prepare clear state labels/copy hooks for `co-ui` to polish without changing safety behavior.
**Contracts and interfaces:**
- `buildSerialSettingsPlan(input)` returns either errors or a confirmation-gated `SerialAction`.
- `SerialUsbTool` never sends settings commands without an active user-selected serial port and explicit apply action.
- Browser capability states are represented in DOM with stable test IDs where needed.
**State/data changes:**
- No persisted state.
- Serial state remains browser-local only.
**Edge cases:**
- Safari/Firefox/iOS unsupported Web Serial.
- HTTPS requirement not met outside localhost.
- Valid JSON with blocked nested secrets.
- Generated command profiles include destructive commands without explicit metadata.
- User connects a port then changes JSON to invalid content.
**Acceptance criteria:**
- Serial safety unit tests pass and include blocked nested secret fields.
- Smoke test proves Apply is disabled without connection and invalid JSON is surfaced.
- Unsupported-browser messaging is prominent and testable.
- No backend serial bridge, iframe, proxy, or third-party script is introduced.
**Verification commands:**
- `npm run test:unit -- --run src/lib/meshcore-tools/__tests__/serial-settings.test.ts`
- `npm run test:e2e -- --grep "serial-usb"`
- `npm run typecheck`
- `npm run lint`
**Manual validation:**
- In Chromium, open `/tools/serial-usb`, paste valid and invalid settings JSON, confirm preview and disabled Apply behavior without connecting hardware.
- In browser emulation or feature-stubbed test context, confirm unsupported messaging appears when `navigator.serial` is unavailable.
**Risks:**
- Browser-issued serial commands can misconfigure or erase real devices. Research refs: ITEM-pitfalls-5, ITEM-architecture-6.
- Web Serial unsupported-state UX can mislead users if hidden. Research refs: ITEM-pitfalls-6, ITEM-stack-9.
**Out of scope for this step:**
- Full destructive upstream setup parity.
- Backend-mediated serial access.
- Visual redesign beyond safety state hooks.

### Step 6: Delegate the utilities visual redesign and interaction polish to native Opus UI
**Goal:** Redesign the utilities experience so it feels first-class in the Colorado MeshCore site while preserving the data contracts, generated parity, route behavior, and safety rules established in earlier steps.
**Why now:** The logic, generated data, provenance, routes, and safety contracts should be stable before visual implementation begins.
**Dependencies:** Steps 1–5 complete and passing automated checks.
**Files:**
- Likely `src/app/tools/page.tsx`.
- Likely `src/app/tools/repeater-name/page.tsx`.
- Likely `src/app/tools/companion-name/page.tsx`.
- Likely `src/app/tools/prefix-matrix/page.tsx`.
- Likely `src/app/tools/serial-usb/page.tsx`.
- Likely `src/components/tools/ToolShell.tsx`.
- Likely `src/components/tools/SerialUsbTool.tsx`.
- Likely `src/components/NamingWizard.tsx`, `src/components/CompanionNamer.tsx`, and `src/components/PrefixMatrix.tsx` if the Opus UI pass identifies interaction polish needs.
- `tests/e2e/smoke.spec.ts` only if test IDs or visible labels need updates.
**Existing code to inspect first:**
- Current tool pages and shared `ToolShell`.
- Existing brand components: `HeroPanel`, `NetworkPanel`, `ToolCard`, `SectionEyebrow`.
- Existing e2e selectors in `tests/e2e/smoke.spec.ts`.
- Generated/provenance exports from earlier steps.
**Implementation plan:**
1. Prepare a concise `co-ui` prompt describing the exact UI scope, current contracts, safety invariants, generated provenance data, and files likely to change.
2. Run `co-ui` from the repository root to perform the visual frontend implementation in native Opus UI.
3. Review Opus UI changes to ensure it did not edit `vendor/`, weaken serial safety, remove test IDs, add iframe/proxy behavior, or import upstream CSS/templates.
4. If Opus UI changes labels/test IDs, update Playwright tests only to match intentional user-visible copy changes.
5. Verify heading hierarchy, keyboard navigation, focus states, external-link cues, unsupported serial states, and responsive layouts at mobile, tablet, and desktop widths.
6. Use the browser against the dev server to test the tools hub, repeater wizard, companion builder, prefix matrix, serial JSON preview, redirect paths, and unsupported/no-connection serial behavior.
7. Fix only non-visual integration issues in this session; delegate visual corrections back to `co-ui` if needed.
**Contracts and interfaces:**
- Opus UI must consume existing local modules and generated exports; it must not introduce runtime submodule reads.
- Stable user flows: tools hub links, repeater export, companion export, prefix search/suggest/detail, serial settings preview/apply disabled without connection.
- Existing public route contracts remain unchanged.
**State/data changes:**
- Visual/component markup changes only; no new persistent data.
**Edge cases:**
- UI polish removes accessibility landmarks/headings.
- UI polish removes Playwright test IDs used for critical smoke.
- Visual redesign hides unsupported serial browser state.
- Opus UI accidentally copies upstream CSS/template snippets.
**Acceptance criteria:**
- Tools hub and all first-release tool pages present a cohesive, polished utilities experience in the existing design system.
- E2E smoke and axe checks pass.
- Browser manual validation covers golden paths and edge cases.
- No direct visual implementation is hand-coded in the Codex-backed session except non-visual integration/test fixes.
**Verification commands:**
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run test:e2e -- --grep "tools|serial-usb|prefix-matrix|critical page smoke"`
- `npm run test:a11y`
- `npm run build`
**Manual validation:**
- Start `npm run dev` and test `/tools`, `/tools/repeater-name`, `/tools/companion-name`, `/tools/prefix-matrix`, `/tools/serial-usb`, plus representative compatibility redirects in Chromium.
- Monitor console and network errors during navigation and interactions.
- Check mobile menu and desktop nav still work at 390px, 768px, 1024px, and 1440px widths.
**Risks:**
- This session is Codex-backed and must not perform visual implementation directly. Project constraint refs: PROJECT.md, ITEM-stack-6, ITEM-architecture-8.
- Copying upstream UI/CSS can regress design and license posture. Research refs: ITEM-pitfalls-4, ITEM-pitfalls-9.
**Out of scope for this step:**
- Adding new utility capabilities beyond first-release scope.
- Contacts export.
- Upstream Flask runtime/proxy/iframe.

### Step 7: Add submodule update automation and final integration gates
**Goal:** Make upstream updates visible through reviewable PRs and enforce the complete local quality/parity gate before release.
**Why now:** Dependabot should only update the submodule pointer after the repository can detect stale generated artifacts and parity failures.
**Dependencies:** Steps 1–6 complete and tests passing.
**Files:**
- `.github/dependabot.yml` — new weekly `gitsubmodule` updates plus existing npm ecosystem if not already configured.
- `.github/workflows/ci.yml` — add `npm run utilities:check` to the quality job after submodule checkout.
- `package.json` — ensure final scripts include submodule, generate, and stale-check commands.
- `src/lib/parity/manifest.ts` — final coverage/status notes.
- `tests/e2e/smoke.spec.ts` — final smoke coverage for routes and critical tools.
**Existing code to inspect first:**
- `.github/workflows/ci.yml`.
- Any existing `.github/dependabot.yml` if created by another process.
- `package.json` scripts after earlier steps.
- `src/lib/parity/manifest.ts` final state.
**Implementation plan:**
1. Add `.github/dependabot.yml` with a `gitsubmodule` ecosystem entry for `/`, weekly cadence, and clear labels/commit prefix if compatible with repo conventions.
2. Include npm dependency update settings only if doing so does not change current dependency-update policy; otherwise keep the file narrowly focused on submodules.
3. Add `npm run utilities:check` to the CI quality job after dependency install and before unit tests/build.
4. Ensure every CI job that needs generated artifacts uses recursive checkout; jobs that only run runtime smoke still need submodule contents if the build invokes stale checks.
5. Run full local verification: submodule check, generation check, lint, typecheck, unit tests, e2e, axe, build, and Docker smoke if feasible.
6. Run a browser manual pass over all first-release utility routes and redirects after visual work.
7. Stage only implementation files for review; keep `.forge` artifacts unstaged unless explicitly requested.
**Contracts and interfaces:**
- Dependabot ecosystem: `gitsubmodule`.
- CI quality gate includes `npm run utilities:check`.
- Submodule PRs must not auto-merge and must pass parity/stale checks.
**State/data changes:**
- GitHub will open future submodule pointer PRs after this file lands.
- No production runtime state changes.
**Edge cases:**
- Dependabot config already exists by the time this step runs.
- Submodule update PR changes generated artifacts but the bot cannot update them automatically.
- CI tries stale checks in a job without recursive checkout.
- Docker smoke fails because build-time checks need submodule files not copied into build context.
**Acceptance criteria:**
- `.github/dependabot.yml` configures weekly submodule update PRs.
- CI quality job fails on stale generated artifacts.
- Full automated verification passes locally.
- Browser manual validation passes for tools, redirects, and serial edge states.
- `.forge` artifacts remain out of the implementation commit unless explicitly requested.
**Verification commands:**
- `npm run utilities:check-submodule`
- `npm run utilities:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:a11y`
- `npm run build`
- `npm run docker:smoke -- --image colorado-meshcore-site:ci` after building the Docker image if local Docker is available
**Manual validation:**
- Verify Dependabot config syntax by inspection and, if available, GitHub UI after push.
- Browser-test final tool flows and compatibility redirects.
**Risks:**
- Dependabot pointer bumps can land without generated artifacts unless CI blocks stale output. Research refs: ITEM-prior-art-4, ITEM-pitfalls-8, ITEM-architecture-9.
- CI/Docker jobs can diverge on submodule availability. Research refs: ITEM-pitfalls-1, ITEM-stack-10.
**Out of scope for this step:**
- Auto-merging Dependabot PRs.
- Building upstream shared JS/TS package.
- Publishing a release unless separately requested after implementation is complete.

## Cross-Step Integration Checks
- Confirm no runtime source file imports from `vendor/meshcore-utilities-site` directly; imports must go through generated local artifacts or existing local modules.
- Confirm `vendor/meshcore-utilities-site` has no modified files after each implementation step.
- Confirm submodule pointer updates produce visible git diffs and generated artifact diffs.
- Confirm CI checkout uses recursive submodules wherever `npm run build`, generation, or stale checks can run.
- Confirm Docker final runtime image does not depend on `vendor/` contents.
- Confirm `/tools/*` routes remain canonical and redirects do not weaken CSP/security headers.
- Confirm serial USB safety behavior survives visual redesign.
- Confirm no contacts export or upstream Flask runtime/proxy/iframe is introduced.
- Confirm `.forge` artifacts are not staged for implementation commits unless explicitly requested.

## Testing Strategy
- **Submodule/generation:** `npm run utilities:check-submodule`, `npm run utilities:generate`, and `npm run utilities:check`.
- **Unit/parity:** Targeted Vitest for parity manifest, config export, serial settings, generated data adapters, and existing meshcore tool logic.
- **Type/lint:** `npm run typecheck` and `npm run lint` after each code step.
- **Browser/e2e:** Playwright smoke for `/tools`, individual tool routes, prefix matrix, serial USB, redirects, navigation, and critical pages.
- **Accessibility:** `npm run test:a11y` after visual changes.
- **Build/runtime:** `npm run build`; Docker build and `npm run docker:smoke` where local Docker is available.
- **Manual UI:** Dev-server browser pass after visual work covering desktop/mobile, keyboard access, external links, serial unsupported/no-connection states, JSON preview errors, and redirect paths.

## Out of Scope
- Running Flask/Python/Jinja as part of production.
- Proxying or iframing the upstream utilities UI.
- Copying substantial upstream implementation code, templates, CSS, or static assets before license clarification.
- Public contacts export or duplicate live-data endpoints.
- Full destructive serial setup parity.
- Auto-merging submodule updates.
- Creating a shared JS/TS upstream package in this pass.
- Publishing a release unless requested after implementation and review are complete.
