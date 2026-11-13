import { useSwitchChain } from 'wagmi'

import { getErrorMessage } from '../lib/errors'

export function NetworkSwitcher({ currentChainId }: { currentChainId: number | undefined }) {
  const { chains, switchChain, isPending, variables, error } = useSwitchChain()

  return (
    <div className="field">
      <div className="field__label">Network</div>
      <div className="chips" role="group" aria-label="Switch network">
        {chains.map((chain) => {
          const isCurrent = chain.id === currentChainId
          const isSwitching = isPending && variables?.chainId === chain.id
          return (
            <button
              key={chain.id}
              type="button"
              className="chip"
              aria-pressed={isCurrent}
              disabled={isCurrent || isPending}
              onClick={() => switchChain({ chainId: chain.id })}
            >
              {isSwitching ? 'Confirm in wallet…' : chain.name}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="notice notice--error">
          {getErrorMessage(error)}
        </p>
      )}
    </div>
  )
}
