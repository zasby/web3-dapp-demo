import { formatUnits, parseUnits } from 'viem'

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}

/**
 * Formats a token amount for display. Fraction digits are truncated, not rounded,
 * so a balance is never shown as larger than it is.
 */
export function formatTokenAmount(value: bigint, decimals: number, maxFractionDigits = 4): string {
  const [integer, fraction = ''] = formatUnits(value, decimals).split('.')
  const shownFraction = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (value > 0n && integer === '0' && shownFraction === '') {
    return `< 0.${'0'.repeat(Math.max(maxFractionDigits - 1, 0))}1`
  }
  return shownFraction ? `${groupedInteger}.${shownFraction}` : groupedInteger
}

/**
 * Parses an amount typed by the user. Returns undefined unless it is a plain non-negative decimal
 * with at most `decimals` fraction digits (parseUnits would silently round the extra ones).
 */
export function parseTokenAmount(input: string, decimals: number): bigint | undefined {
  const value = input.trim()
  if (!/^\d*\.?\d*$/.test(value) || !/\d/.test(value)) return undefined
  const [integer, fraction = ''] = value.split('.')
  if (fraction.length > decimals) return undefined
  return parseUnits(`${integer || '0'}.${fraction || '0'}`, decimals)
}

/** NFT ids can be full uint256 values; keep long ones readable. */
export function shortenTokenId(tokenId: string, maxLength = 10): string {
  return tokenId.length > maxLength ? `${tokenId.slice(0, 4)}…${tokenId.slice(-4)}` : tokenId
}
