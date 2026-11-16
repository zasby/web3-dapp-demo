## Why

The Send form shows the amount and the balance, but not what the transfer itself will cost. On a
wallet with little native currency the user only finds out in the wallet popup that the fee does not
fit. The form should show the expected network fee before signing.

## What Changes

- Below the amount, the Send form shows "Network fee ≈ <amount> <native symbol>" once the recipient
  and the amount are valid.
- The estimate is the worst case the wallet may charge: estimated gas × `maxFeePerGas`.
- The fee calculation and formatting live in a pure, unit-tested function.

## Capabilities

### New Capabilities
- `send-fee-estimate`: showing the expected network fee in the Send form.

### Modified Capabilities

## Impact

- `apps/web/src/lib/fee.ts` — fee calculation and formatting
- `apps/web/src/lib/fee.test.ts` — unit tests
- `apps/web/src/components/SendForm.tsx` — estimate gas and fees with wagmi, render the line
- `apps/web/src/app/globals.css` — style for the fee line
