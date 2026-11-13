# web3 dApp demo

A small learning dApp on EVM testnets: wallet connection, balances and network switching first,
then tokens, transactions, Sign-In with Ethereum, a custom Solidity contract and an event indexer.
Only testnets are used, so no real funds are ever at risk.

## Roadmap

- [x] **1. Wallet** — connect MetaMask / any EVM wallet (RainbowKit), switch networks, show the address and the native balance.
- [x] **2. Tokens and transactions** — ERC-20 balances read on-chain in one multicall (plus custom tokens by address), ERC-721 gallery, sending ETH or ERC-20 with pending → confirmed → failed states.
- [x] **3. Sign-In with Ethereum** — EIP-4361 message signed in the wallet, verified by a NestJS API (EOAs offline, smart wallets through ERC-1271 / ERC-6492), session in an HttpOnly cookie.
- [ ] **4. Own contract** — Solidity + Foundry: tests, deployment to Sepolia, calls from the UI, event subscriptions.
- [ ] **5. Indexer** — Node.js + PostgreSQL event indexer, live feed over WebSocket, deployment.

## Stack

| Part | Tech |
| --- | --- |
| Web app (`apps/web`) | Next.js 16 (App Router, Turbopack), React 19, TypeScript, wagmi 2, viem 2, RainbowKit 2, TanStack Query |
| API (`apps/api`) | NestJS 12 (ESM), `@nestjs/authentication` sessions, viem SIWE, Zod validation |
| Local chain | anvil (Foundry) from npm |
| Tests | Vitest (unit), supertest (API), Playwright with dev wallets (e2e) |
| Tooling | pnpm workspaces, oxlint |
| Networks | Sepolia, Base Sepolia, Filecoin Calibration (FEVM), local anvil in development |

wagmi stays on v2 because RainbowKit 2 does not support wagmi 3 yet.

## Getting started

