import { isUserRejection } from './errors'

export type TransactionStage = 'idle' | 'signing' | 'pending' | 'confirmed' | 'rejected' | 'failed'

type TransactionState = {
  /** The wallet request (simulation, signing, broadcast) is in flight. */
  isSubmitting: boolean
  submitError: unknown
  hash: string | undefined
  isConfirmed: boolean
  /** wagmi throws here when the transaction is mined but reverted, with the revert reason. */
  receiptError: unknown
}

export function getTransactionStage(state: TransactionState): TransactionStage {
  if (state.isSubmitting) return 'signing'
  if (state.submitError) return isUserRejection(state.submitError) ? 'rejected' : 'failed'
  if (!state.hash) return 'idle'
  if (state.receiptError) return 'failed'
  return state.isConfirmed ? 'confirmed' : 'pending'
}
