import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

// Controllers
import { AppController } from '@/app/app.controller'
import { TestController } from '@/test/test.controller'

// Modules
import { AuthModule } from '@/auth/auth.module'
import { PermissionModule } from '@/permission/permission.module'
import { RoleModule } from '@/role/role.module'
import { UserModule } from '@/user/user.module'

// Services
import { AppService } from '@/app/app.service'
import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
      driver: ApolloDriver,
      introspection: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()]
    }),
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule
  ],
  controllers: [AppController, TestController],
  providers: [AppService, PrismaService, CommonService]
})
export class AppModule {}
