## 1. Validation logic

- [x] 1.1 Add `getRecipientError(recipient, ownAddress)` to `apps/web/src/lib/recipient.ts`
- [x] 1.2 Unit tests: empty, invalid, own address (checksum and lowercase), other address

## 2. Send form

- [x] 2.1 Use `getRecipientError` in `SendForm.tsx` instead of the inline `isAddress` check
- [x] 2.2 Keep the Send button disabled while there is a recipient error

## 3. Verification

- [x] 3.1 `pnpm check` green (typecheck, lint, unit tests, scope check)
