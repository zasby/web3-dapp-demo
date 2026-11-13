import { isAddressEqual } from 'viem'
import { useAccount, useChains } from 'wagmi'

import { type SignInStep, useSiweSession } from '../hooks/useSiweSession'
import { getErrorMessage } from '../lib/errors'
import { shortenAddress } from '../lib/format'

const STEP_LABELS: Record<SignInStep, string> = {
  nonce: 'Preparing…',
  signing: 'Sign the message in your wallet…',
  verifying: 'Verifying…',
}

export function SessionCard() {
  const { address } = useAccount()
  const chains = useChains()
  const { session, signIn, signOut, step } = useSiweSession()

  const current = session.data
  const isOwnSession = Boolean(current && address && isAddressEqual(current.address, address))
  const chainName = (chainId: number) => chains.find((chain) => chain.id === chainId)?.name ?? `chain ${chainId}`

  return (
    <section className="card" aria-labelledby="session-title">
      <h2 id="session-title" className="card__title">
        Session <span className="badge">Sign-In with Ethereum</span>
      </h2>

      {session.isPending ? (
        <p className="hint">Checking the session…</p>
      ) : session.error ? (
        <p role="alert" className="notice notice--error">
          The auth API is not reachable: {getErrorMessage(session.error)}
        </p>
      ) : current && isOwnSession ? (
        <>
          <p data-testid="session-status">
            Signed in as <code>{shortenAddress(current.address)}</code> on {chainName(current.chainId)} until{' '}
            {new Date(current.expiresAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
          </p>
          <p className="hint">
            The API (NestJS) verified the signature and keeps the session in an HttpOnly cookie, so scripts on
            the page cannot read it.
          </p>
          <div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
            >
              {signOut.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
          {signOut.error && (
            <p role="alert" className="notice notice--error">
              {getErrorMessage(signOut.error)}
            </p>
          )}
        </>
      ) : (
        <>
          {current && (
            <p className="notice notice--warning">
              The current session belongs to <code>{shortenAddress(current.address)}</code>. Sign in again to
              switch it to this wallet.
            </p>
          )}
          <p>Prove that you own this address by signing a message. Nothing is sent on-chain and it costs no gas.</p>
          <div>
            <button
              type="button"
              className="button button--primary"
              onClick={() => signIn.mutate()}
              disabled={signIn.isPending}
            >
              {step ? STEP_LABELS[step] : 'Sign in with Ethereum'}
            </button>
          </div>
          {signIn.error && (
            <p role="alert" className="notice notice--error">
              Sign-in failed: {getErrorMessage(signIn.error)}
            </p>
          )}
        </>
      )}
    </section>
  )
}
