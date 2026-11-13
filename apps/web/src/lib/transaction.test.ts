import { BaseError, UserRejectedRequestError } from 'viem'
import { describe, expect, it } from 'vitest'

import { getTransactionStage } from './transaction'

const base = { isSubmitting: false, submitError: null, hash: undefined, isConfirmed: false, receiptError: null }
const hash = '0xabc'

describe('getTransactionStage', () => {
  it('walks the happy path', () => {
    expect(getTransactionStage(base)).toBe('idle')
    expect(getTransactionStage({ ...base, isSubmitting: true })).toBe('signing')
    expect(getTransactionStage({ ...base, hash })).toBe('pending')
    expect(getTransactionStage({ ...base, hash, isConfirmed: true })).toBe('confirmed')
  })

  it('tells a rejection in the wallet from other submit errors', () => {
    const rejection = new BaseError('Request failed', { cause: new UserRejectedRequestError(new Error('denied')) })
    expect(getTransactionStage({ ...base, submitError: rejection })).toBe('rejected')
    expect(getTransactionStage({ ...base, submitError: new Error('insufficient funds') })).toBe('failed')
  })

  it('treats a reverted transaction as failed', () => {
    expect(getTransactionStage({ ...base, hash, receiptError: new Error('ERC20: insufficient balance') })).toBe('failed')
  })
})
