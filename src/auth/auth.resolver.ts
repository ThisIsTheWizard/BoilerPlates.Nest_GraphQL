import { UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { RoleName } from '@prisma/client'
import { Request } from 'express'

import { GqlUser } from '@/decorators/graphql-user.decorator'
import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { GraphQLAuthGuard } from '@/guards/graphql-auth.guard'
import { GraphQLPermissionsGuard } from '@/guards/graphql-permissions.guard'
import { GraphQLRolesGuard } from '@/guards/graphql-roles.guard'

import { LoginInput, RegisterInput } from '@/user/user.inputs'
import { AuthPayload, UserResponse } from '@/user/user.types'
import {
  AssignRoleInput,
  CancelChangeEmailInput,
  ChangeEmailInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  RefreshTokenInput,
  ResendVerificationInput,
  SetUserEmailInput,
  SetUserPasswordInput,
  VerifyEmailInput,
  VerifyForgotPasswordCodeInput,
  VerifyForgotPasswordInput,
  VerifyUserPasswordInput
} from './auth.inputs'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserResponse)
  async register(@Args('input') input: RegisterInput): Promise<UserResponse> {
    return this.authService.register(input)
  }

  @Mutation(() => UserResponse)
  async verifyUserEmail(@Args('input') input: VerifyEmailInput): Promise<UserResponse> {
    return this.authService.verifyUserEmail(input)
  }

  @Mutation(() => Boolean)
  async resendVerificationEmail(@Args('input') input: ResendVerificationInput): Promise<boolean> {
    await this.authService.resendVerificationEmail(input)
    return true
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
  async logout(@Context() context: { req: Request }): Promise<boolean> {
    const token = context.req.headers.authorization?.replace('Bearer ', '')
    await this.authService.logout(token)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async changeEmail(@Args('input') input: ChangeEmailInput, @GqlUser('user_id') user_id: string): Promise<boolean> {
    await this.authService.changeEmail(input.email, user_id)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async cancelChangeEmail(@Args('input') input: CancelChangeEmailInput): Promise<boolean> {
    await this.authService.cancelChangeEmail(input)
    return true
  }

  @Mutation(() => UserResponse)
  @UseGuards(GraphQLAuthGuard)
  async verifyChangeEmail(@Args('token') token: string, @GqlUser('user_id') user_id: string): Promise<UserResponse> {
    return this.authService.verifyChangeEmail(token, user_id)
  }

  @Mutation(() => UserResponse)
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.update')
  async setUserEmail(@Args('input') input: SetUserEmailInput): Promise<UserResponse> {
    return this.authService.setUserEmail(input)
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
  @UseGuards(GraphQLAuthGuard, GraphQLRolesGuard, GraphQLPermissionsGuard)
  @Roles(RoleName.admin, RoleName.developer)
  @Permissions('user.update')
  async setUserPassword(@Args('input') input: SetUserPasswordInput): Promise<boolean> {
    await this.authService.setUserPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    await this.authService.forgotPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  async retryForgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    await this.authService.retryForgotPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  async verifyForgotPassword(@Args('input') input: VerifyForgotPasswordInput): Promise<boolean> {
    await this.authService.verifyForgotPassword(input)
    return true
  }

  @Mutation(() => Boolean)
  async verifyForgotPasswordCode(@Args('input') input: VerifyForgotPasswordCodeInput): Promise<boolean> {
    await this.authService.verifyForgotPasswordCode(input)
    return true
  }

  @Mutation(() => Boolean)
  @UseGuards(GraphQLAuthGuard)
  async verifyUserPassword(
    @Args('input') input: VerifyUserPasswordInput,
    @GqlUser('user_id') user_id: string
  ): Promise<boolean> {
    const result = await this.authService.verifyUserPassword(input.password, user_id)
    return result.success
  }

  @Query(() => UserResponse)
  @UseGuards(GraphQLAuthGuard)
  async me(@GqlUser('user_id') user_id: string): Promise<UserResponse> {
    return this.authService.getAuthUser(user_id)
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
