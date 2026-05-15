# Step 3 Execution Plan: CoreScope packet event bridge and rate-limited sound router

## Goal
Bridge CoreScope consolidated packet audio calls into an overlay-owned, metadata-only sound event router with dedupe, burst control, priority classification, and test counters.

## Current Code Observations
- `vendor/CoreScope/public/live.js` builds one consolidated packet per hash group with `Object.assign({}, first, { observation_count: obsCount })`, then calls `MeshAudio.sonifyPacket(consolidated)` at `vendor/CoreScope/public/live.js:2366`.
- `vendor/CoreScope/public/audio.js` parses packet bytes from `raw`/`raw_hex`, uses `decoded.header.payloadTypeName`, `decoded.payload`, `decoded.path.hops`, and observation count; the overlay can reuse this metadata shape without reading message text.
- `corescope-overlay/denvermc-sound.js` currently suppresses `MeshAudio.sonifyPacket` by replacing it with a counter-only no-op, so Step 3 should route packets there instead of calling upstream audio.
- CoreScope's audio lab also calls `MeshAudio.sonifyPacket(pkt)` with synthetic packet objects, so the router must tolerate replay/audio-lab packet shapes.
- Channel metadata can appear as `decoded.payload.channel`, `decoded.payload.channelName`, `decoded.payload.channelHash`, or live decrypt metadata such as `channelName`/`channelHashByte`; message text fields must not be consumed for sound decisions.

## Files to Change
- `corescope-overlay/denvermc-sound.js` — add packet normalization, dedupe/rate-limiting, priority classification, router dispatch, and test seams.
- `.forge/steps/step-3-plan.md` — this execution plan.

## Ordered Implementation Checklist
1. Extend counters with router fields: received, normalized, routed, dropped, deduped, throttled, locked, off, malformed, priority, and played placeholder counts.
2. Add safe metadata helpers for packet hash/id, payload type, channel name/hash, hop count, observation count, timestamp, and byte-derived intensity without reading `payload.text`, decrypted message text, sender, or other message content fields.
3. Implement `normalizePacket(pkt)` to return the planned `SoundEvent` shape or `null` for unusable packets, including `{ id, type, modeHint, channelName, channelHash, isEmergency, isPriority, observationCount, hopCount, intensity, timestamp }`.
4. Implement dedupe using a short hash/id window so repeat observations of the same consolidated packet do not generate repeated events.
5. Implement simple token-bucket throttles per priority lane where emergency/priority events get a higher allowance and low-priority events are dropped/merged under bursts.
6. Replace the CoreScope `MeshAudio.sonifyPacket` suppression no-op with a wrapper that counts received packets and routes through the overlay router while still forcing upstream audio disabled.
7. Implement `routeEvent(soundEvent)` to drop Off/locked/unavailable states, update counters and last event state, and call a placeholder mode strategy that records a played event but produces no actual sound yet.
8. Add public/test methods on `window.__coloradoMeshSound`: `normalizePacket`, `routeEvent`, `injectTestEvent(eventOrPacket)`, and last-event access through `getState()` counters/fields.
9. Keep hidden/non-live behavior unchanged: events process while sound is enabled/unlocked, but no events are queued while Off/locked.

## Interfaces and Data Contracts
- Internal/test-exported `normalizePacket(pkt) -> SoundEvent | null`.
- `SoundEvent` shape: `{ id, type, modeHint, channelName, channelHash, isEmergency, isPriority, observationCount, hopCount, intensity, timestamp }` and no message text/sender fields.
- `routeEvent(soundEvent)` dispatches to the current mode strategy and returns `true` if accepted for playback, `false` if dropped.
- `window.__coloradoMeshSound.injectTestEvent(eventOrPacket)` accepts either a normalized event-like object or a packet-like object and returns whether routing accepted it.
- `getState()` includes `lastEvent`, `lastDroppedReason`, and expanded counters.

## Verification Plan
- Automated: `npm run lint`; `npm run typecheck`; `node --check corescope-overlay/denvermc-sound.js`; `npm run corescope:apply-overlay`; `git diff --check`; `git -C vendor/CoreScope status --short` after generated artifact cleanup.
- Manual/test seam: after `/map#/live`, use `window.__coloradoMeshSound.injectTestEvent(...)` with repeated same-hash packets to confirm dedupe/drop counters; use an emergency channel packet to confirm priority classification.
- Regression: CoreScope upstream audio remains disabled; no AudioContext creation happens on page load; no text/sender fields appear in normalized events.

## Stop Conditions
- If routing requires editing `vendor/CoreScope`, stop and keep the overlay-only wrapper approach.
- If actual audio synthesis becomes necessary to validate routing, stop and defer sound design to Step 4.
- If packet metadata is insufficient to classify channel priority without reading message text, use only channel/hash/type metadata and avoid text-derived behavior.
- If throttling risks dropping emergency channel metadata entirely, adjust the lane config rather than broadening event content.
