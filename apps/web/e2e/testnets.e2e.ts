import { expect, test } from '@playwright/test'

import { card, connectMockWallet, switchNetwork } from './fixtures.ts'

// Reads public testnet RPCs and Blockscout, so results depend on the network being up.
test.describe('public testnets', { tag: '@network' }, () => {
  test('shows ERC-20 balances and pages through NFTs on Sepolia', async ({ page }) => {
    await connectMockWallet(page)

    const tokens = card(page, /^Tokens/)
    for (const symbol of ['USDC', 'EURC', 'LINK', 'WETH']) {
      const row = tokens.getByTestId('token-row').filter({ hasText: symbol })
      await expect(row.locator('.token-row__balance')).toHaveText(/^[\d,.]+$/)
    }

    const nfts = card(page, /^NFTs/).getByTestId('nft-card')
    await expect(nfts).toHaveCount(50)
    await card(page, /^NFTs/).getByRole('button', { name: 'Load more' }).click()
    await expect(nfts).toHaveCount(100)
  })

  test('reads tokens on Filecoin Calibration through Multicall3', async ({ page }) => {
    await connectMockWallet(page)
    await switchNetwork(page, 'Filecoin Calibration')

    const rows = card(page, /^Tokens/).getByTestId('token-row')
    await expect(rows.filter({ hasText: 'USDFC' }).locator('.token-row__balance')).toHaveText('0')
    await expect(rows.filter({ hasText: 'WFIL' }).locator('.token-row__balance')).toHaveText('0')
    await expect(card(page, /^NFTs/)).toContainText('No NFTs on this network.')
  })

  test('shows a failed transaction when the wallet cannot send it', async ({ page }) => {
    await connectMockWallet(page)
    const send = card(page, /^Send/)

    await send.getByRole('textbox', { name: 'Recipient' }).fill('0x000000000000000000000000000000000000dEaD')
    await send.locator('input[name="amount"]').fill('0.001')
    await send.getByRole('button', { name: 'Send ETH' }).click()

    // The mock wallet cannot sign, so the public RPC refuses the transaction.
    const status = send.getByRole('status')
    await expect(status).toHaveAttribute('data-stage', 'failed')
    await expect(status).toContainText('Failed:')
  })
})
