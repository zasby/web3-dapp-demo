import type { Address } from 'viem'

import type { SupportedChain } from '../config/chains'
import { knownTokens } from '../config/tokens'
import { useCustomTokens } from '../hooks/useCustomTokens'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { NftGallery } from './NftGallery'
import { SendForm } from './SendForm'
import { TokenBalances } from './TokenBalances'

/** Everything that depends on the current chain; keyed by chain id so forms reset on a switch. */
export function ChainAssets({ address, chain }: { address: Address; chain: SupportedChain }) {
  const customTokens = useCustomTokens(chain.id)
  const tokenAddresses = [...(knownTokens[chain.id] ?? []), ...customTokens.tokens]
  const { rows, error } = useTokenBalances(address, chain.id, tokenAddresses)

  return (
    <>
      <SendForm address={address} chain={chain} tokens={rows} />
      <TokenBalances
        rows={rows}
        error={error}
        customTokens={customTokens.tokens}
        onAdd={customTokens.add}
        onRemove={customTokens.remove}
      />
      <NftGallery owner={address} chainId={chain.id} />
    </>
  )
}
