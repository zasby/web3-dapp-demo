import {
  AbiDecodingDataSizeTooSmallError,
  AbiDecodingZeroDataError,
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  HttpRequestError,
  UserRejectedRequestError,
} from 'viem'

export function isUserRejection(error: unknown): boolean {
  return error instanceof BaseError && error.walk((cause) => cause instanceof UserRejectedRequestError) !== null
}

/** Human-readable message for errors thrown by wagmi, viem or the wallet. */
export function getErrorMessage(error: unknown): string {
  if (isUserRejection(error)) return 'Request rejected in the wallet'
  if (error instanceof BaseError && error.walk((cause) => cause instanceof HttpRequestError)) {
    return 'Could not reach the network. The RPC node did not respond, try again later.'
  }
  if (error instanceof Error) {
    // Both viem and wagmi errors carry a one-line `shortMessage` next to the verbose `message`.
    const { shortMessage } = error as { shortMessage?: unknown }
    return typeof shortMessage === 'string' ? shortMessage : error.message
  }
  return 'Something went wrong'
}

/**
 * True when a contract call failed because of the contract (no code at the address, a revert,
 * data that does not decode), not because the RPC node was unreachable or rate-limited.
 */
export function isContractFailure(error: unknown): boolean {
  return (
    error instanceof BaseError &&
    error.walk(
      (cause) =>
        cause instanceof ContractFunctionZeroDataError ||
        cause instanceof ContractFunctionRevertedError ||
        cause instanceof AbiDecodingZeroDataError ||
        cause instanceof AbiDecodingDataSizeTooSmallError,
    ) !== null
  )
}
