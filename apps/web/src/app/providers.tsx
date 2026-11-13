'use client'

import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { defaultChain } from '../config/chains'
import { APP_NAME, createConnectors } from '../config/connectors'
import { createWagmiConfig } from '../config/wagmi'

const theme = {
  lightMode: lightTheme({ accentColor: '#4f46e5' }),
  darkMode: darkTheme({ accentColor: '#818cf8' }),
}

export function Providers({ children, initialState }: { children: ReactNode; initialState: State | undefined }) {
  // One config and query cache per browser session, and per request on the server.
  const [config] = useState(() => createWagmiConfig(createConnectors()))
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={defaultChain}
          theme={theme}
          locale="en-US"
          appInfo={{ appName: APP_NAME }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
