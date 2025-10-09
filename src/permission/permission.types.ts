import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { PermissionAction, PermissionModule } from '@prisma/client'

registerEnumType(PermissionAction, {
  name: 'PermissionAction'
})

registerEnumType(PermissionModule, {
  name: 'PermissionModule'
})

@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string

  @Field()
  action: PermissionAction

  @Field()
  module: PermissionModule

  @Field()
  created_at: Date

  @Field()
  updated_at: Date
}