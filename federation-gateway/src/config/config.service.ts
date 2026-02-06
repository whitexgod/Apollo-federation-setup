import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor() {
    // Load .env file
    const envFilePath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envFilePath });

    this.envConfig = {
      PORT: process.env.PORT || '4000',
      NODE_ENV: process.env.NODE_ENV || 'development',
      JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
      AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3000/graphql',
      NOTIFICATION_SERVICE_URL:
        process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002/graphql',
      AUTH_REST_SERVICE_URL: process.env.AUTH_REST_SERVICE_URL || 'http://localhost:3000',
      MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || 'http://localhost:3001',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      APOLLO_PLAYGROUND: process.env.APOLLO_PLAYGROUND || 'true',
      APOLLO_INTROSPECTION: process.env.APOLLO_INTROSPECTION || 'true',
    };
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getNumber(key: string): number {
    return parseInt(this.envConfig[key], 10);
  }

  getBoolean(key: string): boolean {
    return this.envConfig[key] === 'true';
  }

  isProduction(): boolean {
    return this.envConfig.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this.envConfig.NODE_ENV === 'development';
  }
}
