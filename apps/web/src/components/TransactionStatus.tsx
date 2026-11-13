import type { Hash } from 'viem'

import { getErrorMessage } from '../lib/errors'
import type { TransactionStage } from '../lib/transaction'

type Props = {
  stage: TransactionStage
  hash: Hash | undefined
  error: unknown
  blockNumber: bigint | undefined
  explorerUrl: string | undefined
}

export function TransactionStatus({ stage, hash, error, blockNumber, explorerUrl }: Props) {
  if (stage === 'idle') return null

  const { tone, text } = {
    signing: { tone: 'info', text: 'Confirm the transaction in your wallet…' },
    pending: { tone: 'info', text: 'Pending: waiting for the transaction to be included in a block…' },
    confirmed: { tone: 'success', text: `Confirmed in block ${blockNumber}.` },
    rejected: { tone: 'warning', text: 'Rejected in the wallet. Nothing was sent.' },
    failed: { tone: 'error', text: `Failed: ${getErrorMessage(error)}` },
  }[stage]

  return (
    <div role="status" className={`notice notice--${tone} tx-status`} data-stage={stage}>
      <span>{text}</span>
      {hash &&
        (explorerUrl ? (
          <a href={`${explorerUrl}/tx/${hash}`} target="_blank" rel="noreferrer">
            View transaction ↗
          </a>
        ) : (
          <code className="tx-status__hash">{hash}</code>
        ))}
    </div>
  )
}
