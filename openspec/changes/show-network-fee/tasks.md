## 1. Fee calculation

- [x] 1.1 Add `getFeeEstimate({ gas, maxFeePerGas, gasPrice })` to `apps/web/src/lib/fee.ts`
- [x] 1.2 Unit tests: EIP-1559 fee, legacy gasPrice fallback, missing data returns undefined

## 2. Send form

- [x] 2.1 Estimate gas for the exact transfer (native or ERC-20 `transfer`) with `useEstimateGas`
- [x] 2.2 Estimate fees with `useEstimateFeesPerGas`; run both queries only for a valid form
- [x] 2.3 Render "Network fee ≈ … <symbol>" below the amount; hide it when the estimate is missing

## 3. Verification

- [x] 3.1 `pnpm check` green (typecheck, lint, unit tests, scope check)
- [ ] 3.2 Owner review of the diff, then merge and `/opsx:archive`
