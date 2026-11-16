## Context

`SendForm` knows when a transfer is confirmed (`receipt.isSuccess`) and which chain is active.

## Goals / Non-Goals

**Goals:**
- One-click reuse of the last 5 recipients on the current chain.

**Non-Goals:**
- Address book with names, syncing between devices, ENS.

## Decisions

- Pure functions in `lib/recentRecipients.ts`: `addRecentRecipient(list, address, limit = 5)` dedupes
  case-insensitively and puts the newest first; storage access is a thin wrapper with try/catch
  (private mode can throw).
- Key per chain: `recent-recipients:<chainId>`.
- Suggestions use a native `<datalist>` bound to the recipient input — no new dependency.

## Risks / Trade-offs

- `localStorage` is per browser; acceptable for a testnet demo.
