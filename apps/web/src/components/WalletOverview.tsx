import { useAccount } from 'wagmi'

import { CopyButton } from './CopyButton'
import { NativeBalance } from './NativeBalance'
import { NetworkSwitcher } from './NetworkSwitcher'

export function WalletOverview() {
  const { address, chain, chainId, connector } = useAccount()
  if (!address) return null

  const explorerUrl = chain?.blockExplorers?.default.url

  return (
    <section className="card" aria-labelledby="wallet-title">
      <h2 id="wallet-title" className="card__title">
        Wallet
        {connector && <span className="badge">{connector.name}</span>}
      </h2>

      <div className="field">
        <div className="field__label">Address</div>
        <div className="address">
          <code data-testid="wallet-address">{address}</code>
          <CopyButton value={address} />
          {explorerUrl && (
            <a className="button button--ghost" href={`${explorerUrl}/address/${address}`} target="_blank" rel="noreferrer">
              Explorer ↗
            </a>
          )}
        </div>
      </div>

      {chain ? (
        <NativeBalance address={address} chainId={chain.id} />
      ) : (
        <p role="alert" className="notice notice--warning">
          The wallet is on an unsupported network (chain id {chainId}). Switch to one of the testnets below.
        </p>
      )}

      <NetworkSwitcher currentChainId={chainId} />
    </section>
  )
}
