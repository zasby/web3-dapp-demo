import { type Address, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import type { SupportedChainId } from '../config/chains'

export type TokenBalance = {
  address: Address
  symbol: string
  name: string
  decimals: number
  balance: bigint
}

export type TokenRow =
  | ({ status: 'loaded' } & TokenBalance)
  | { status: 'loading'; address: Address }
  /** The calls reverted or returned garbage: most likely not an ERC-20 contract. */
  | { status: 'invalid'; address: Address }

const CALLS_PER_TOKEN = 4

/** Symbol, name, decimals and balance of every token in one multicall round-trip. */
export function useTokenBalances(owner: Address, chainId: SupportedChainId, tokens: readonly Address[]) {
  const { data, error, isFetching, refetch } = useReadContracts({
    contracts: tokens.flatMap((address) => [
      { address, chainId, abi: erc20Abi, functionName: 'symbol' } as const,
      { address, chainId, abi: erc20Abi, functionName: 'name' } as const,
      { address, chainId, abi: erc20Abi, functionName: 'decimals' } as const,
      { address, chainId, abi: erc20Abi, functionName: 'balanceOf', args: [owner] } as const,
    ]),
    query: { enabled: tokens.length > 0, refetchInterval: 30_000 },
  })

  const rows = tokens.map((address, index): TokenRow => {
    if (!data) return { status: 'loading', address }
    const [symbol, name, decimals, balance] = data
      .slice(index * CALLS_PER_TOKEN, (index + 1) * CALLS_PER_TOKEN)
      .map((call) => call.result)
    if (typeof symbol !== 'string' || typeof decimals !== 'number' || typeof balance !== 'bigint') {
      return { status: 'invalid', address }
    }
    return { status: 'loaded', address, symbol, name: typeof name === 'string' ? name : symbol, decimals, balance }
  })

  return { rows, error, isFetching, refetch }
}
