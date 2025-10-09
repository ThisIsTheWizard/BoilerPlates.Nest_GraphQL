import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

import { RequestUser } from '@/auth/auth.interface'
import { PERMISSIONS_KEY } from '@/decorators/permissions.decorator'

@Injectable()
export class GraphQLPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredPermissions) {
      return true
    }

    // Ensure requiredPermissions is always an array
    const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    
    if (permissionsArray.length === 0) {
      return true
    }

    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req
    const userPermissions = request.user?.permissions ?? []

    const hasPermission = permissionsArray.some((permission) => userPermissions.includes(permission))
    if (!hasPermission) {
      throw new ForbiddenException('INSUFFICIENT_PERMISSION')
    }

    return true
  }
}