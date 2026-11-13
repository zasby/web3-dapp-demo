import { defineConfig } from '@playwright/test'

import { MOCK_ADDRESS } from './e2e/fixtures.ts'

const PORT = 5174

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.e2e.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // All tests share one anvil node and one mock address.
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'pnpm --dir ../.. chain', port: 8545, reuseExistingServer: true },
    {
      command: `pnpm exec vite --port ${PORT} --strictPort`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: { VITE_MOCK_WALLET_ADDRESS: MOCK_ADDRESS, VITE_LOCAL_CHAIN: 'true' },
    },
  ],
})
