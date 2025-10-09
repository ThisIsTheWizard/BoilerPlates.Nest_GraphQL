import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator'
import { IsPassword } from '@/decorators/password.decorator'

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  last_name?: string

  @Field()
  @IsPassword()
  password: string
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsString()
  password: string
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  last_name?: string

  @Field()
  @IsPassword()
  password: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone_number?: string
}

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  last_name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone_number?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  new_email?: string | null
}