import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { RoleName } from '@prisma/client'

import { RequestUser } from '@/auth/auth.interface'
import { ROLES_KEY } from '@/decorators/roles.decorator'

@Injectable()
export class GraphQLRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req
    const userRoles = request.user?.roles ?? []

    const hasRole = requiredRoles.some((role) => userRoles.includes(role))
    if (!hasRole) {
      throw new ForbiddenException('INSUFFICIENT_ROLE')
    }

    return true
  }
}