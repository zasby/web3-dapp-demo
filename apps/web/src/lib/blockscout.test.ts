import { describe, expect, it } from 'vitest'

import { nftExplorerUrl, parseNftPage } from './blockscout'

const item = {
  id: '3',
  image_url: null,
  metadata: { name: 'Abraham #3', image: 'ipfs://bafkreib6w4' },
  token: { address_hash: '0x005f17ddb59d84749c6d66e1343fecd6628509d5', name: "Abraham's First Works (Test)" },
}

describe('parseNftPage', () => {
  it('maps items and keeps the cursor', () => {
    const page = parseNftPage({ items: [item], next_page_params: { token_id: '967' } })
    expect(page.items).toEqual([
      {
        contract: '0x005f17Ddb59D84749c6D66E1343fEcd6628509D5',
        tokenId: '3',
        name: 'Abraham #3',
        collectionName: "Abraham's First Works (Test)",
        imageUrl: 'https://ipfs.io/ipfs/bafkreib6w4',
      },
    ])
    expect(page.nextPageParams).toEqual({ token_id: '967' })
  })

  it('prefers the image Blockscout already resolved', () => {
    const page = parseNftPage({ items: [{ ...item, image_url: 'https://dweb.link/ipfs/bafkreib6w4' }] })
    expect(page.items[0].imageUrl).toBe('https://dweb.link/ipfs/bafkreib6w4')
  })

  it('skips malformed items and handles the last page', () => {
    const page = parseNftPage({
      items: [item, { id: '1', token: { address_hash: 'not-an-address' } }, { token: item.token }, null],
      next_page_params: null,
    })
    expect(page.items).toHaveLength(1)
    expect(page.nextPageParams).toBeNull()
  })

  it('throws on an unexpected payload', () => {
    expect(() => parseNftPage({ message: 'Not found' })).toThrow('Unexpected response from Blockscout')
  })
})

describe('nftExplorerUrl', () => {
  it('links to the token instance page', () => {
    expect(nftExplorerUrl('https://eth-sepolia.blockscout.com', { contract: '0x005f17Ddb59D84749c6D66E1343fEcd6628509D5', tokenId: '3' })).toBe(
      'https://eth-sepolia.blockscout.com/token/0x005f17Ddb59D84749c6D66E1343fEcd6628509D5/instance/3',
    )
  })
})
