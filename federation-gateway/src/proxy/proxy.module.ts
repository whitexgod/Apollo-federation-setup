import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthProxyController } from './auth-proxy.controller';
import { MediaProxyController } from './media-proxy.controller';
import { OrdersProxyController } from './orders-proxy.controller';
import { ProxyService } from './proxy.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [AuthProxyController, MediaProxyController, OrdersProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
