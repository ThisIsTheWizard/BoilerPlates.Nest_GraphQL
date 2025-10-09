import { Field, InputType } from '@nestjs/graphql'
import { PermissionAction, PermissionModule } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

@InputType()
export class CreatePermissionInput {
  @Field(() => PermissionAction)
  @IsEnum(PermissionAction)
  action: PermissionAction

  @Field(() => PermissionModule)
  @IsEnum(PermissionModule)
  module: PermissionModule
}

@InputType()
export class UpdatePermissionInput {
  @Field(() => PermissionAction, { nullable: true })
  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction

  @Field(() => PermissionModule, { nullable: true })
  @IsOptional()
  @IsEnum(PermissionModule)
  module?: PermissionModule
}