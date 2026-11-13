import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NonceStore } from './nonce.store.js'

describe('NonceStore', () => {
  let store: NonceStore

  beforeEach(() => {
    vi.useFakeTimers()
    store = new NonceStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('issues distinct alphanumeric nonces', () => {
    const a = store.issue()
    const b = store.issue()
    expect(a).toMatch(/^[a-zA-Z0-9]{8,}$/)
    expect(a).not.toBe(b)
  })

  it('accepts a nonce once', () => {
    const nonce = store.issue()
    expect(store.consume(nonce)).toBe(true)
    expect(store.consume(nonce)).toBe(false)
  })

  it('rejects unknown and expired nonces', () => {
    expect(store.consume('never-issued')).toBe(false)
    const nonce = store.issue()
    vi.advanceTimersByTime(5 * 60_000 + 1)
    expect(store.consume(nonce)).toBe(false)
  })
})
