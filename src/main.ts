import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import 'dotenv/config'

import { AppModule } from '@/app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for all origins
  app.enableCors({ origin: '*' })

  // Global validation pipe for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const messages = errors
          .flatMap((error) => (error.constraints ? Object.values(error.constraints) : []))
          .map((msg) => msg.toUpperCase().replace(/\s+/g, '_'))
        return new BadRequestException({ messages, success: false })
      },
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true
    })
  )

  await app.listen(process.env.PORT ?? 3000)

  console.log(`====> Server running on port http://localhost:${process.env.PORT ?? 3000}/graphql <====`)
}

bootstrap()
