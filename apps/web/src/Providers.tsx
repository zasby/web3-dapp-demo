import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'

import { defaultChain } from './config/chains'
import { APP_NAME, config } from './config/wagmi'

const queryClient = new QueryClient()

const theme = {
  lightMode: lightTheme({ accentColor: '#4f46e5' }),
  darkMode: darkTheme({ accentColor: '#818cf8' }),
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
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
