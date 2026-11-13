import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets the e2e server build into its own folder and run next to `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // RainbowKit → Base Account pulls the Coinbase CDP SDK into the SSR bundle. Its x402 payment helpers
  // lazily import optional peers that are not installed, which Turbopack cannot resolve; loading the SDK
  // from node_modules at runtime keeps those imports lazy.
  serverExternalPackages: ['@coinbase/cdp-sdk'],
  // The NestJS API lives on its own port; proxying it keeps the session cookie first-party and
  // spares CORS.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.API_URL ?? 'http://localhost:4000'}/:path*` }]
  },
}

export default nextConfig
