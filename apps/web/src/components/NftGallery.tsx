import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Address } from 'viem'

import { blockscoutUrls, type SupportedChainId } from '../config/chains'
import { fetchNfts, type Nft, nftExplorerUrl } from '../lib/blockscout'
import { getErrorMessage } from '../lib/errors'
import { shortenAddress, shortenTokenId } from '../lib/format'

export function NftGallery({ owner, chainId }: { owner: Address; chainId: SupportedChainId }) {
  const blockscoutUrl = blockscoutUrls[chainId]
  const { data, error, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['nfts', chainId, owner],
    queryFn: ({ pageParam, signal }) => fetchNfts(blockscoutUrl!, owner, pageParam, signal),
    initialPageParam: null as Record<string, unknown> | null,
    getNextPageParam: (lastPage) => lastPage.nextPageParams,
    enabled: Boolean(blockscoutUrl),
    staleTime: 60_000,
  })
  const nfts = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <section className="card" aria-labelledby="nfts-title">
      <h2 id="nfts-title" className="card__title">
        NFTs <span className="badge">ERC-721</span>
      </h2>

      {!blockscoutUrl ? (
        <p className="hint">Listing NFTs needs an indexer, and none is configured for this network.</p>
      ) : isPending ? (
        <p className="hint">Loading NFTs…</p>
      ) : error && nfts.length === 0 ? (
        <p role="alert" className="notice notice--error">
          Could not load NFTs: {getErrorMessage(error)}
        </p>
      ) : nfts.length === 0 ? (
        <p className="hint">No NFTs on this network.</p>
      ) : (
        <>
          <ul className="nft-grid">
            {nfts.map((nft) => (
              <NftCard key={`${nft.contract}-${nft.tokenId}`} nft={nft} href={nftExplorerUrl(blockscoutUrl, nft)} />
            ))}
          </ul>
          <div className="nft-footer">
            <span className="hint">
              {nfts.length} shown · indexed by <a href={blockscoutUrl} target="_blank" rel="noreferrer">Blockscout</a>
            </span>
            {hasNextPage && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function NftCard({ nft, href }: { nft: Nft; href: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  const tokenId = `#${shortenTokenId(nft.tokenId)}`

  return (
    <li>
      <a className="nft-card" href={href} target="_blank" rel="noreferrer" data-testid="nft-card">
        {nft.imageUrl && !imageFailed ? (
          <img
            className="nft-card__image"
            src={nft.imageUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="nft-card__image nft-card__image--empty">No image</span>
        )}
        <span className="nft-card__title">{nft.name ?? tokenId}</span>
        <span className="nft-card__collection">
          {nft.collectionName ?? shortenAddress(nft.contract)} · {tokenId}
        </span>
      </a>
    </li>
  )
}
