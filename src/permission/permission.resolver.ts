import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { RoleName } from '@prisma/client'

import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { GraphQLAuthGuard } from '@/guards/graphql-auth.guard'
import { GraphQLPermissionsGuard } from '@/guards/graphql-permissions.guard'
import { GraphQLRolesGuard } from '@/guards/graphql-roles.guard'

import { Permission } from './permission.types'
import { CreatePermissionInput, UpdatePermissionInput } from './permission.inputs'
import { PermissionService } from './permission.service'

@Resolver(() => Permission)
@UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
@Roles(RoleName.admin, RoleName.developer)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @Mutation(() => Permission)
  @Permissions('permission.create')
  async createPermission(@Args('input') input: CreatePermissionInput): Promise<Permission> {
    return this.permissionService.create(input)
  }

  @Query(() => [Permission])
  @Permissions('permission.read')
  async permissions(): Promise<Permission[]> {
    return this.permissionService.findAll()
  }

  @Query(() => Permission)
  @Permissions('permission.read')
  async permission(@Args('id', { type: () => ID }) id: string): Promise<Permission> {
    return this.permissionService.findOne(id)
  }

  @Mutation(() => Permission)
  @Permissions('permission.update')
  async updatePermission(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePermissionInput
  ): Promise<Permission> {
    return this.permissionService.update(id, input)
  }

  @Mutation(() => Boolean)
  @Permissions('permission.delete')
  async deletePermission(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.permissionService.remove(id)
    return true
  }

  @Mutation(() => Boolean)
  @Permissions('permission.create')
  async seedPermissions(): Promise<boolean> {
    await this.permissionService.seedPermissions()
    return true
  }
}