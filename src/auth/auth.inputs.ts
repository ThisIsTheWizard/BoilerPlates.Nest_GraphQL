import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { IsPassword } from '@/decorators/password.decorator'

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString()
  access_token: string

  @Field()
  @IsString()
  refresh_token: string
}

@InputType()
export class ChangeEmailInput {
  @Field()
  @IsEmail()
  email: string
}

@InputType()
export class VerifyChangeEmailInput {
  @Field()
  @IsString()
  token: string
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsPassword()
  new_password: string

  @Field()
  @IsString()
  old_password: string
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  email: string
}

@InputType()
export class VerifyForgotPasswordInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsPassword()
  password: string

  @Field()
  @IsString()
  token: string
}

@InputType()
export class AssignRoleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  user_id: string

  @Field()
  @IsString()
  @IsNotEmpty()
  role_id: string
}

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsString()
  token: string
}

@InputType()
export class ResendVerificationInput {
  @Field()
  @IsEmail()
  email: string
}

@InputType()
export class VerifyUserPasswordInput {
  @Field()
  @IsString()
  password: string
}

@InputType()
export class CancelChangeEmailInput {
  @Field()
  @IsEmail()
  email: string
}

@InputType()
export class SetUserEmailInput {
  @Field()
  @IsEmail()
  new_email: string

  @Field()
  @IsString()
  @IsNotEmpty()
  user_id: string
}

@InputType()
export class SetUserPasswordInput {
  @Field()
  @IsPassword()
  password: string

  @Field()
  @IsString()
  @IsNotEmpty()
  user_id: string
}

@InputType()
export class VerifyForgotPasswordCodeInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsString()
  token: string
}