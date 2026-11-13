import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'

export const SIGN_IN_STATEMENT = 'Sign in to web3 dApp demo. This does not send a transaction or cost gas.'
const MESSAGE_TTL_MS = 10 * 60_000

/** An EIP-4361 message bound to this site: the API accepts only its own host as `domain`. */
export function createSignInMessage({
  address,
  chainId,
  nonce,
  origin,
  now = new Date(),
}: {
  address: Address
  chainId: number
  nonce: string
  origin: string
  now?: Date
}): string {
  return createSiweMessage({
    domain: new URL(origin).host,
    uri: origin,
    address,
    chainId,
    nonce,
    version: '1',
    statement: SIGN_IN_STATEMENT,
    issuedAt: now,
    expirationTime: new Date(now.getTime() + MESSAGE_TTL_MS),
  })
}
