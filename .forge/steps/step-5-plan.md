# Step 5 Execution Plan: Orchestral Ensemble samples, manifest, provenance, and playback

## Goal
Ship Orchestral Ensemble as a lazy-loaded, real-sample-backed mode using a curated CC0 sample subset, manifest/provenance metadata, graceful fallback, and the existing overlay-owned sound router.

## Current Code Observations
- `scripts/apply-corescope-overlay.mjs` already copies `corescope-overlay/sound/` recursively into CoreScope public output, so no asset plumbing changes are required for sample files.
- `docker/nginx.conf` already routes `/sound/` to the CoreScope app, so Docker/static serving should work for `/sound/orchestral/...` assets without nginx changes.
- `.gitignore` does not ignore `.wav`, `.json`, or attribution files under `corescope-overlay/sound/`, so curated sample assets can be committed directly.
- `corescope-overlay/denvermc-sound.js` already owns Web Audio lifecycle, master gain/limiter, source tracking, cleanup, cooldowns, and procedural fallback helpers.
- `playCurrentMode(event)` currently treats `ensemble` as an accepted placeholder; Step 5 should replace this with lazy sample loading plus sample playback/fallback.
- `getState()` currently exposes mode, volume, unlock/status, counters, last events, and drop reason; Step 5 can add an `ensemble` status object for test/UI visibility without changing existing callers.

## Files to Change
- `.forge/steps/step-5-plan.md` — focused execution plan for this step.
- `corescope-overlay/denvermc-sound.js` — manifest loading, sample cache, Ensemble mapping/playback, fallback.
- `corescope-overlay/sound/orchestral/manifest.json` — sample roles, URLs, licenses, root notes, attribution fields.
- `corescope-overlay/sound/orchestral/ATTRIBUTION.md` — provenance and license summary for bundled files.
- `corescope-overlay/sound/orchestral/samples/**` — curated CC0 WAV files only.

## Ordered Implementation Checklist
1. Create `corescope-overlay/sound/orchestral/` with `samples/` role subdirectories and a small curated sample subset: harp/clarinet for message motifs, pizzicato string for node/low cues, and timpani/percussion for priority/emergency accents.
2. Use only sources with direct provenance and CC0 licensing. Planned sources: FreePats Concert Harp, FreePats Clarinet, FreePats Timpani/Orchestral Percussion, and VSCO 2 CE pizzicato strings.
3. Normalize committed filenames to lowercase hyphenated `.wav` names and avoid committing source archives or unused library files.
4. Write `manifest.json` with `version`, `samples[]`, and `roles` mapping each role to one or more sample IDs, with each sample including `url`, `rootNote`, `role`, `license`, `sourceUrl`, and `attribution`.
5. Write `ATTRIBUTION.md` listing every included sample, source page/archive/repo, license, and any attribution note.
6. Add Ensemble runtime state in `denvermc-sound.js`: manifest promise/cache, decoded `AudioBuffer` cache, loading/ready/error/degraded status, and concise warning tracking.
7. Lazy-load the manifest and samples only when Ensemble is selected/unlocked and the first Ensemble event routes; do not fetch sample files while Off or in procedural modes.
8. Implement `playEnsemble(event)` with role mapping: messages/group text → harp/clarinet motif, low/node/advert → pizzicato string, emergency/priority → timpani/percussion accent.
9. Use `AudioBufferSourceNode` playback through the existing master output, with simple envelopes, playback-rate pitch adjustment near the sample root, existing source tracking, and bounded timers.
10. If manifest/sample load fails or a role is missing, play a procedural orchestral-like fallback using existing tone/noise helpers and keep other modes working.
11. Apply the overlay, verify sample files copy under `vendor/CoreScope/public/sound/orchestral/...`, then clean generated submodule artifacts.

## Interfaces and Data Contracts
- Static manifest path: `/sound/orchestral/manifest.json`.
- Manifest schema: `{ version, samples: [{ id, role, url, rootNote, license, sourceUrl, attribution }], roles: { messages, node, priority } }`.
- `getState().ensemble` exposes `{ status, loaded, failed, sampleCount }` for shell/test visibility.
- Ensemble playback consumes only normalized `SoundEvent` metadata and does not read text/sender fields.
- Ensemble mode remains optional/degraded: missing samples may reduce a role to procedural fallback but must not break routing or procedural modes.

## Verification Plan
- Automated: `node --check corescope-overlay/denvermc-sound.js`; `npm run lint`; `npm run typecheck`; `git diff --check`; `find corescope-overlay/sound/orchestral -type f | sort`; `npm run corescope:apply-overlay`; `find vendor/CoreScope/public/sound/orchestral -type f | sort`; clean generated submodule artifacts; `git -C vendor/CoreScope status --short`.
- Manual/browser: serve or run `/map#/live`, select Orchestral Ensemble, inject normal/low/emergency events, confirm manifest and sample requests occur only after Ensemble is used, and confirm fallback does not break other modes.
- Regression: Off and locked states still drop without fetching samples; Native+, Generative Key, and Space Blaster still route through existing procedural code; old CoreScope audio remains suppressed.

## Stop Conditions
- If a candidate sample source lacks direct reproducible download/provenance or is not CC0/CC-BY-compatible for redistribution, do not include it.
- If a source archive is too large or extraction is not available locally, use a smaller verified CC0 direct WAV source instead of committing a broad archive.
- If sample playback requires visual UI work, defer UI polish to Step 6 or Opus UI rather than editing styling in this step.
- If a sample fails browser decoding, replace it with a verified browser-decodable WAV or use procedural fallback for that role.
