import { defineConfig } from '@playwright/test'

import { MOCK_ADDRESS } from './e2e/fixtures.ts'

const PORT = 3100
const API_PORT = 4100

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
      // Its own API instance: SIWE accepts only the e2e web origin, and its sessions start empty.
      command: 'pnpm --dir ../api start:e2e',
      port: API_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(API_PORT), WEB_ORIGIN: `http://localhost:${PORT}` },
    },
    {
      command: `pnpm exec next dev --port ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: '.next-e2e',
        API_URL: `http://localhost:${API_PORT}`,
        NEXT_PUBLIC_MOCK_WALLET_ADDRESS: MOCK_ADDRESS,
        NEXT_PUBLIC_LOCAL_CHAIN: 'true',
      },
    },
  ],
})
