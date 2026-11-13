import { expect, type Page } from '@playwright/test'
import { createTestClient, http, publicActions } from 'viem'
import { foundry } from 'viem/chains'

/** Any address works: anvil runs with --auto-impersonate, so the mock wallet can send from it. */
export const MOCK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

export const anvil = createTestClient({ mode: 'anvil', chain: foundry, transport: http() }).extend(publicActions)

export async function connectMockWallet(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Connect Wallet' }).click()
  await page.getByText('Mock wallet (dev)').click()
  await expect(page.getByTestId('wallet-address')).toHaveText(MOCK_ADDRESS)
}

export async function switchNetwork(page: Page, name: string) {
  const button = page.getByRole('group', { name: 'Switch network' }).getByRole('button', { name, exact: true })
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
}

export const card = (page: Page, title: RegExp) =>
  page.locator('section', { has: page.getByRole('heading', { name: title }) })
