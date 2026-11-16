import { describe, expect, it } from 'vitest'

import { getFeeEstimate } from './fee'

describe('getFeeEstimate', () => {
  it('multiplies gas by the EIP-1559 fee cap', () => {
    expect(getFeeEstimate({ gas: 21_000n, maxFeePerGas: 2_000_000_000n, gasPrice: 1n })).toBe(42_000_000_000_000n)
  })

  it('falls back to the legacy gas price', () => {
    expect(getFeeEstimate({ gas: 21_000n, maxFeePerGas: undefined, gasPrice: 1_000_000_000n })).toBe(
      21_000_000_000_000n,
    )
  })

  it('is undefined while the gas amount is unknown', () => {
    expect(getFeeEstimate({ gas: undefined, maxFeePerGas: 1n, gasPrice: 1n })).toBeUndefined()
  })

  it('is undefined while no price is known', () => {
    expect(getFeeEstimate({ gas: 21_000n, maxFeePerGas: undefined, gasPrice: undefined })).toBeUndefined()
  })
})
