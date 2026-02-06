import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Module({
  providers: [AuthService, GqlAuthGuard],
  exports: [AuthService, GqlAuthGuard],
})
export class AuthModule {}
