import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'

import { createWagmiConfig } from '../config/wagmi'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'web3 dApp demo',
  description: 'Wallet, tokens, NFTs and transactions on EVM testnets with wagmi, viem and RainbowKit.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(createWagmiConfig(), (await headers()).get('cookie'))

  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  )
}
