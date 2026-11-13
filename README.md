# web3 dApp demo

A small learning dApp on EVM testnets: wallet connection, balances and network switching first,
then tokens, transactions, Sign-In with Ethereum, a custom Solidity contract and an event indexer.
Only testnets are used, so no real funds are ever at risk.

## Roadmap

- [x] **1. Wallet** — connect MetaMask / any EVM wallet (RainbowKit), switch networks, show the address and the native balance.
- [ ] **2. Tokens and transactions** — ERC-20 and ERC-721 holdings, sending a transaction with pending → confirmed → failed states.
- [ ] **3. Sign-In with Ethereum** — SIWE message signing, signature verification on a NestJS backend.
- [ ] **4. Own contract** — Solidity + Foundry: tests, deployment to Sepolia, calls from the UI, event subscriptions.
- [ ] **5. Indexer** — Node.js + PostgreSQL event indexer, live feed over WebSocket, deployment.

## Stack

| Part | Tech |
| --- | --- |
| Web app (`apps/web`) | React 19, TypeScript, Vite, wagmi 2, viem 2, RainbowKit 2, TanStack Query |
| Tooling | pnpm workspaces, oxlint, Vitest |
| Networks | Sepolia, Base Sepolia, Filecoin Calibration (FEVM) |

wagmi stays on v2 because RainbowKit 2 does not support wagmi 3 yet.

## Getting started

Requirements: Node.js 22+, pnpm 11.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

The app runs at http://localhost:5173.

### Environment variables (`apps/web/.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_WALLETCONNECT_PROJECT_ID` | no | [Reown](https://dashboard.reown.com) project id. Enables WalletConnect (QR code, mobile wallets), MetaMask, Rabby and Coinbase Wallet entries. Without it only the browser-extension wallet is offered. |
| `VITE_SEPOLIA_RPC_URL` | no | Private Sepolia RPC (Alchemy, Infura, …). The public node is used as a fallback. |
| `VITE_MOCK_WALLET_ADDRESS` | no | Dev only. Adds a read-only **Mock wallet (dev)** to the connect modal that pretends to own this address — handy for checking the UI without a browser wallet and for e2e tests. It cannot sign and is not remembered across reloads. |

### Test funds

The app links to a faucet when the balance is zero: [Sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia),
[Base Sepolia](https://docs.base.org/base-chain/tools/network-faucets),
[Filecoin Calibration](https://faucet.calibnet.chainsafe-fil.io).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the web app |
| `pnpm typecheck` | `tsc -b` in every package |
| `pnpm lint` | oxlint in every package |
| `pnpm test` | Vitest in every package |

## Notes

- viem's default Sepolia RPC (thirdweb) rate-limits keyless browser requests and returns the 429
  without CORS headers, so the Sepolia chain definition is overridden with a public node
  (`apps/web/src/config/chains.ts`). The override also matters for `wallet_addEthereumChain`.
- Balances are truncated, not rounded, so the UI never shows more than the wallet holds.
