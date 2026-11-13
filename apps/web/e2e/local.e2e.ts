import { parseEther } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

import { anvil, card, connectMockWallet, expect, MOCK_ADDRESS, switchNetwork, test } from './fixtures.ts'

test.beforeEach(async ({ page }) => {
  await anvil.setBalance({ address: MOCK_ADDRESS, value: parseEther('100') })
  await connectMockWallet(page)
  await switchNetwork(page, 'Anvil (local)')
  await expect(page.getByTestId('native-balance')).toHaveText('100 ETH')
})

test('sends ETH and shows pending, then confirmed', async ({ page }) => {
  const recipient = privateKeyToAddress(generatePrivateKey())
  const send = card(page, /^Send/)

  await send.getByRole('textbox', { name: 'Recipient' }).fill(recipient)
  await send.locator('input[name="amount"]').fill('1.5')
  await send.getByRole('button', { name: 'Send ETH' }).click()

  const status = send.getByRole('status')
  await expect(status).toHaveAttribute('data-stage', 'pending')
  await expect(send.getByRole('button', { name: 'Sending…' })).toBeDisabled()
  await expect(status).toHaveAttribute('data-stage', 'confirmed')
  await expect(status).toContainText(/Confirmed in block \d+/)

  expect(await anvil.getBalance({ address: recipient })).toBe(parseEther('1.5'))
  // 100 − 1.5 − gas, truncated to four decimals.
  await expect(page.getByTestId('native-balance')).toHaveText('98.4999 ETH')
  await expect(send.locator('input[name="amount"]')).toHaveValue('')
})

test('validates the send form', async ({ page }) => {
  const send = card(page, /^Send/)
  const submit = send.getByRole('button', { name: 'Send ETH' })
  const amount = send.locator('input[name="amount"]')

  await send.getByRole('textbox', { name: 'Recipient' }).fill('0x123')
  await expect(send).toContainText('Not a valid address')

  await amount.fill('1.1234567890123456789')
  await expect(send).toContainText('Enter a number with up to 18 decimals')
  await amount.fill('0')
  await expect(send).toContainText('The amount must be greater than zero')
  await amount.fill('1000')
  await expect(send).toContainText('Not enough ETH')
  await expect(submit).toBeDisabled()

  await send.getByRole('textbox', { name: 'Recipient' }).fill(MOCK_ADDRESS)
  await amount.fill('1')
  await expect(submit).toBeEnabled()
})

test('adds a custom token, keeps it after reload and removes it', async ({ page }) => {
  const tokens = card(page, /^Tokens/)
  const input = tokens.getByRole('textbox', { name: 'Token contract address' })
  const add = tokens.getByRole('button', { name: 'Add token' })

  await expect(tokens).toContainText('No tokens tracked on this network yet')
  await input.fill('nope')
  await add.click()
  await expect(tokens).toContainText('Not a valid address')

  // An account without code: every ERC-20 call fails.
  await input.fill('0x000000000000000000000000000000000000dEaD')
  await add.click()
  const row = tokens.getByTestId('token-row')
  await expect(row).toContainText('0x0000…dEaD')
  await expect(row).toContainText('Not an ERC-20 token')

  await input.fill('0x000000000000000000000000000000000000dead')
  await add.click()
  await expect(tokens).toContainText('This token is already in the list')

  await connectMockWallet(page)
  await switchNetwork(page, 'Anvil (local)')
  await expect(row).toContainText('Not an ERC-20 token')

  await row.getByRole('button', { name: 'Remove 0x0000…dEaD' }).click()
  await expect(row).toHaveCount(0)
})
