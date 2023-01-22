import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // Remove script-src and require-trusted-types-for for the Swagger endpoint
  // app.use(swaggerEndpoint, (req, res, next) => {
  //   const cspHeaders = res.getHeader('content-security-policy');

  //   res.set(
  //     'content-security-policy',
  //     cspHeaders.replace(/script-src.*;/, ''),
  //     //.replace(/require-trusted-types-for.*;/, ''),
  //   );

  //   next();
  // });

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
