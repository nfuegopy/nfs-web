import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // nginx está delante: necesario para que el límite de intentos use la IP real.
  app.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: errors.flatMap((e) => Object.values(e.constraints ?? {})).join('. '),
        }),
    }),
  );

  await app.listen(process.env.PORT || 3100, process.env.HOST || '127.0.0.1');
}
bootstrap();
