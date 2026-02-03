import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class User {
  @Field(() => ID)
  id: string

  @Field()
  email: string

  @Field(() => String, { nullable: true })
  first_name?: string | null

  @Field(() => String, { nullable: true })
  last_name?: string | null

  @Field(() => String, { nullable: true })
  phone_number?: string | null

  @Field()
  status: string

  @Field()
  created_at: Date

  @Field()
  updated_at: Date
}

@ObjectType()
export class AuthPayload {
  @Field()
  access_token: string

  @Field()
  refresh_token: string
}

@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string

  @Field()
  email: string

  @Field(() => String, { nullable: true })
  first_name?: string | null

  @Field(() => String, { nullable: true })
  last_name?: string | null

  @Field()
  status: string

  @Field(() => [String], { nullable: true })
  roles?: string[]
}
