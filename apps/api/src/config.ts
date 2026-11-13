import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
  SEPOLIA_RPC_URL: z.url().optional(),
})

export type Env = z.infer<typeof envSchema>

/** `ConfigModule` validator: fails at startup with a readable message instead of at the first request. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)
  if (!result.success) throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`)
  return result.data
}
