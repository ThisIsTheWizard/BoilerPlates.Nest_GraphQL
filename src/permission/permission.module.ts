import { Module } from '@nestjs/common'

import { CommonService } from '@/common/common.service'


import { PermissionResolver } from '@/permission/permission.resolver'
import { PermissionService } from '@/permission/permission.service'
import { PrismaService } from '@/prisma/prisma.service'

@Module({

  providers: [PermissionService, PermissionResolver, PrismaService, CommonService],
  exports: [PermissionService]
})
export class PermissionModule {}
