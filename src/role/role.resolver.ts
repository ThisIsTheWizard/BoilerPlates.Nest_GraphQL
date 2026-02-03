import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { RoleName } from '@prisma/client'

import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { GraphQLAuthGuard } from '@/guards/graphql-auth.guard'
import { GraphQLPermissionsGuard } from '@/guards/graphql-permissions.guard'
import { GraphQLRolesGuard } from '@/guards/graphql-roles.guard'

import { CreateRoleInput, ManagePermissionInput, UpdateRoleInput } from './role.inputs'
import { RoleService } from './role.service'
import { Role } from './role.types'

@Resolver(() => Role)
@UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
@Roles(RoleName.admin, RoleName.developer)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Mutation(() => Role)
  @Permissions('role.create')
  async createRole(@Args('input') input: CreateRoleInput): Promise<Role> {
    return this.roleService.create(input)
  }

  @Query(() => [Role])
  @Permissions('role.read')
  async roles(): Promise<Role[]> {
    return this.roleService.findAll({})
  }

  @Query(() => Role)
  @Permissions('role.read')
  async role(@Args('id', { type: () => ID }) id: string): Promise<Role> {
    const role = await this.roleService.findOne({ where: { id } })
    if (!role) throw new Error('Role not found')
    return role
  }

  @Mutation(() => Role)
  @Permissions('role.update')
  async updateRole(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateRoleInput): Promise<Role> {
    return this.roleService.update(id, input)
  }

  @Mutation(() => Boolean)
  @Permissions('role.delete')
  async deleteRole(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.roleService.remove(id)
    return true
  }

  @Mutation(() => Boolean)
  @Permissions('role_permission.create')
  async assignPermission(@Args('input') input: ManagePermissionInput): Promise<boolean> {
    await this.roleService.assignPermission(input)
    return true
  }

  @Mutation(() => Boolean)
  @Permissions('role_permission.delete')
  async revokePermission(@Args('input') input: ManagePermissionInput): Promise<boolean> {
    await this.roleService.revokePermission(input)
    return true
  }

  @Mutation(() => Boolean)
  @Permissions('role.create')
  async seedRoles(): Promise<boolean> {
    await this.roleService.seedSystemRoles()
    return true
  }
}
