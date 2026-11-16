## 1. List logic

- [ ] 1.1 Add `addRecentRecipient(list, address, limit)` and storage helpers to `apps/web/src/lib/recentRecipients.ts`
- [ ] 1.2 Unit tests: newest first, case-insensitive dedupe, limit of 5, storage errors are ignored

## 2. Send form

- [ ] 2.1 Save the recipient when `receipt.isSuccess` becomes true
- [ ] 2.2 Bind a `<datalist>` with the current chain's recent recipients to the recipient input

## 3. Verification

- [ ] 3.1 `pnpm check` green (typecheck, lint, unit tests, scope check)
- [ ] 3.2 Owner review of the diff, then merge and `/opsx:archive`
