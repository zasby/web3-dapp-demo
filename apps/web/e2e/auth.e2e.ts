import { ANVIL_ACCOUNT_0, card, connectAnvilWallet, connectMockWallet, expect, test } from './fixtures.ts'

test('signs in with Ethereum, keeps the session after reload and signs out', async ({ page }) => {
  await connectAnvilWallet(page)
  const session = card(page, /^Session/)

  await session.getByRole('button', { name: 'Sign in with Ethereum' }).click()
  await expect(session.getByTestId('session-status')).toContainText('Signed in as 0xf39F…2266 on Anvil (local)')

  // The API sees the session cookie the browser now sends through the /api proxy.
  const response = await page.request.get('/api/auth/session')
  expect(response.status()).toBe(200)
  expect(await response.json()).toMatchObject({ address: ANVIL_ACCOUNT_0, chainId: 31337 })

  // The dev wallet is not remembered across reloads, the session is.
  await connectAnvilWallet(page)
  await expect(session.getByTestId('session-status')).toContainText('Signed in as 0xf39F…2266')

  await session.getByRole('button', { name: 'Sign out' }).click()
  await expect(session.getByRole('button', { name: 'Sign in with Ethereum' })).toBeVisible()
  expect((await page.request.get('/api/auth/session')).status()).toBe(401)
})

test('flags a session that belongs to another wallet', async ({ page }) => {
  await connectAnvilWallet(page)
  const session = card(page, /^Session/)
  await session.getByRole('button', { name: 'Sign in with Ethereum' }).click()
  await expect(session.getByTestId('session-status')).toBeVisible()

  await connectMockWallet(page)
  await expect(session).toContainText('The current session belongs to 0xf39F…2266')
  await expect(session.getByRole('button', { name: 'Sign in with Ethereum' })).toBeVisible()
})

test('shows why sign-in fails when the wallet cannot sign', async ({ page }) => {
  // The mock wallet's address is impersonated by anvil, which has no key to sign with.
  await connectMockWallet(page)
  const session = card(page, /^Session/)
  await session.getByRole('button', { name: 'Sign in with Ethereum' }).click()
  await expect(session.getByRole('alert')).toContainText('Sign-in failed')
  expect((await page.request.get('/api/auth/session')).status()).toBe(401)
})
