import { defineChain } from 'viem'
import { baseSepolia, filecoinCalibration, sepolia as viemSepolia } from 'viem/chains'

/**
 * viem's default Sepolia RPC (thirdweb) rate-limits keyless browser requests and the 429
 * comes without CORS headers. The default RPC is also what a wallet gets in
 * `wallet_addEthereumChain`, so replace it on the chain itself, not only in the transport.
 */
export const sepolia = defineChain({
  ...viemSepolia,
  rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] } },
})

export { baseSepolia, filecoinCalibration }

/** Testnets only: the app never touches mainnet funds. */
export const supportedChains = [sepolia, baseSepolia, filecoinCalibration] as const

export type SupportedChainId = (typeof supportedChains)[number]['id']

export const defaultChain = sepolia

export const faucetUrls: Record<SupportedChainId, string> = {
  [sepolia.id]: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  [baseSepolia.id]: 'https://docs.base.org/base-chain/tools/network-faucets',
  [filecoinCalibration.id]: 'https://faucet.calibnet.chainsafe-fil.io',
}
