import { cookieStorage, type CreateConnectorFn, createConfig, createStorage, fallback, http } from 'wagmi'

import {
  baseSepolia,
  filecoinCalibration,
  localChain,
  sepolia,
  sepoliaPublicRpcUrls,
  supportedChains,
} from './chains'

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
const sepoliaPublicTransports = sepoliaPublicRpcUrls.map((url) => http(url))

/**
 * The server calls it without connectors only to read the wallet state from the cookie, the browser
 * with the RainbowKit connectors (see connectors.ts). The cookie storage and `ssr: true` make the
 * first client render match the server one, so a connected user sees no "disconnected" flash.
 */
export function createWagmiConfig(connectors: CreateConnectorFn[] = []) {
  return createConfig({
    chains: supportedChains,
    connectors,
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      // A private RPC goes first; public ones are re-ranked every minute by latency and uptime.
      [sepolia.id]: sepoliaRpcUrl
        ? fallback([http(sepoliaRpcUrl), ...sepoliaPublicTransports])
        : fallback(sepoliaPublicTransports, { rank: { interval: 60_000 } }),
      [baseSepolia.id]: http(),
      [filecoinCalibration.id]: http(),
      [localChain.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof createWagmiConfig>
  }
}
