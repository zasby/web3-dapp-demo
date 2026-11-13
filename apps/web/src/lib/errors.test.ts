import { BaseError, UserRejectedRequestError } from 'viem'
import { describe, expect, it } from 'vitest'

import { getErrorMessage } from './errors'

describe('getErrorMessage', () => {
  it('recognizes a rejection anywhere in the cause chain', () => {
    const rejection = new UserRejectedRequestError(new Error('User denied'))
    expect(getErrorMessage(rejection)).toBe('Request rejected in the wallet')
    expect(getErrorMessage(new BaseError('Switch failed', { cause: rejection }))).toBe(
      'Request rejected in the wallet',
    )
  })

  it('prefers the short message of viem errors', () => {
    expect(getErrorMessage(new BaseError('Chain not configured', { details: 'long details' }))).toBe(
      'Chain not configured',
    )
  })

  it('falls back to message and to a generic text', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage('boom')).toBe('Something went wrong')
  })
})
