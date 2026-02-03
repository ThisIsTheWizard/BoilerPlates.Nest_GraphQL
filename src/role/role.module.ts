import { Module } from '@nestjs/common'

import { CommonService } from '@/common/common.service'

import { PrismaService } from '../prisma/prisma.service'

import { RoleResolver } from './role.resolver'
import { RoleService } from './role.service'

@Module({
  providers: [RoleService, RoleResolver, PrismaService, CommonService],
  exports: [RoleService]
})
export class RoleModule {}
