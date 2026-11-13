/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Reown (WalletConnect) Cloud project id. Without it only browser-extension wallets are offered. */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
  /** Optional private Sepolia RPC (Alchemy, Infura, …). Public RPCs are used as a fallback. */
  readonly VITE_SEPOLIA_RPC_URL?: string
  /** Dev only: adds a read-only "Mock wallet" that pretends to own this address. */
  readonly VITE_MOCK_WALLET_ADDRESS?: string
  /** Dev only: `true` adds the local anvil chain (`pnpm chain`) to the network list. */
  readonly VITE_LOCAL_CHAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
