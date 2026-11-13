import { type Address, getAddress, isAddress } from 'viem'

import { resolveMediaUrl } from './media'

export type Nft = {
  contract: Address
  tokenId: string
  name: string | undefined
  collectionName: string | undefined
  imageUrl: string | undefined
}

export type NftPage = {
  items: Nft[]
  /** Opaque cursor for the next page, passed back as query parameters. */
  nextPageParams: Record<string, unknown> | null
}

type RawNft = {
  id?: unknown
  image_url?: unknown
  metadata?: { name?: unknown; image?: unknown } | null
  token?: { address_hash?: unknown; name?: unknown } | null
}

const asString = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)

/** Keeps only the fields the UI needs and drops malformed items instead of failing the whole page. */
export function parseNftPage(json: unknown): NftPage {
  const { items, next_page_params } = (json ?? {}) as { items?: unknown; next_page_params?: unknown }
  if (!Array.isArray(items)) throw new Error('Unexpected response from Blockscout')

  return {
    items: (items as (RawNft | null)[]).flatMap((item) => {
      const contract = asString(item?.token?.address_hash)
      const tokenId = asString(item?.id)
      if (!item || !contract || !isAddress(contract) || !tokenId) return []
      return {
        contract: getAddress(contract),
        tokenId,
        name: asString(item.metadata?.name),
        collectionName: asString(item.token?.name),
        imageUrl: resolveMediaUrl(asString(item.image_url) ?? asString(item.metadata?.image)),
      }
    }),
    nextPageParams:
      next_page_params && typeof next_page_params === 'object'
        ? (next_page_params as Record<string, unknown>)
        : null,
  }
}

/** ERC-721 tokens owned by `owner`, newest collections first, 50 per page. */
export async function fetchNfts(
  blockscoutUrl: string,
  owner: Address,
  pageParams: Record<string, unknown> | null,
  signal?: AbortSignal,
): Promise<NftPage> {
  const url = new URL(`/api/v2/addresses/${owner}/nft`, blockscoutUrl)
  url.searchParams.set('type', 'ERC-721')
  for (const [key, value] of Object.entries(pageParams ?? {})) url.searchParams.set(key, String(value))

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Blockscout responded with ${response.status}`)
  return parseNftPage(await response.json())
}

export function nftExplorerUrl(blockscoutUrl: string, nft: Pick<Nft, 'contract' | 'tokenId'>): string {
  return new URL(`/token/${nft.contract}/instance/${nft.tokenId}`, blockscoutUrl).toString()
}
