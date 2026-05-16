# Step 3 Execution Plan: Rewrite Orchestral Ensemble as cinematic cue templates

## Goal
Make Orchestral Ensemble use the expanded manifest as a richer cinematic palette with layered, role-aware cue templates for normal, node, priority, and burst traffic while preserving public controls and bounded scheduling.

## Current Code Observations
- `corescope-overlay/denvermc-sound.js` currently maps each event to one primary role with `chooseEnsembleRole`, then schedules one sample, one synthetic tone layer, and a small optional message/priority layer.
- `loadedSamplesForRole` and `loadedSampleForRole` already read additive `manifest.roles` pools and ignore unloaded samples, so Step 3 can consume new helper roles without loader changes.
- `scheduleSample` clamps playback MIDI to each sample's declared range and records `recentMidi` and `recentSampleIds`, but no ensemble role/template diagnostics exist yet.
- Step 1 cue metadata (`coalesced`, `burstCount`, `ordinal`, `admissionReason`) reaches `playEnsemble` through `drainMusicQueue`, so burst templates can be selected without new public APIs.
- `tests/e2e/smoke.spec.ts` has one Orchestral Ensemble test using a mocked manifest; its `SoundState` type currently tracks MIDI/sample IDs but not template or role diagnostics.

## Files to Change
- `corescope-overlay/denvermc-sound.js` — add ensemble template selection, role/layer scheduling, round-robin role diagnostics, and richer bounded cue layering.
- `tests/e2e/smoke.spec.ts` — extend mocked manifest coverage and add assertions for ensemble role/template diversity, burst template use, scale safety, and bounded resources.
- `.forge/steps/step-3-plan.md` — this execution plan.
- `.forge/reviews/claude-step-3.json` — review artifact after staged review.

## Ordered Implementation Checklist
1. Add ensemble diagnostics fields to `sequencerState`, snapshots, and reset logic for last/recent ensemble role and template values.
2. Replace the single-role `chooseEnsembleRole` path with an event-intent/template helper that considers lane, event type, intensity, observation/hop counts, replay, and coalesced burst metadata.
3. Define a small set of cinematic cue templates with bounded layers: message, node, priority, burst, and replay-soft variants.
4. Implement a reusable role-layer scheduler that selects loaded samples from preferred role pools, computes in-scale MIDI inside sample ranges, applies conservative gains/envelopes, records diagnostics, and falls back to available primary roles before procedural fallback.
5. Keep procedural tone support subtle and bounded for body/swell reinforcement without adding panning or external dependencies.
6. Update Playwright `SoundState` typing and Orchestral Ensemble tests to assert role/template diversity, burst template diagnostics, valid pitch classes, and resource bounds.
7. Run targeted Chromium Orchestral Ensemble/burst tests and lint for changed files.
8. Stage only Step 3 files, request Forge review, address any findings, and commit once approved.

## Interfaces and Data Contracts
- Public mode value remains `ensemble`; visible label remains `Orchestral Ensemble`.
- `window.__coloradoMeshSound.getState().sequencer` keeps existing fields and adds diagnostics such as `lastEnsembleRole`, `recentEnsembleRoles`, `lastEnsembleTemplate`, and `recentEnsembleTemplates`.
- Manifest fields are consumed additively through existing `roles` and `samples`; minimal manifests still use available `messages`, `node`, or `priority` samples and procedural fallback if no sample can be scheduled.
- Event metadata remains limited to normalized metadata fields plus Step 1 cue options; message contents/raw payloads are not used.

## Verification Plan
- Automated: `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Orchestral Ensemble|map sound burst cleanup|map sound density"`
- Automated: `npm run lint -- tests/e2e/smoke.spec.ts`
- Regression: existing Sound Off/default, unlock, admission/coalescing, and Space Blaster tests should not be modified except for shared type additions.
- Manual: deferred to final integration step for full listening, but use diagnostics to confirm richer templates and role variety now.

## Stop Conditions
- Pause if cinematic layering requires raising global voice/source/timer caps beyond the existing bounded-resource design.
- Pause if a loader/schema change would break existing minimal manifests instead of degrading gracefully.
- Pause if the implementation would require adding a new audio framework, panning, new controls, or message-content-derived sound input.
