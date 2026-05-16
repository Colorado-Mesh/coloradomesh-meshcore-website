# Step 4 Execution Plan: Redesign Space Blaster as procedural musical sci-fi

## Goal
Replace the current harsh Space Blaster accents with centered, procedural, musical sci-fi patches for low, normal, priority, and busy-burst traffic while preserving mode names, public controls, metadata-only inputs, and bounded scheduling.

## Current Code Observations
- `corescope-overlay/denvermc-sound.js` currently implements `playBlaster` with inline constants, bright saw/square oscillators, high filter Q values, and noise bursts on normal/priority traffic.
- Existing Blaster diagnostics only expose frequency/glide ranges through `lastBlasterFrequency`, `recentBlasterFrequencies`, `lastBlasterPitch`, and `recentBlasterPitches`.
- Step 1 burst metadata (`coalesced`, `burstCount`, `ordinal`, `admissionReason`) reaches `playBlaster` through the sequencer, so busy-burst patches can be selected without public API changes.
- The existing Playwright test only asserts base frequency and glide ranges; it does not assert patch names, filter Q, noise gain, duration, or burst-specific behavior.
- `corescope-overlay/sound/denvermc-density-worklet.js` uses a distinct Blaster root and shared shimmer/priority lift; a small reduction can make the bed less sharp without changing its API.

## Files to Change
- `corescope-overlay/denvermc-sound.js` — add named Space Blaster patch selection, musical interval scheduling, softer envelopes/filter Q/noise, and richer diagnostics.
- `corescope-overlay/sound/denvermc-density-worklet.js` — soften the Blaster density bed only if needed by lowering its root/priority/shimmer contribution.
- `tests/e2e/smoke.spec.ts` — extend `SoundState` typing and Blaster tests for patch names, musical ranges, Q/noise/duration bounds, burst patches, and resource bounds.
- `.forge/steps/step-4-plan.md` — this execution plan.
- `.forge/reviews/claude-step-4.json` — review artifact after staged review.

## Ordered Implementation Checklist
1. Add additive Blaster diagnostics to `sequencerState`, reset logic, and snapshots for patch names and per-cue patch metrics.
2. Replace inline `playBlaster` constants with helper functions that choose named low/normal/priority/burst patches from lane, intensity, observation count, replay, and coalesced burst metadata.
3. Schedule musical oscillator layers with smoother sine/triangle-first waveforms, smaller glides, lower filter Q, restrained gain, and short tails.
4. Keep noise optional, short, low-gain, and lower-Q so common traffic does not sound like a harsh full-spectrum blast.
5. Preserve centered output by continuing to use the existing mono/centered gain/filter graph and not adding panner nodes.
6. Lightly soften the Blaster density worklet bed if the current mode-specific bed remains sharp.
7. Update Playwright `SoundState` typing and tests to assert patch diagnostics, bounded Q/noise/durations/frequencies, burst patch use, and resource caps.
8. Run targeted Chromium Space Blaster/density/cleanup tests and lint for changed files.
9. Stage only Step 4 files, request Forge review, address findings, and commit after approval.

## Interfaces and Data Contracts
- Public mode value remains `blaster`; visible label remains `Space Blaster`.
- `window.__coloradoMeshSound.getState().sequencer` keeps existing fields and additively exposes Blaster diagnostics such as `lastBlasterPatch`, `recentBlasterPatches`, `lastBlasterCue`, and `recentBlasterCues`.
- Blaster sound generation remains procedural and metadata-only; message contents/raw payloads are not used.
- No panner nodes, new controls, samples, external dependencies, or persistent storage changes.
- Existing bounded queue, active voice, scheduled source, scheduled node, and cleanup timer caps remain authoritative.

## Verification Plan
- Automated: `npx playwright test tests/e2e/smoke.spec.ts --project=chromium --grep "Space Blaster|map sound burst cleanup|map sound density"`
- Automated: `npm run lint -- corescope-overlay/denvermc-sound.js corescope-overlay/sound/denvermc-density-worklet.js tests/e2e/smoke.spec.ts`
- Regression: existing Sound Off/default, unlock, density, admission/coalescing, and Orchestral Ensemble behavior must remain unchanged except for shared type additions.
- Manual: deferred to final integration step, but diagnostics should show softer patch/Q/noise bounds before listening.

## Stop Conditions
- Pause if musical Blaster tuning requires adding sample assets, an audio framework, panning, or new visible controls.
- Pause if improving Blaster requires raising the existing voice/source/timer caps.
- Pause if tests can only pass by removing current bounded-cleanup assertions or weakening metadata-only constraints.
