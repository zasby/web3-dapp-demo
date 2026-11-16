## Context

`SendForm` already builds the transfer: native `sendTransaction` or ERC-20 `transfer` through
`simulateContract`. wagmi 2 provides `useEstimateGas` and `useEstimateFeesPerGas`.

## Goals / Non-Goals

**Goals:**
- Show an upper-bound fee in the native currency before the wallet popup.
- Never block sending because the estimate failed: the line simply does not appear.

**Non-Goals:**
- Fee in fiat, custom gas settings, L2 data-availability fees (Base Sepolia shows the L2 part only).

## Decisions

- Gas is estimated for the exact call: a native transfer (`to`, `value`) or ERC-20 `transfer`
  encoded with `encodeFunctionData`, from the connected account.
- Fee = `gas × maxFeePerGas` — the most the wallet can charge, so the user is never surprised upward.
  Legacy chains without EIP-1559 fall back to `gasPrice`.
- `getFeeEstimate({ gas, maxFeePerGas, gasPrice })` returns `bigint | undefined`; formatting reuses
  `formatTokenAmount` (truncates, never rounds up).
- Queries run only when recipient and amount are valid (`query.enabled`), so typing does not spam
  the RPC.

## Risks / Trade-offs

- An estimate can fail for an ERC-20 the user cannot transfer (e.g. paused token). Then the line is
  hidden; the existing simulation still reports the real error on submit.
