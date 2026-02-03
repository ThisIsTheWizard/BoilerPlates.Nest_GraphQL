import { Module } from '@nestjs/common'

import { AuthTokenService } from '@/auth-token/auth-token.service'
import { CommonService } from '@/common/common.service'

import { PrismaService } from '@/prisma/prisma.service'
import { RoleModule } from '@/role/role.module'

import { UserResolver } from '@/user/user.resolver'
import { UserService } from '@/user/user.service'
import { VerificationTokenService } from '@/verification-token/verification-token.service'

@Module({
  imports: [RoleModule],

  providers: [UserService, UserResolver, PrismaService, CommonService, AuthTokenService, VerificationTokenService],
  exports: [UserService]
})
export class UserModule {}
