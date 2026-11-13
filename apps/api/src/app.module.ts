import { Module } from '@nestjs/common'
import { AuthenticationModule } from '@nestjs/authentication'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthModule } from './auth/auth.module.js'
import { type Env, validateEnv } from './config.js'
import { HealthController } from './health.controller.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Every route needs a session unless it is marked @Public().
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        session: {
          absoluteTtl: '7d',
          idleTtl: '1d',
          // The web app proxies /api to this server, so its pages are the ones sending the cookie.
          trustedOrigins: [config.get('WEB_ORIGIN', { infer: true })],
        },
      }),
    }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
