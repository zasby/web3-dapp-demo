import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

import { fetchNonce, fetchSession, type Session, signOut, verifySignIn } from '../lib/authApi'
import { createSignInMessage } from '../lib/siwe'

const SESSION_KEY = ['siwe-session'] as const

export type SignInStep = 'nonce' | 'signing' | 'verifying'

/** Sign-In with Ethereum against the NestJS API: nonce → signed EIP-4361 message → cookie session. */
export function useSiweSession() {
  const { address, chainId } = useAccount()
  const queryClient = useQueryClient()
  const { signMessageAsync } = useSignMessage()
  const [step, setStep] = useState<SignInStep>()

  const session = useQuery({ queryKey: SESSION_KEY, queryFn: fetchSession, retry: false, staleTime: 60_000 })

  const signIn = useMutation({
    mutationFn: async () => {
      if (!address || !chainId) throw new Error('Connect a wallet first')
      try {
        setStep('nonce')
        const nonce = await fetchNonce()
        const message = createSignInMessage({ address, chainId, nonce, origin: window.location.origin })
        setStep('signing')
        const signature = await signMessageAsync({ message })
        setStep('verifying')
        return await verifySignIn(message, signature)
      } finally {
        setStep(undefined)
      }
    },
    onSuccess: (data) => queryClient.setQueryData<Session | null>(SESSION_KEY, data),
  })

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.setQueryData<Session | null>(SESSION_KEY, null),
  })

  return { session, signIn, signOut: signOutMutation, step }
}
