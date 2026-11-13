import { Injectable } from '@nestjs/common'
import { generateSiweNonce } from 'viem/siwe'

const NONCE_TTL_MS = 5 * 60_000
const MAX_NONCES = 10_000

/**
 * Nonces handed out for SIWE messages: single use and short-lived, so a signed message cannot be
 * replayed. In memory, which fits one API instance; stage 5 moves state to PostgreSQL.
 */
@Injectable()
export class NonceStore {
  private readonly expiries = new Map<string, number>()

  issue(): string {
    this.prune()
    // Map keeps insertion order: past the cap, drop the oldest nonce.
    if (this.expiries.size >= MAX_NONCES) this.expiries.delete(this.expiries.keys().next().value!)
    const nonce = generateSiweNonce()
    this.expiries.set(nonce, Date.now() + NONCE_TTL_MS)
    return nonce
  }

  /** True if the nonce was issued here and has not expired. Either way it cannot be used again. */
  consume(nonce: string): boolean {
    const expiresAt = this.expiries.get(nonce)
    this.expiries.delete(nonce)
    return expiresAt !== undefined && expiresAt > Date.now()
  }

  private prune() {
    const now = Date.now()
    for (const [nonce, expiresAt] of this.expiries) if (expiresAt <= now) this.expiries.delete(nonce)
  }
}
