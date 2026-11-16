type FeeInputs = {
  gas: bigint | undefined
  /** EIP-1559 fee cap per gas unit. */
  maxFeePerGas: bigint | undefined
  /** Legacy price, used only when the chain gives no maxFeePerGas. */
  gasPrice: bigint | undefined
}

/**
 * Worst-case network fee in wei: the most the wallet may charge for this transaction.
 * Undefined until both the gas amount and a price are known.
 */
export function getFeeEstimate({ gas, maxFeePerGas, gasPrice }: FeeInputs): bigint | undefined {
  const pricePerGas = maxFeePerGas ?? gasPrice
  if (gas === undefined || pricePerGas === undefined) return undefined
  return gas * pricePerGas
}
