import { formatUnits } from 'viem'

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
