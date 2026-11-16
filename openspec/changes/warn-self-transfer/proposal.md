## Why

A user can paste their own address into the Send form by mistake (it is shown right above the form).
The transfer then goes through, costs gas and moves nothing. The form should catch this before the
wallet asks to sign.

## What Changes

- The Send form warns when the recipient is the connected address (case-insensitive) and keeps the
  Send button disabled.
- The recipient validation moves out of the component into a pure, unit-tested function.

## Capabilities

### New Capabilities
- `send-validation`: validation rules for the recipient field of the Send form.

### Modified Capabilities

## Impact

- `apps/web/src/lib/recipient.ts` — new pure validation function
- `apps/web/src/lib/recipient.test.ts` — unit tests
- `apps/web/src/components/SendForm.tsx` — use the new validation, show the warning
