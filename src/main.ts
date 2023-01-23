import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AsyncApiDocumentBuilder } from 'nestjs-asyncapi';
import { AsyncApiModule } from 'nestjs-asyncapi/dist/lib/asyncapi.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerEndpoint = '/docs';
  app.enableCors();
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Bisrats Chat App ')
    .setContact('Ffuture Frontend', '', '')
    .setExternalDoc('Open API JSON', '/api-json')
    .addBearerAuth()
    .setVersion(process.env.BACKEND_VERSION)
    .build();

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Chat App')
    .setDescription('This a nestjs chat app implementing socket.io')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .addServer('ws protocol', {
      url: 'ws://localhost:3000',
      protocol: 'socket.io',
    })
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(
    app,
    asyncApiOptions,
  );
  await AsyncApiModule.setup('sock', app, asyncapiDocument);

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerEndpoint, app, document, {
    customCssUrl: '../storage/swagger-theme-flattop.css',
    customSiteTitle: 'KYG Trade™ API',
    customfavIcon: '../storage/swagger-icon.png',
    customCss: `
      .topbar, .models { display: none !important; }
      .swagger-ui { margin-bottom: 50px; }
      .swagger-ui .scheme-container { background: #fafafa; box-shadow: none; padding: 0; }
      .response-col_status { width: auto !important; }
    `,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
