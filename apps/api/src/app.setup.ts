import { type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common'

/** Shared by main.ts and the e2e tests, so tests run the app as it is deployed. */
export function setupApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(new StandardSchemaValidationPipe())
  app.enableShutdownHooks()
  return app
}
