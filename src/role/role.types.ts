import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { RoleName } from '@prisma/client'

registerEnumType(RoleName, {
  name: 'RoleName'
})

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string

  @Field()
  name: RoleName

  @Field()
  created_at: Date

  @Field()
  updated_at: Date
}
