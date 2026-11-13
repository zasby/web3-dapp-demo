import { type FormEvent, useState } from 'react'
import { type Address, isAddress } from 'viem'

import type { TokenRow } from '../hooks/useTokenBalances'
import { getErrorMessage } from '../lib/errors'
import { formatTokenAmount, shortenAddress } from '../lib/format'

type Props = {
  rows: TokenRow[]
  error: unknown
  customTokens: readonly Address[]
  onAdd: (address: Address) => void
  onRemove: (address: Address) => void
}

export function TokenBalances({ rows, error, customTokens, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState<string>()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = input.trim()
    if (!isAddress(value)) return setInputError('Not a valid address')
    if (rows.some((row) => row.address.toLowerCase() === value.toLowerCase())) {
      return setInputError('This token is already in the list')
    }
    onAdd(value)
    setInput('')
    setInputError(undefined)
  }

  const failedToLoad = Boolean(error) && rows.every((row) => row.status === 'loading')

  return (
    <section className="card" aria-labelledby="tokens-title">
      <h2 id="tokens-title" className="card__title">
        Tokens <span className="badge">ERC-20</span>
      </h2>

      {failedToLoad && (
        <p role="alert" className="notice notice--error">
          Could not load token balances: {getErrorMessage(error)}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="hint">No tokens tracked on this network yet. Add one by its contract address.</p>
      ) : (
        !failedToLoad && (
          <ul className="token-list">
            {rows.map((row) => {
              const isCustom = customTokens.includes(row.address)
              const label = row.status === 'loaded' ? row.symbol : shortenAddress(row.address)
              return (
                <li key={row.address} className="token-row" data-testid="token-row">
                  <span className="token-row__main">
                    <span className="token-row__symbol">{label}</span>
                    <span className="token-row__name">
                      {row.status === 'loaded' ? row.name : row.status === 'loading' ? 'Loading…' : 'Not an ERC-20 token'}
                    </span>
                  </span>
                  <span className="token-row__balance">
                    {row.status === 'loaded' ? formatTokenAmount(row.balance, row.decimals) : '—'}
                  </span>
                  {isCustom && (
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => onRemove(row.address)}
                      aria-label={`Remove ${label}`}
                    >
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}

      <form className="inline-form" onSubmit={onSubmit} noValidate>
        <input
          className="input input--mono"
          placeholder="Token contract address (0x…)"
          aria-label="Token contract address"
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            setInputError(undefined)
          }}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(inputError)}
        />
        <button type="submit" className="button button--secondary">
          Add token
        </button>
      </form>
      {inputError && <p className="form__error">{inputError}</p>}
    </section>
  )
}
