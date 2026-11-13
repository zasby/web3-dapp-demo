import { connectorsForWallets, type Wallet, type WalletList } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { type Address, isAddress } from 'viem'
import { createConnector } from 'wagmi'
import { mock } from 'wagmi/connectors'

import { isLocalChainEnabled } from './chains'

export const APP_NAME = 'web3 dApp demo'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const mockAddress = process.env.NEXT_PUBLIC_MOCK_WALLET_ADDRESS

const MOCK_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" rx="6" fill="#6b7280"/><text x="14" y="19" font-size="14" text-anchor="middle" fill="#fff" font-family="sans-serif">M</text></svg>',
  )

/** First of the accounts anvil creates from its default mnemonic; anvil signs for it. */
const ANVIL_ACCOUNT_0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

/**
 * Wallet for local development and e2e tests: it "owns" a fixed address and supports network
 * switching. It forwards signing and sending to the current chain's RPC, so it can sign only on
 * anvil and only for anvil's own accounts (sending works for any address there thanks to
 * --auto-impersonate). Unlike a real wallet it is not remembered across page reloads.
 */
function mockWallet({ id, name, address }: { id: string; name: string; address: Address }) {
  return (): Wallet => ({
    id,
    name,
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

/** RainbowKit wallets; RainbowKit is client-only, so this runs in the browser and during SSR of client components. */
export function createConnectors() {
  const walletList: WalletList = [
    {
      groupName: 'Recommended',
      // WalletConnect-based wallets (QR code, mobile) need a Reown project id.
      wallets: projectId
        ? [metaMaskWallet, rabbyWallet, coinbaseWallet, walletConnectWallet]
        : [injectedWallet],
    },
  ]

  const devWallets = []
  if (process.env.NODE_ENV === 'development' && mockAddress) {
    if (isAddress(mockAddress)) devWallets.push(mockWallet({ id: 'mock', name: 'Mock wallet (dev)', address: mockAddress }))
    else console.warn(`NEXT_PUBLIC_MOCK_WALLET_ADDRESS is not a valid address: ${mockAddress}`)
  }
  if (isLocalChainEnabled) {
    devWallets.push(mockWallet({ id: 'anvil-account-0', name: 'Anvil account #0 (dev)', address: ANVIL_ACCOUNT_0 }))
  }
  if (devWallets.length > 0) walletList.push({ groupName: 'Development', wallets: devWallets })

  return connectorsForWallets(walletList, {
    appName: APP_NAME,
    projectId: projectId ?? 'not-configured',
  })
}
