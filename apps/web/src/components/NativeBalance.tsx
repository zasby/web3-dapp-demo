import type { Address } from 'viem'
import { useBalance } from 'wagmi'

import { faucetUrls, type SupportedChainId } from '../config/chains'
import { getErrorMessage } from '../lib/errors'
import { formatTokenAmount } from '../lib/format'

const REFRESH_INTERVAL_MS = 15_000

export function NativeBalance({ address, chainId }: { address: Address; chainId: SupportedChainId }) {
  const { data, error, isPending, isFetching, refetch } = useBalance({
    address,
    chainId,
    query: { refetchInterval: REFRESH_INTERVAL_MS },
  })

  return (
    <div className="field">
      <div className="field__label">
        Balance
        <button
          type="button"
          className="button button--ghost"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Updating…' : 'Refresh'}
        </button>
      </div>

      {isPending && <p className="balance balance--loading">Loading…</p>}

      {error && (
        <p role="alert" className="notice notice--error">
          Could not load the balance: {getErrorMessage(error)}
        </p>
      )}

      {data && (
        <>
          <p className="balance" data-testid="native-balance">
            {formatTokenAmount(data.value, data.decimals)} <span className="balance__symbol">{data.symbol}</span>
          </p>
          {data.value === 0n && (
            <p className="hint">
              Empty wallet.{' '}
              <a href={faucetUrls[chainId]} target="_blank" rel="noreferrer">
                Get test {data.symbol} from a faucet
              </a>
            </p>
          )}
        </>
      )}
    </div>
  )
}
