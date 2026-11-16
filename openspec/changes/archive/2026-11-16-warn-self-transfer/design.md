## Context

`SendForm` validates the recipient inline with `isAddress`. The connected address is already passed
to the component as a prop.

## Goals / Non-Goals

**Goals:**
- Reject a transfer to the connected address with a clear message.
- Keep validation testable without rendering the component.

**Non-Goals:**
- ENS names, address books, contract-recipient warnings.

## Decisions

- New `getRecipientError(recipient, ownAddress)` in `lib/recipient.ts` returns a message or `undefined`.
- Addresses are compared with `isAddressEqual` from viem, so checksum and lowercase forms match.
- Empty input returns `undefined`: the form does not show errors before the user types.

## Risks / Trade-offs

- Someone may want to send to themselves on purpose (e.g. to unstick a nonce). Out of scope for a
  testnet demo; the warning blocks it, which is the safer default.
