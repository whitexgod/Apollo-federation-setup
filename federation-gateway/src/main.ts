import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log('');
  console.log('🚀 Federation Gateway (Supergraph) is running!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 GraphQL Endpoint:  http://localhost:${port}/graphql`);
  console.log(`📊 Health Check:      http://localhost:${port}/health`);
  console.log('');
  console.log('📦 Federated Subgraphs:');
  console.log('   - Users Service:   http://users-service:3001/graphql');
  console.log('   - Products Service: http://products-service:3002/graphql');
  console.log('');
  console.log('🔒 REST API Proxies:');
  console.log(`   - Auth:            http://localhost:${port}/api/auth/*`);
  console.log(`   - Media:           http://localhost:${port}/api/media/*`);
  console.log(`   - Orders:          http://localhost:${port}/api/orders/* (proxy to orders-service)`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🔄 Live reload: Active - Changes will auto-reload`);
  console.log('');
}

bootstrap();
