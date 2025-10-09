import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const GqlUser = createParamDecorator((data: string, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  const request = ctx.getContext().req
  const user = request.user

  return data ? user?.[data] : user
})