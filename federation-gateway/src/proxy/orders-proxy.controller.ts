import { Controller, Req, Res, All, HttpException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { ConfigService } from '../config/config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/orders')
@UseGuards(JwtAuthGuard) // Protect all orders endpoints
export class OrdersProxyController {
  private readonly ordersServiceUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {
    this.ordersServiceUrl =
      this.configService.get('ORDERS_SERVICE_URL') || 'http://orders-service:3003';
  }

  @All()
  async proxyToOrdersServiceBase(@Req() req: Request, @Res() res: Response) {
    try {
      const targetUrl = `${this.ordersServiceUrl}/orders`;
      await this.proxyService.forwardRequest(req, res, targetUrl, 'Orders Service');
    } catch (error) {
      throw new HttpException(error.message || 'Orders service proxy error', error.status || 500);
    }
  }

  @All('*')
  async proxyToOrdersService(@Req() req: Request, @Res() res: Response) {
    try {
      // Get the path after /api/orders
      const originalPath = req.path.replace('/api/orders', '');
      const targetUrl = `${this.ordersServiceUrl}/orders${originalPath}`;

      await this.proxyService.forwardRequest(req, res, targetUrl, 'Orders Service');
    } catch (error) {
      throw new HttpException(error.message || 'Orders service proxy error', error.status || 500);
    }
  }
}
