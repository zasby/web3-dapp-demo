import { useState } from 'react'
import { type Address, getAddress, isAddress } from 'viem'

const storageKey = (chainId: number) => `custom-tokens:${chainId}`

function readTokens(chainId: number): Address[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(chainId)) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string' && isAddress(value)) : []
  } catch {
    return []
  }
}

/** Tokens the user added by address on one chain; remount the owner when the chain changes. */
export function useCustomTokens(chainId: number) {
  const [tokens, setTokens] = useState(() => readTokens(chainId))

  const save = (next: Address[]) => {
    setTokens(next)
    try {
      localStorage.setItem(storageKey(chainId), JSON.stringify(next))
    } catch {
      // Storage can be unavailable (private mode); the list then lives until reload.
    }
  }

  return {
    tokens,
    add: (address: Address) => save([...tokens, getAddress(address)]),
    remove: (address: Address) => save(tokens.filter((token) => token !== address)),
  }
}
