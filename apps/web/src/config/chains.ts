import { defineChain } from 'viem'
import {
  baseSepolia,
  filecoinCalibration as viemFilecoinCalibration,
  foundry,
  sepolia as viemSepolia,
} from 'viem/chains'

/**
 * Keyless public Sepolia RPCs. They throttle and go down regularly, so the transport falls back
 * between them (see wagmi.ts); set VITE_SEPOLIA_RPC_URL for a stable one.
 */
export const sepoliaPublicRpcUrls = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://eth-sepolia.api.onfinality.io/public',
  'https://1rpc.io/sepolia',
] as const

/**
 * viem's default Sepolia RPC (thirdweb) rate-limits keyless browser requests and the 429
 * comes without CORS headers. The default RPC is also what a wallet gets in
 * `wallet_addEthereumChain`, so replace it on the chain itself, not only in the transport.
 */
export const sepolia = defineChain({
  ...viemSepolia,
  rpcUrls: { default: { http: sepoliaPublicRpcUrls } },
})

/** viem does not list Multicall3 for Calibration, but it is deployed at the canonical address. */
export const filecoinCalibration = defineChain({
  ...viemFilecoinCalibration,
  contracts: { multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' } },
})

/** Local anvil node (`pnpm chain`), enabled with VITE_LOCAL_CHAIN=true in development. */
export const localChain = defineChain({ ...foundry, name: 'Anvil (local)' })

export { baseSepolia }

const testnets = [sepolia, baseSepolia, filecoinCalibration] as const
const isLocalChainEnabled = import.meta.env.DEV && import.meta.env.VITE_LOCAL_CHAIN === 'true'

/** Testnets only: the app never touches mainnet funds. */
export const supportedChains = isLocalChainEnabled ? ([...testnets, localChain] as const) : testnets

export type SupportedChainId = (typeof supportedChains)[number]['id']

export const defaultChain = sepolia

export const faucetUrls: Partial<Record<SupportedChainId, string>> = {
  [sepolia.id]: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  [baseSepolia.id]: 'https://docs.base.org/base-chain/tools/network-faucets',
  [filecoinCalibration.id]: 'https://faucet.calibnet.chainsafe-fil.io',
}

/** Blockscout explorers: their API needs no key, allows CORS and lists NFTs by owner. */
export const blockscoutUrls: Partial<Record<SupportedChainId, string>> = {
  [sepolia.id]: 'https://eth-sepolia.blockscout.com',
  [baseSepolia.id]: 'https://base-sepolia.blockscout.com',
  [filecoinCalibration.id]: 'https://filecoin-testnet.blockscout.com',
}

export type SupportedChain = (typeof supportedChains)[number]
