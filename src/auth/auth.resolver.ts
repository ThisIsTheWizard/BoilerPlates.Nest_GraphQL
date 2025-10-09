import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { RoleName } from '@prisma/client'

import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { GqlUser } from '@/decorators/graphql-user.decorator'
import { GraphQLAuthGuard } from '@/guards/graphql-auth.guard'
import { GraphQLPermissionsGuard } from '@/guards/graphql-permissions.guard'
import { GraphQLRolesGuard } from '@/guards/graphql-roles.guard'

import { AuthPayload, User, UserResponse } from '@/user/user.types'
import { RegisterInput, LoginInput } from '@/user/user.inputs'
import {
  RefreshTokenInput,
  ChangeEmailInput,
  VerifyChangeEmailInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  VerifyForgotPasswordInput,
  AssignRoleInput
} from './auth.inputs'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserResponse)
  async register(@Args('input') input: RegisterInput): Promise<UserResponse> {
    return this.authService.register(input)
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input)
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthPayload> {
    return this.authService.refreshToken(input)
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async logout(@Context() context: any): Promise<boolean> {
    const token = context.req.headers.authorization?.replace('Bearer ', '')
    await this.authService.logout(token)
    return true
  }

  @Query(() => UserResponse)
  @UseGuards(GraphQLAuthGuard)
  async me(@GqlUser('user_id') user_id: string): Promise<UserResponse> {
    return this.authService.getAuthUser(user_id)
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async changeEmail(
    @Args('input') input: ChangeEmailInput,
    @GqlUser('user_id') user_id: string
  ): Promise<boolean> {
    await this.authService.changeEmail(input.email, user_id)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @GqlUser('user_id') user_id: string
  ): Promise<boolean> {
    await this.authService.changePassword(input, user_id)
    return true
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    await this.authService.forgotPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  async verifyForgotPassword(@Args('input') input: VerifyForgotPasswordInput): Promise<boolean> {
    await this.authService.verifyForgotPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.update')
  async assignRole(@Args('input') input: AssignRoleInput): Promise<boolean> {
    await this.authService.assignRole(input)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.update')
  async revokeRole(@Args('input') input: AssignRoleInput): Promise<boolean> {
    await this.authService.revokeRole(input)
    return true
  }
}