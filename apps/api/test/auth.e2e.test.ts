import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import type { App } from 'supertest/types.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { baseSepolia, sepolia } from 'viem/chains'
import { createSiweMessage } from 'viem/siwe'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module.js'
import { setupApp } from '../src/app.setup.js'

const WEB_ORIGIN = 'http://localhost:3000'

describe('SIWE sign-in (e2e)', () => {
  let app: INestApplication<App>
  const account = privateKeyToAccount(generatePrivateKey())

  beforeAll(async () => {
    process.env.WEB_ORIGIN = WEB_ORIGIN
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = setupApp(moduleRef.createNestApplication())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  const api = () => request(app.getHttpServer())

  async function signedMessage(overrides: Partial<Parameters<typeof createSiweMessage>[0]> = {}) {
    const { body } = await api().get('/auth/nonce').expect(200)
    const message = createSiweMessage({
      domain: 'localhost:3000',
      address: account.address,
      statement: 'Sign in to web3 dApp demo.',
      uri: WEB_ORIGIN,
      version: '1',
      chainId: sepolia.id,
      nonce: body.nonce,
      ...overrides,
    })
    return { message, signature: await account.signMessage({ message }) }
  }

  const verify = (payload: object, origin = WEB_ORIGIN) =>
    api().post('/auth/verify').set('Origin', origin).send(payload)

  /** The `name=value` part of the session cookie, as a browser would send it back. */
  const sessionCookie = (response: request.Response) => {
    const header = response.get('Set-Cookie') ?? []
    return header.map((cookie) => cookie.split(';')[0]).find((cookie) => cookie.startsWith('__Host-sid='))
  }

  it('signs in with a valid signature and keeps the session in a cookie', async () => {
    await api().get('/auth/session').expect(401)

    const response = await verify(await signedMessage()).expect(200)
    expect(response.body).toMatchObject({ address: account.address, chainId: sepolia.id })
    const setCookie = response.get('Set-Cookie')?.join(';') ?? ''
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/SameSite=Lax/i)

    const cookie = sessionCookie(response)!
    const session = await api().get('/auth/session').set('Cookie', cookie).expect(200)
    expect(session.body).toMatchObject({ address: account.address, chainId: sepolia.id })
    expect(new Date(session.body.expiresAt).getTime()).toBeGreaterThan(Date.now())

    await api().post('/auth/logout').set('Origin', WEB_ORIGIN).set('Cookie', cookie).expect(204)
    await api().get('/auth/session').set('Cookie', cookie).expect(401)
  })

  it('does not accept the same signed message twice', async () => {
    const payload = await signedMessage()
    await verify(payload).expect(200)
    const replay = await verify(payload).expect(401)
    expect(replay.body.message).toBe('Unknown or expired nonce')
  })

  it('refuses a nonce the API did not issue', async () => {
    const payload = await signedMessage({ nonce: 'madeUpNonce123' })
    await verify(payload).expect(401)
  })

  it('refuses a message signed for another domain', async () => {
    const response = await verify(await signedMessage({ domain: 'evil.example' })).expect(401)
    expect(response.body.message).toMatch(/another domain/)
  })

  it('refuses an expired message', async () => {
    await verify(await signedMessage({ expirationTime: new Date(Date.now() - 1000) })).expect(401)
  })

  it('refuses a signature from another key', async () => {
    const { message } = await signedMessage()
    const signature = await privateKeyToAccount(generatePrivateKey()).signMessage({ message })
    const response = await verify({ message, signature }).expect(401)
    expect(response.body.message).toBe('The signature does not match the address')
  })

  it('refuses unsupported chains', async () => {
    const response = await verify(await signedMessage({ chainId: 1 })).expect(401)
    expect(response.body.message).toBe('Chain 1 is not supported')
    await verify(await signedMessage({ chainId: baseSepolia.id })).expect(200)
  })

  it('refuses a sign-in posted from another origin (login CSRF)', async () => {
    await verify(await signedMessage(), 'https://evil.example').expect(403)
  })

  it('validates the request body', async () => {
    const response = await verify({ message: '', signature: 'nope' }).expect(400)
    expect(response.body.message).toEqual(expect.arrayContaining([expect.stringMatching(/^signature:/)]))
  })
})
