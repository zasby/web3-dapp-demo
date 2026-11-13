import { parseSiweMessage } from 'viem/siwe'
import { describe, expect, it } from 'vitest'

import { createSignInMessage, SIGN_IN_STATEMENT } from './siwe'

describe('createSignInMessage', () => {
  it('binds the message to the site, the account and the nonce', () => {
    const now = new Date('2026-11-13T10:00:00.000Z')
    const message = createSignInMessage({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      chainId: 11155111,
      nonce: 'abc12345def',
      origin: 'http://localhost:3000',
      now,
    })

    expect(parseSiweMessage(message)).toMatchObject({
      domain: 'localhost:3000',
      uri: 'http://localhost:3000',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      chainId: 11155111,
      nonce: 'abc12345def',
      version: '1',
      statement: SIGN_IN_STATEMENT,
      issuedAt: now,
      expirationTime: new Date('2026-11-13T10:10:00.000Z'),
    })
  })
})
