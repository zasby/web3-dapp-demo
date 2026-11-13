import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { WalletOverview } from './components/WalletOverview'
import { supportedChains } from './config/chains'

export default function App() {
  const { status } = useAccount()

  return (
    <div className="layout">
      <header className="header">
        <h1 className="header__title">web3 dApp demo</h1>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </header>

      <main className="main">
        {status === 'connected' && <WalletOverview />}
        {(status === 'connecting' || status === 'reconnecting') && <p className="hint">Connecting to the wallet…</p>}
        {status === 'disconnected' && (
          <section className="card">
            <h2 className="card__title">Connect a wallet</h2>
            <p>
              Connect MetaMask or any other EVM wallet to see the address, the native balance and to switch
              networks. Only testnets are used, so no real funds are at risk.
            </p>
          </section>
        )}
      </main>

      <footer className="footer">Testnets: {supportedChains.map((chain) => chain.name).join(' · ')}</footer>
    </div>
  )
}
