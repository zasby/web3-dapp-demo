import { Injectable } from '@nestjs/common'
import { AuthenticationRegistry, type SessionRecord, SessionCookieProvider } from '@nestjs/authentication'
import { type Address, getAddress, isAddress } from 'viem'

/** Who a SIWE session belongs to: the address is the user id, the chain is where they signed in. */
export type SessionUser = { address: Address; chainId: number }

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: SessionUser
  }
}

/** Reads the session cookie that `SignInService` sets after a verified SIWE message. */
@Injectable()
export class SiweSessionProvider extends SessionCookieProvider<SessionUser> {
  constructor(registry: AuthenticationRegistry) {
    super()
    registry.registerProvider(this)
  }

  protected validate(session: SessionRecord): SessionUser | null {
    const chainId = session.metadata?.chainId
    if (!isAddress(session.userId) || typeof chainId !== 'number') return null
    return { address: getAddress(session.userId), chainId }
  }
}
