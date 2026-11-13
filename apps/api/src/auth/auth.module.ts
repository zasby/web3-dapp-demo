import { Module } from '@nestjs/common'

import { AuthController } from './auth.controller.js'
import { NonceStore } from './nonce.store.js'
import { SiweSessionProvider } from './siwe-session.provider.js'
import { SiweService } from './siwe.service.js'

@Module({
  controllers: [AuthController],
  providers: [NonceStore, SiweService, SiweSessionProvider],
})
export class AuthModule {}
