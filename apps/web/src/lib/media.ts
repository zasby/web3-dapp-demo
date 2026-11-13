const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'
const ARWEAVE_GATEWAY = 'https://arweave.net/'

/** Turns an NFT media URI into something an <img> can load; ipfs:// and ar:// go through public gateways. */
export function resolveMediaUrl(uri: string | undefined): string | undefined {
  const value = uri?.trim()
  if (!value) return undefined
  if (value.startsWith('ipfs://')) return IPFS_GATEWAY + value.slice('ipfs://'.length).replace(/^ipfs\//, '')
  if (value.startsWith('ar://')) return ARWEAVE_GATEWAY + value.slice('ar://'.length)
  if (/^https?:\/\//.test(value) || value.startsWith('data:image/')) return value
  return undefined
}
