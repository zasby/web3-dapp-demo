import { BaseError, HttpRequestError, UserRejectedRequestError } from 'viem'

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
