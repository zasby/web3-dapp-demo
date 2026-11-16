import { describe, expect, it } from 'vitest'

import { getRecipientError } from './recipient'

const own = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const other = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

describe('getRecipientError', () => {
  it('shows nothing for an empty field', () => {
    expect(getRecipientError('', own)).toBeUndefined()
  })

  it('rejects a string that is not an address', () => {
    expect(getRecipientError('0x123', own)).toBe('Not a valid address')
  })

  it('rejects the connected address in checksum form', () => {
    expect(getRecipientError(own, own)).toBe('This is your own address')
  })

  it('rejects the connected address in lowercase', () => {
    expect(getRecipientError(own.toLowerCase(), own)).toBe('This is your own address')
  })

  it('accepts another valid address', () => {
    expect(getRecipientError(other, own)).toBeUndefined()
  })
})
