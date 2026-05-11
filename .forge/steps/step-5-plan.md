# Step 5 Execution Plan: Strengthen Serial USB Safety and Unsupported-Browser Contracts

## Goal
Make the serial USB page’s safety states testable and explicit, and extend serial settings tests to cover nested secret/private/password fields without changing the visual design or broadening command scope.

## Current Code Observations
- `SerialUsbTool` already distinguishes `support` states: `unsupported`, `insecure`, and `ready`, and disables `Connect` when support is not ready.
- `SerialUsbTool` already disables manual send and settings Apply unless `connection === 'connected'`.
- Unsupported and insecure banners are visible in copy, but they do not have stable test IDs for Playwright coverage.
- `buildSerialSettingsPlan` already blocks private/secret/password/prv.key keys recursively via `containsBlockedKey`, but current tests only cover top-level `private_key`.
- `adaptUpstreamSerialProfile` already forces confirmation for mutating generated actions and blocks secret writes while allowing read-only `get ...` commands.
- The generated upstream profile includes read-only secret reads (`get guest.password`, `get bridge.secret`) plus mutating actions (`clock sync`, `clear stats`, `log start/stop`, `reboot`, `erase`, `region home`, GPS, power saving), so tests should preserve this distinction.
- `tests/e2e/smoke.spec.ts` already proves settings preview, invalid JSON error, and disabled Apply without connection.

## Files to Change
- `src/components/tools/SerialUsbTool.tsx` — add stable DOM test hooks/status labels for browser support and connection status without visual redesign.
- `src/lib/meshcore-tools/__tests__/serial-settings.test.ts` — add nested secret-field and mutating action coverage.
- `tests/e2e/smoke.spec.ts` — assert unsupported/no-connection state hooks and disabled Connect/Apply behavior.

## Ordered Implementation Checklist
1. Add `data-testid="serial-support-banner"` to the unsupported/insecure support banner wrapper.
2. Add `data-testid="serial-support-status"` to the connection status text so smoke tests can assert unsupported/idle states without relying on card layout.
3. Add `data-testid="serial-connect"` to the Connect button for stable disabled-state assertions.
4. Extend unit tests to reject nested secret/private/password fields such as `radio_settings.guest_password`, `owner.info.secret`, or array children.
5. Extend unit tests to assert representative generated mutating actions remain confirmation-gated and read-only secret-bearing commands remain allowed in read-only profiles.
6. Extend the serial USB smoke test to assert support/connection status hooks, disabled Connect in unsupported browser environments, disabled Apply without a port, invalid JSON error, and preview behavior.
7. Run Step 5 verification commands and keep fixes scoped to safety/testability only.

## Interfaces and Data Contracts
- `buildSerialSettingsPlan(input)` continues to return `{ ok: false, errors }` for blocked keys at any nesting depth.
- `SerialUsbTool` continues to require an active serial connection and explicit confirmation before settings commands can be sent.
- `data-testid` contracts added in this step:
  - `serial-support-banner`
  - `serial-support-status`
  - `serial-connect`
- Generated serial profile adaptation continues to use `@/lib/upstream-utilities`, not runtime `vendor/` imports.

## Verification Plan
- Automated:
  - `npm run test:unit -- --run src/lib/meshcore-tools/__tests__/serial-settings.test.ts`
  - `npm run test:e2e -- --grep "serial-usb"`
  - `npm run typecheck`
  - `npm run lint`
- Manual:
  - Open `/tools/serial-usb` in Chromium.
  - Paste valid settings JSON and confirm preview appears while Apply remains disabled without a connected port.
  - Paste malformed JSON and confirm the error appears and Apply remains disabled.
  - In the default Playwright/browser environment where Web Serial is unavailable, confirm the unsupported banner appears and Connect is disabled.
- Regression:
  - Canned mutating commands still require confirmation.
  - Read-only `get ... password/secret` commands still load.
  - No backend serial bridge, iframe, proxy, or third-party script is introduced.

## Stop Conditions
- Pause if changes require adding backend-mediated serial access, iframe/proxy behavior, or broad UI redesign.
- Pause if upstream-generated commands include a write to private/secret/password fields that cannot be safely adapted.
- Pause if tests require weakening the existing no-connection Apply guard.
