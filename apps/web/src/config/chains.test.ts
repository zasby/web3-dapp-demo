import { describe, expect, it } from 'vitest'

import { faucetUrls, supportedChains } from './chains'

describe('chains', () => {
  it('supports testnets only', () => {
    expect(supportedChains.every((chain) => chain.testnet)).toBe(true)
  })

  it('has a faucet for every supported chain', () => {
    for (const chain of supportedChains) expect(faucetUrls[chain.id]).toMatch(/^https:\/\//)
  })

  it('does not use the rate-limited thirdweb RPC by default', () => {
    for (const chain of supportedChains) expect(chain.rpcUrls.default.http[0]).not.toContain('thirdweb')
  })
})
