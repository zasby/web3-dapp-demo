import { test as base, expect, type Page } from '@playwright/test'
import { createTestClient, http, publicActions } from 'viem'
import { foundry } from 'viem/chains'

/** Any address works: anvil runs with --auto-impersonate, so the mock wallet can send from it. */
export const MOCK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

/** Fails a test on React hydration errors and uncaught page exceptions. */
export const test = base.extend<{ pageErrors: void }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text())
      })
      await use()
      expect(errors).toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export const anvil = createTestClient({ mode: 'anvil', chain: foundry, transport: http() }).extend(publicActions)

/** Anvil's first default account: the anvil dev wallet signs for it. */
export const ANVIL_ACCOUNT_0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

/** Connects a dev wallet; with the local chain enabled it lands on anvil. */
export async function connectMockWallet(page: Page, wallet = { name: 'Mock wallet (dev)', address: MOCK_ADDRESS }) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Connect Wallet' }).click()
  await page.getByText(wallet.name).click()
  await expect(page.getByTestId('wallet-address')).toHaveText(wallet.address)
}

export const connectAnvilWallet = (page: Page) =>
  connectMockWallet(page, { name: 'Anvil account #0 (dev)', address: ANVIL_ACCOUNT_0 })

export async function switchNetwork(page: Page, name: string) {
  const button = page.getByRole('group', { name: 'Switch network' }).getByRole('button', { name, exact: true })
  if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
}

export const card = (page: Page, title: RegExp) =>
  page.locator('section', { has: page.getByRole('heading', { name: title }) })
