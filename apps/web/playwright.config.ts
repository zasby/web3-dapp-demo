import { defineConfig } from '@playwright/test'

import { MOCK_ADDRESS } from './e2e/fixtures.ts'

const PORT = 3100

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
      command: `pnpm exec next dev --port ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: '.next-e2e',
        NEXT_PUBLIC_MOCK_WALLET_ADDRESS: MOCK_ADDRESS,
        NEXT_PUBLIC_LOCAL_CHAIN: 'true',
      },
    },
  ],
})
