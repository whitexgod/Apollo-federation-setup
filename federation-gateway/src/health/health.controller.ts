import { Controller, Get } from '@nestjs/common';
import { HealthService, ServiceHealth } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
@Public() // Health endpoints are public
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    services: ServiceHealth[];
    gateway: {
      uptime: number;
      memory: NodeJS.MemoryUsage;
    };
  }> {
    return this.healthService.getOverallHealth();
  }

  @Get('services')
  async getServicesHealth(): Promise<ServiceHealth[]> {
    return this.healthService.checkServices();
  }
}
