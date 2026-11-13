import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { type Address, erc20Abi, formatUnits, isAddress } from 'viem'
import { useBalance, useConfig, useWaitForTransactionReceipt } from 'wagmi'
import { sendTransaction, simulateContract, writeContract } from 'wagmi/actions'

import type { SupportedChain } from '../config/chains'
import type { TokenBalance, TokenRow } from '../hooks/useTokenBalances'
import { formatTokenAmount, parseTokenAmount } from '../lib/format'
import { getTransactionStage } from '../lib/transaction'
import { TransactionStatus } from './TransactionStatus'

type Asset =
  | { kind: 'native'; symbol: string; decimals: number; balance: bigint | undefined }
  | ({ kind: 'erc20' } & TokenBalance)

type Transfer = { asset: Asset; to: Address; value: bigint; description: string }

type Props = { address: Address; chain: SupportedChain; tokens: TokenRow[] }

export function SendForm({ address, chain, tokens }: Props) {
  const config = useConfig()
  const queryClient = useQueryClient()
  const addRecentTransaction = useAddRecentTransaction()
  const { data: nativeBalance } = useBalance({ address, chainId: chain.id })

  const [assetId, setAssetId] = useState<'native' | Address>('native')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const ownedTokens = tokens.filter(
    (row): row is Extract<TokenRow, { status: 'loaded' }> => row.status === 'loaded' && row.balance > 0n,
  )
  const token = ownedTokens.find((row) => row.address === assetId)
  const asset: Asset = token
    ? { ...token, kind: 'erc20' }
    : { kind: 'native', ...chain.nativeCurrency, balance: nativeBalance?.value }

  const transfer = useMutation({
    mutationFn: async ({ asset, to, value }: Transfer) => {
      if (asset.kind === 'native') return sendTransaction(config, { chainId: chain.id, to, value })
      // Simulate first: a transfer that would revert fails here, before the wallet asks to sign it.
      const { request } = await simulateContract(config, {
        chainId: chain.id,
        account: address,
        address: asset.address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to, value],
      })
      return writeContract(config, request)
    },
    onSuccess: (hash, { description }) => {
      addRecentTransaction({ hash, description })
      setAmount('')
    },
  })

  const receipt = useWaitForTransactionReceipt({ hash: transfer.data, chainId: chain.id })
  const stage = getTransactionStage({
    isSubmitting: transfer.isPending,
    submitError: transfer.error,
    hash: transfer.data,
    isConfirmed: receipt.isSuccess,
    receiptError: receipt.error,
  })

  useEffect(() => {
    if (!receipt.isSuccess) return
    void queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] === 'balance' || queryKey[0] === 'readContracts',
    })
  }, [receipt.isSuccess, queryClient])

  const value = parseTokenAmount(amount, asset.decimals)
  const recipientError = recipient && !isAddress(recipient) ? 'Not a valid address' : undefined
  const amountError = !amount
    ? undefined
    : value === undefined
      ? `Enter a number with up to ${asset.decimals} decimals`
      : value === 0n
        ? 'The amount must be greater than zero'
        : asset.balance !== undefined && value > asset.balance
          ? `Not enough ${asset.symbol}`
          : undefined
  const isBusy = stage === 'signing' || stage === 'pending'

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isBusy || !isAddress(recipient) || !value || amountError) return
    transfer.mutate({ asset, to: recipient, value, description: `Send ${amount.trim()} ${asset.symbol}` })
  }

  return (
    <section className="card" aria-labelledby="send-title">
      <h2 id="send-title" className="card__title">
        Send
      </h2>

      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Asset</span>
          <select
            className="input"
            value={asset.kind === 'native' ? 'native' : asset.address}
            onChange={(event) => setAssetId(event.target.value as 'native' | Address)}
          >
            <option value="native">
              {nativeBalance
                ? `${chain.nativeCurrency.symbol} · ${formatTokenAmount(nativeBalance.value, nativeBalance.decimals)}`
                : chain.nativeCurrency.symbol}
            </option>
            {ownedTokens.map((row) => (
              <option key={row.address} value={row.address}>
                {row.symbol} · {formatTokenAmount(row.balance, row.decimals)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Recipient</span>
          <input
            className="input input--mono"
            name="recipient"
            placeholder="0x…"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value.trim())}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(recipientError)}
          />
          {recipientError && <span className="form__error">{recipientError}</span>}
        </label>

        <label className="field">
          <span className="field__label">
            Amount
            {asset.balance !== undefined && (
              <span className="field__hint">
                Available: {formatTokenAmount(asset.balance, asset.decimals)} {asset.symbol}
              </span>
            )}
          </span>
          <span className="input-group">
            <input
              className="input"
              name="amount"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoComplete="off"
              aria-invalid={Boolean(amountError)}
            />
            {asset.kind === 'erc20' && (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setAmount(formatUnits(asset.balance, asset.decimals))}
              >
                Max
              </button>
            )}
          </span>
          {amountError && <span className="form__error">{amountError}</span>}
        </label>

        <button
          type="submit"
          className="button button--primary"
          disabled={isBusy || !isAddress(recipient) || !value || Boolean(amountError)}
        >
          {isBusy ? 'Sending…' : `Send ${asset.symbol}`}
        </button>
      </form>

      <TransactionStatus
        stage={stage}
        hash={transfer.data}
        error={transfer.error ?? receipt.error}
        blockNumber={receipt.data?.blockNumber}
        explorerUrl={chain.blockExplorers?.default.url}
      />
    </section>
  )
}
