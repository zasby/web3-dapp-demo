## Why

Testing transfers means sending to the same few addresses again and again, and every time the
address has to be pasted by hand. The Send form should offer recently used recipients.

## What Changes

- After a confirmed transfer, the recipient is saved to a per-chain list of recent recipients
  (last 5, newest first) in `localStorage`.
- The recipient field shows the list as suggestions; picking one fills the field.

## Capabilities

### New Capabilities
- `recent-recipients`: remembering and suggesting recent transfer recipients.

### Modified Capabilities

## Impact

- `apps/web/src/lib/recentRecipients.ts` — pure list logic (add, dedupe, limit) and storage
- `apps/web/src/lib/recentRecipients.test.ts` — unit tests
- `apps/web/src/components/SendForm.tsx` — save on confirmation, render suggestions
