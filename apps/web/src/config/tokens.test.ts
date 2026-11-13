import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import { knownTokens } from './tokens'

describe('knownTokens', () => {
  it('stores checksummed, unique addresses', () => {
    for (const tokens of Object.values(knownTokens)) {
      for (const address of tokens) expect(getAddress(address)).toBe(address)
      expect(new Set(tokens).size).toBe(tokens.length)
    }
  })
})
