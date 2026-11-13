import type { Address } from 'viem'

import { baseSepolia, filecoinCalibration, sepolia, type SupportedChainId } from './chains'

/** Well-known ERC-20 tokens. Symbol, name and decimals are read on-chain, so only addresses live here. */
export const knownTokens: Partial<Record<SupportedChainId, readonly Address[]>> = {
  [sepolia.id]: [
    '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC (Circle)
    '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4', // EURC (Circle)
    '0x779877A7B0D9E8603169DdbD7836e478b4624789', // LINK
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH
  ],
  [baseSepolia.id]: [
    '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC (Circle)
    '0x808456652fdb597867f38412077A9182bf77359F', // EURC (Circle)
    '0xE4aB69C077896252FAFBD49EFD26B5D171A32410', // LINK
    '0x4200000000000000000000000000000000000006', // WETH
  ],
  [filecoinCalibration.id]: [
    '0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0', // USDFC
    '0xaC26a4Ab9cF2A8c5DBaB6fb4351ec0F4b07356c4', // WFIL
  ],
}
