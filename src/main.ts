import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting Messenger APP server... 🚀🚀🚀 ');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Messenger App Project')
    .setDescription('REST API documentation')
    .setVersion('1.0.0')
    .addTag('Documentation')
    // .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

 app.useGlobalPipes(new ValidationPipe());
    // app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: ['POST', 'PUT', 'DELETE', 'GET', 'PATCH'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
