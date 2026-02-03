import { Field, InputType } from '@nestjs/graphql'
import { RoleName } from '@prisma/client'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'

@InputType()
export class CreateRoleInput {
  @Field(() => RoleName)
  @IsEnum(RoleName)
  name: RoleName
}

@InputType()
export class UpdateRoleInput {
  @Field(() => RoleName, { nullable: true })
  @IsOptional()
  @IsEnum(RoleName)
  name?: RoleName
}

@InputType()
export class ManagePermissionInput {
  @Field()
  @IsString()
  permission_id: string

  @Field()
  @IsString()
  role_id: string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  can_do_the_action?: boolean
}
