import { connectorsForWallets, type Wallet, type WalletList } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { type Address, isAddress } from 'viem'
import { createConfig, createConnector, fallback, http } from 'wagmi'
import { mock } from 'wagmi/connectors'

import {
  baseSepolia,
  filecoinCalibration,
  localChain,
  sepolia,
  sepoliaPublicRpcUrls,
  supportedChains,
} from './chains'

const APP_NAME = 'web3 dApp demo'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL
const mockAddress = import.meta.env.VITE_MOCK_WALLET_ADDRESS

const MOCK_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" rx="6" fill="#6b7280"/><text x="14" y="19" font-size="14" text-anchor="middle" fill="#fff" font-family="sans-serif">M</text></svg>',
  )

/**
 * Read-only wallet for local development and e2e tests: it "owns" a fixed address,
 * supports network switching, but cannot sign anything. Unlike a real wallet it is
 * not remembered across page reloads — connect it again after a reload.
 */
function mockWallet(address: Address) {
  return (): Wallet => ({
    id: 'mock',
    name: 'Mock wallet (dev)',
    iconUrl: MOCK_ICON,
    iconBackground: '#6b7280',
    installed: true,
    createConnector: (walletDetails) =>
      createConnector((config) => ({
        ...mock({ accounts: [address] })(config),
        ...walletDetails,
      })),
  })
}

const walletList: WalletList = [
  {
    groupName: 'Recommended',
    // WalletConnect-based wallets (QR code, mobile) need a Reown project id.
    wallets: projectId
      ? [metaMaskWallet, rabbyWallet, coinbaseWallet, walletConnectWallet]
      : [injectedWallet],
  },
]

if (import.meta.env.DEV && mockAddress) {
  if (isAddress(mockAddress)) {
    walletList.push({ groupName: 'Development', wallets: [mockWallet(mockAddress)] })
  } else {
    console.warn(`VITE_MOCK_WALLET_ADDRESS is not a valid address: ${mockAddress}`)
  }
}

const sepoliaPublicTransports = sepoliaPublicRpcUrls.map((url) => http(url))

const connectors = connectorsForWallets(walletList, {
  appName: APP_NAME,
  projectId: projectId ?? 'not-configured',
})

export const config = createConfig({
  chains: supportedChains,
  connectors,
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

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export { APP_NAME }