Requirements: Node.js 22+, pnpm 11.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env   # optional, the defaults work locally
pnpm dev
```

`pnpm dev` starts the web app at http://localhost:3000 and the API at http://localhost:4000; the web app
proxies `/api/*` to the API. `pnpm --filter web build` and `pnpm --filter web start` build and serve the production version.

### Local chain

```bash
pnpm chain
```

starts anvil at `http://127.0.0.1:8545` (chain id 31337) with 2-second blocks, so the pending state of a
transaction is visible. Set `NEXT_PUBLIC_LOCAL_CHAIN=true` to add it to the network list. anvil runs with
`--auto-impersonate`, so the mock wallet can send from any address. Give it 100 ETH with

```bash
curl -s http://127.0.0.1:8545 -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"anvil_setBalance","params":["<address>","0x56BC75E2D63100000"]}'
```

or use one of the pre-funded anvil accounts it prints on start.

### Environment variables

`apps/web/.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | no | [Reown](https://dashboard.reown.com) project id. Enables WalletConnect (QR code, mobile wallets), MetaMask, Rabby and Coinbase Wallet entries. Without it only the browser-extension wallet is offered. |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | recommended | Private Sepolia RPC (Alchemy, Infura, …; free tiers are enough). Keyless public Sepolia nodes throttle and go down often; they are only a fallback. |
| `NEXT_PUBLIC_MOCK_WALLET_ADDRESS` | no | Dev only. Adds a read-only **Mock wallet (dev)** to the connect modal that pretends to own this address — for checking the UI without a browser wallet and for e2e tests. It cannot sign on public networks and is not remembered across reloads. |
| `NEXT_PUBLIC_LOCAL_CHAIN` | no | Dev only. `true` adds the local anvil chain to the network list, makes it the chain wallets connect to first, and adds the **Anvil account #0 (dev)** wallet, which can sign on anvil. |
| `API_URL` | no | Server only. Where `/api/*` is proxied. Default `http://localhost:4000`. |

`apps/api/.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port. |
| `WEB_ORIGIN` | `http://localhost:3000` | The web app's origin. Its host is the only SIWE `domain` the API accepts, and its pages may use the session cookie for POST requests. |
| `SEPOLIA_RPC_URL` | — | Private Sepolia RPC, used to verify smart-wallet signatures. |

### Test funds

The app links to a faucet when the balance is zero: [Sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia),
[Base Sepolia](https://docs.base.org/base-chain/tools/network-faucets),
[Filecoin Calibration](https://faucet.calibnet.chainsafe-fil.io). Test USDC and EURC come from the [Circle faucet](https://faucet.circle.com).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the web app |
| `pnpm chain` | Start the local anvil node |
| `pnpm typecheck` | `tsc -b` in every package |
| `pnpm lint` | oxlint in every package |
| `pnpm test` | Vitest in every package |
| `pnpm e2e` | Playwright e2e tests (see below) |

## Sign-In with Ethereum

```
browser ──/api/*──▶ Next.js (rewrite) ──▶ NestJS API
   1. GET  /auth/nonce     → single-use nonce, valid for 5 minutes
   2. wallet signs an EIP-4361 message: this site's domain, the address, the chain, the nonce, a 10-minute expiry
   3. POST /auth/verify    → nonce burned, domain, expiry and chain checked, signature verified
                             → session cookie (__Host-sid, HttpOnly, Secure, SameSite=Lax)
   4. GET  /auth/session   → the signed-in address; 401 without a session
   5. POST /auth/logout    → session deleted; the web app also signs out when the wallet disconnects
```

- The nonce is burned before anything else can fail, so a signed message is never accepted twice.
- Only the host of `WEB_ORIGIN` is accepted as the message domain, which stops a message signed on a
  phishing site from being replayed here; only Sepolia, Base Sepolia, Filecoin Calibration (and anvil outside
  production) are accepted as chains.
- `@nestjs/authentication` refuses sign-ins posted from other origins (login CSRF), replaces the previous
  session on sign-in (session fixation) and keeps sessions server-side; the cookie only holds a random token.
- EOA signatures are recovered offline; the RPC is only called for smart-contract wallets.
- Nonces and sessions live in memory for now: fine for one instance, lost on restart. The API refuses to start in
  production on in-memory session storage; stage 5 moves both to PostgreSQL.

## Testing

Unit tests cover amount parsing and formatting, error messages, transaction stages, the Blockscout response
parser and the chain and token config.

API tests (`pnpm --filter api test`) sign real SIWE messages with throwaway keys and run the whole flow through
supertest: sign-in, session, sign-out, replayed nonce, foreign domain, expired message, wrong signer,
unsupported chain, cross-origin sign-in and body validation.

End-to-end tests drive the real app in Google Chrome (`channel: 'chrome'`, no browser download) with the mock
wallet. Playwright starts anvil, its own API on port 4100 (built into `dist-e2e`) and its own `next dev` on port 3100
(building into `.next-e2e`), so they run next to `pnpm dev`. Every test also fails on React hydration errors and uncaught page exceptions.

```bash
pnpm --filter web e2e:local   # deterministic: anvil and the local API only
pnpm e2e                      # also the @network tests against Sepolia, Calibration and Blockscout
```

## Notes

- **SSR and the wallet state.** wagmi runs with `ssr: true` and cookie storage. The root layout reads the
  cookie with `cookieToInitialState`, so a returning user is rendered as "reconnecting" on the server and the
  first client render matches it, without a hydration mismatch or a flash of the disconnected state.
  RainbowKit is client-only, so the config is split: `config/wagmi.ts` (chains, transports, storage; safe on
  the server) and `config/connectors.ts` (RainbowKit wallets, used by the client providers).
- **Coinbase SDK in SSR.** RainbowKit's Base Account connector brings the Coinbase CDP SDK into the server
  bundle, and its x402 helpers lazily import optional peers that are not installed. Turbopack cannot resolve
  them, so the SDK is listed in `serverExternalPackages` and loaded from `node_modules` at runtime.
- **Plain `<img>` for NFTs.** NFT media lives on arbitrary hosts; `next/image` would need every host
  allow-listed or would turn the server into an open image proxy.
- **Public RPCs.** viem's default Sepolia RPC (thirdweb) rate-limits keyless browser requests and returns the 429
  without CORS headers, so the Sepolia chain definition uses public nodes instead, and the transport falls back
  between them, re-ranking them by latency and uptime every minute (`apps/web/src/config`). The default RPC
  also matters for `wallet_addEthereumChain`.
- **Multicall3 on Calibration.** viem does not list it for Filecoin Calibration, although it is deployed at the
  canonical address; the chain definition adds it so token balances load in one request.
- **Simulate before writing.** wagmi's `writeContract` does not simulate the call, so ERC-20 transfers run
  `simulateContract` first: a transfer that would revert fails before the wallet asks to sign it.
- **NFTs need an indexer.** An RPC node cannot list the tokens an address owns, and public nodes cap
  `eth_getLogs` at a few dozen blocks, so the gallery uses the keyless Blockscout API. Stage 5 replaces it
  with an own indexer.
- **Network errors are not token errors.** A token row says "Not an ERC-20 token" only when the contract
  returned no data, reverted or returned something that does not decode; a failing RPC shows "Could not load"
  with a retry.
- **NestJS 12.4.** NestJS 12 is ESM-only (relative imports end in `.js`, tests run on Vitest). The packages are
  on 12.4.2 rather than 12.5.0, which was a day old: pnpm's `minimumReleaseAge` policy holds back fresh releases,
  and that is worth keeping rather than bypassing.
- Balances are truncated, not rounded, so the UI never shows more than the wallet holds.
