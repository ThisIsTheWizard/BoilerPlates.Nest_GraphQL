import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { RoleName } from '@prisma/client'

import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { GraphQLAuthGuard } from '@/guards/graphql-auth.guard'
import { GraphQLPermissionsGuard } from '@/guards/graphql-permissions.guard'
import { GraphQLRolesGuard } from '@/guards/graphql-roles.guard'

import { User } from './user.types'
import { CreateUserInput, UpdateUserInput } from './user.inputs'
import { UserService } from './user.service'

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.create')
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    const user = await this.userService.create(input)
    return user as User
  }

  @Query(() => [User])
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.read')
  async users(): Promise<User[]> {
    const users = await this.userService.findAll()
    return users as User[]
  }

  @Query(() => User)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.read')
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    const user = await this.userService.findOne({ where: { id } })
    if (!user) throw new Error('User not found')
    return user as User
  }

  @Mutation(() => User)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.update')
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput
  ): Promise<User> {
    const user = await this.userService.update(id, input)
    return user as User
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.delete')
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.userService.remove(id)
    return true
  }
}