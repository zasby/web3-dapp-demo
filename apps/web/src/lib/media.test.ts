import { describe, expect, it } from 'vitest'

import { resolveMediaUrl } from './media'

describe('resolveMediaUrl', () => {
  it('routes ipfs:// and ar:// through gateways', () => {
    expect(resolveMediaUrl('ipfs://bafkreib6w4/1.png')).toBe('https://ipfs.io/ipfs/bafkreib6w4/1.png')
    expect(resolveMediaUrl('ipfs://ipfs/QmHash')).toBe('https://ipfs.io/ipfs/QmHash')
    expect(resolveMediaUrl('ar://txid')).toBe('https://arweave.net/txid')
  })

  it('keeps http(s) and inline images', () => {
    expect(resolveMediaUrl('https://dweb.link/ipfs/x')).toBe('https://dweb.link/ipfs/x')
    expect(resolveMediaUrl('data:image/svg+xml;base64,AAA')).toBe('data:image/svg+xml;base64,AAA')
  })

  it('drops anything an <img> should not load', () => {
    expect(resolveMediaUrl(undefined)).toBeUndefined()
    expect(resolveMediaUrl('  ')).toBeUndefined()
    expect(resolveMediaUrl('javascript:alert(1)')).toBeUndefined()
    expect(resolveMediaUrl('data:text/html,<b>x</b>')).toBeUndefined()
  })
})
