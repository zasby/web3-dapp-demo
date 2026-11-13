import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets the e2e server build into its own folder and run next to `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // RainbowKit → Base Account pulls the Coinbase CDP SDK into the SSR bundle. Its x402 payment helpers
  // lazily import optional peers that are not installed, which Turbopack cannot resolve; loading the SDK
  // from node_modules at runtime keeps those imports lazy.
  serverExternalPackages: ['@coinbase/cdp-sdk'],
}

export default nextConfig
