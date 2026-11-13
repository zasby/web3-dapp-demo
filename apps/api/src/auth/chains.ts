import { type Chain, createPublicClient, fallback, http, type PublicClient } from 'viem'
import { baseSepolia, filecoinCalibration, foundry, sepolia } from 'viem/chains'

// Keyless public Sepolia RPCs; viem's default one (thirdweb) is rate-limited.
const SEPOLIA_PUBLIC_RPC_URLS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://eth-sepolia.api.onfinality.io/public',
]

/**
 * Clients for the chains a SIWE message may name. An EOA signature is checked offline; the RPC is
 * only called for smart-contract wallets (ERC-1271 / ERC-6492).
 */
export function createSiweClients({
  sepoliaRpcUrl,
  allowLocalChain,
}: {
  sepoliaRpcUrl: string | undefined
  allowLocalChain: boolean
}): Map<number, PublicClient> {
  const entries: [Chain, ReturnType<typeof http> | ReturnType<typeof fallback>][] = [
    [
      sepolia,
      fallback([...(sepoliaRpcUrl ? [sepoliaRpcUrl] : []), ...SEPOLIA_PUBLIC_RPC_URLS].map((url) => http(url))),
    ],
    [baseSepolia, http()],
    [filecoinCalibration, http()],
  ]
  if (allowLocalChain) entries.push([foundry, http()])

  return new Map(
    entries.map(([chain, transport]) => [chain.id, createPublicClient({ chain, transport }) as PublicClient]),
  )
}
