import { Module } from '@nestjs/common'

import { AuthTokenService } from '@/auth-token/auth-token.service'
import { CommonService } from '@/common/common.service'
import { AuthGuard } from '@/guards/auth.guard'
import { PermissionsGuard } from '@/guards/permissions.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleModule } from '@/role/role.module'
import { UserController } from '@/user/user.controller'
import { UserResolver } from '@/user/user.resolver'
import { UserService } from '@/user/user.service'
import { VerificationTokenService } from '@/verification-token/verification-token.service'

@Module({
  imports: [RoleModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserResolver,
    PrismaService,
    CommonService,
    AuthTokenService,
    VerificationTokenService,
    AuthGuard,
    RolesGuard,
    PermissionsGuard
  ],
  exports: [UserService]
})
export class UserModule {}
