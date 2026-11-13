import { BaseError, UserRejectedRequestError } from 'viem'

/** Human-readable message for errors thrown by wagmi, viem or the wallet. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof BaseError && error.walk((cause) => cause instanceof UserRejectedRequestError)) {
    return 'Request rejected in the wallet'
  }
  if (error instanceof Error) {
    // Both viem and wagmi errors carry a one-line `shortMessage` next to the verbose `message`.
    const { shortMessage } = error as { shortMessage?: unknown }
    return typeof shortMessage === 'string' ? shortMessage : error.message
  }
  return 'Something went wrong'
}
