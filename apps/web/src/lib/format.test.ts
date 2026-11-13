import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import { formatTokenAmount, shortenAddress } from './format'

describe('shortenAddress', () => {
  it('keeps the 0x prefix and the given number of chars on both sides', () => {
    expect(shortenAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe('0xd8dA…6045')
    expect(shortenAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 6)).toBe('0xd8dA6B…A96045')
  })
})

describe('formatTokenAmount', () => {
  it('formats whole and fractional amounts', () => {
    expect(formatTokenAmount(parseEther('1.5'), 18)).toBe('1.5')
    expect(formatTokenAmount(parseEther('2'), 18)).toBe('2')
  })

  it('truncates instead of rounding', () => {
    expect(formatTokenAmount(parseEther('1.99999'), 18)).toBe('1.9999')
    expect(formatTokenAmount(parseEther('0.123456'), 18, 2)).toBe('0.12')
  })

  it('groups thousands', () => {
    expect(formatTokenAmount(parseEther('1234567.25'), 18)).toBe('1,234,567.25')
  })

  it('shows zero as 0', () => {
    expect(formatTokenAmount(0n, 18)).toBe('0')
  })

  it('does not hide dust as zero', () => {
    expect(formatTokenAmount(1n, 18)).toBe('< 0.0001')
    expect(formatTokenAmount(1n, 18, 0)).toBe('< 0.1')
  })

  it('works with non-18 decimals', () => {
    expect(formatTokenAmount(1_500_000n, 6)).toBe('1.5')
  })
})
