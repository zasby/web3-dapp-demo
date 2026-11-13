import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type Address, getAddress, type Hex, type PublicClient } from 'viem'
import { parseSiweMessage, validateSiweMessage } from 'viem/siwe'

import type { Env } from '../config.js'
import { createSiweClients } from './chains.js'
import { NonceStore } from './nonce.store.js'

export type SiweIdentity = { address: Address; chainId: number }

@Injectable()
export class SiweService {
  /** The web app's host: a message signed for any other domain is refused. */
  private readonly domain: string
  private readonly clients: Map<number, PublicClient>

  constructor(
    config: ConfigService<Env, true>,
    private readonly nonces: NonceStore,
  ) {
    this.domain = new URL(config.get('WEB_ORIGIN', { infer: true })).host
    this.clients = createSiweClients({
      sepoliaRpcUrl: config.get('SEPOLIA_RPC_URL', { infer: true }),
      // The local anvil chain is for development and tests only.
      allowLocalChain: config.get('NODE_ENV', { infer: true }) !== 'production',
    })
  }

  /** Checks an EIP-4361 message and its signature; returns who signed it or throws a 401. */
  async verify(message: string, signature: Hex): Promise<SiweIdentity> {
    const parsed = parseSiweMessage(message)
    if (!parsed.address || !parsed.chainId || !parsed.nonce) {
      throw new UnauthorizedException('Not a valid SIWE message')
    }
    // Burn the nonce before anything else can fail, so a message is never accepted twice.
    if (!this.nonces.consume(parsed.nonce)) throw new UnauthorizedException('Unknown or expired nonce')
    if (!validateSiweMessage({ message: parsed, domain: this.domain })) {
      throw new UnauthorizedException('The message is for another domain or outside its validity window')
    }

    const client = this.clients.get(parsed.chainId)
    if (!client) throw new UnauthorizedException(`Chain ${parsed.chainId} is not supported`)

    // `eoa` recovers the signer offline first and only asks the chain for smart-contract wallets.
    const isValid = await client.verifyMessage({ address: parsed.address, message, signature, mode: 'eoa' })
    if (!isValid) throw new UnauthorizedException('The signature does not match the address')

    return { address: getAddress(parsed.address), chainId: parsed.chainId }
  }
}
