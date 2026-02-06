import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GraphqlJwtAuthGuard } from './guards/graphql-jwt-auth.guard';
import { GraphqlGlobalAuthGuard } from './guards/graphql-global-auth.guard';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    GraphqlJwtAuthGuard,
    GraphqlGlobalAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, PassportModule, GraphqlJwtAuthGuard, GraphqlGlobalAuthGuard],
})
export class AuthModule {}
