import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { CurrentSession, CurrentUser, Public, type SessionRecord, SignInService } from '@nestjs/authentication'
import type { Hex } from 'viem'
import { z } from 'zod'

import { NonceStore } from './nonce.store.js'
import type { SessionUser } from './siwe-session.provider.js'
import { SiweService } from './siwe.service.js'

const verifySchema = z.object({
  message: z.string().min(1).max(4096),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, 'must be a hex string'),
})

type VerifyBody = z.infer<typeof verifySchema>

export type SessionView = SessionUser & { expiresAt: string }

@Controller('auth')
export class AuthController {
  constructor(
    private readonly nonces: NonceStore,
    private readonly siwe: SiweService,
    private readonly signInService: SignInService,
  ) {}

  @Public()
  @Get('nonce')
  nonce(): { nonce: string } {
    return { nonce: this.nonces.issue() }
  }

  /** Verifies a signed SIWE message and starts a cookie session for its address. */
  @Public()
  @Post('verify')
  @HttpCode(200)
  async verify(@Body({ schema: verifySchema }) body: VerifyBody): Promise<SessionView> {
    const { address, chainId } = await this.siwe.verify(body.message, body.signature as Hex)
    const { session } = await this.signInService.signIn(address, { method: 'siwe', metadata: { chainId } })
    return { address, chainId, expiresAt: session.expiresAt.toISOString() }
  }

  /** The signed-in address; 401 without a session (the global guard). */
  @Get('session')
  session(@CurrentUser() user: SessionUser, @CurrentSession() session: SessionRecord): SessionView {
    return { ...user, expiresAt: session.expiresAt.toISOString() }
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(): Promise<void> {
    await this.signInService.signOut()
  }
}
