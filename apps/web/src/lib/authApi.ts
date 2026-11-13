import type { Address, Hex } from 'viem'

/** The NestJS API, proxied by Next under /api so the session cookie stays first-party. */
const API_PREFIX = '/api'

export type Session = { address: Address; chainId: number; expiresAt: string }

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(API_PREFIX + path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    // Nest errors: { message: string | string[] }.
    const body: { message?: unknown } | null = await response.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join('; ') : body?.message
    throw new ApiError(typeof message === 'string' ? message : `The API responded with ${response.status}`, response.status)
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}

export async function fetchNonce(): Promise<string> {
  const { nonce } = await request<{ nonce: string }>('/auth/nonce')
  return nonce
}

/** The current session, or null when there is none. */
export async function fetchSession(): Promise<Session | null> {
  try {
    return await request<Session>('/auth/session')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export function verifySignIn(message: string, signature: Hex): Promise<Session> {
  return request('/auth/verify', { method: 'POST', body: JSON.stringify({ message, signature }) })
}

export function signOut(): Promise<void> {
  return request('/auth/logout', { method: 'POST' })
}
