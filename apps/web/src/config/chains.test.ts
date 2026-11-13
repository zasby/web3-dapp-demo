import { describe, expect, it } from 'vitest'

import { faucetUrls, localChain, supportedChains } from './chains'

// The local anvil chain joins the list only when VITE_LOCAL_CHAIN is set, e.g. in .env.local.
const publicChains = supportedChains.filter((chain) => chain.id !== localChain.id)

describe('chains', () => {
  it('supports testnets only', () => {
    expect(publicChains.every((chain) => chain.testnet)).toBe(true)
  })

  it('has a faucet for every public chain', () => {
    for (const chain of publicChains) expect(faucetUrls[chain.id]).toMatch(/^https:\/\//)
  })

  it('does not use the rate-limited thirdweb RPC by default', () => {
    for (const chain of supportedChains) expect(chain.rpcUrls.default.http[0]).not.toContain('thirdweb')
  })
})
