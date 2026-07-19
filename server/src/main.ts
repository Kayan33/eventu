import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? '*',
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  )

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Eventu API')
    .setDescription('API para o projeto Eventu')
    .setVersion('1.0')
    .build();

    const document = () => SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document)
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
