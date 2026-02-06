import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { firstValueFrom } from 'rxjs';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check health of all subgraph services
   */
  async checkServices(): Promise<ServiceHealth[]> {
    const services = [
      {
        name: 'users-service',
        url: this.configService.get('USERS_SERVICE_URL') || 'http://users-service:3001/graphql',
        healthUrl:
          this.configService.get('USERS_SERVICE_URL')?.replace('/graphql', '') ||
          'http://users-service:3001',
        type: 'graphql',
      },
      {
        name: 'products-service',
        url:
          this.configService.get('PRODUCTS_SERVICE_URL') || 'http://products-service:3002/graphql',
        healthUrl:
          this.configService.get('PRODUCTS_SERVICE_URL')?.replace('/graphql', '') ||
          'http://products-service:3002',
        type: 'graphql',
      },
      {
        name: 'orders-service',
        url: this.configService.get('ORDERS_SERVICE_URL') || 'http://orders-service:3003',
        healthUrl: this.configService.get('ORDERS_SERVICE_URL') || 'http://orders-service:3003',
        type: 'rest',
      },
    ];

    const healthChecks = services.map((service) =>
      service.type === 'graphql'
        ? this.checkGraphQLService(service.name, service.url, service.healthUrl)
        : this.checkRestService(service.name, service.healthUrl),
    );

    return Promise.all(healthChecks);
  }

  /**
   * Check GraphQL service health using dedicated health endpoint
   */
  private async checkGraphQLService(
    name: string,
    graphqlUrl: string,
    healthUrl: string,
  ): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // First try the dedicated health endpoint
      const response = await firstValueFrom(
        this.httpService.get(`${healthUrl}/health`, {
          timeout: 5000,
        }),
      );

      const responseTime = Date.now() - startTime;

      if (response.status === 200 && response.data) {
        return {
          name,
          status: 'healthy',
          responseTime,
        };
      }

      return {
        name,
        status: 'unhealthy',
        responseTime,
        error: 'Invalid response',
      };
    } catch (error) {
      // Fallback: Try GraphQL introspection query
      try {
        const graphqlResponse = await firstValueFrom(
          this.httpService.post(
            graphqlUrl,
            {
              query: '{ __typename }',
            },
            {
              timeout: 5000,
            },
          ),
        );

        const responseTime = Date.now() - startTime;

        if (graphqlResponse.status === 200 && graphqlResponse.data) {
          return {
            name,
            status: 'healthy',
            responseTime,
          };
        }
      } catch (graphqlError) {
        // Both health and GraphQL checks failed
      }

      return {
        name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Check REST service health
   */
  private async checkRestService(name: string, baseUrl: string): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/health`, {
          timeout: 5000,
        }),
      );

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        return {
          name,
          status: 'healthy',
          responseTime,
        };
      }

      return {
        name,
        status: 'unhealthy',
        responseTime,
        error: 'Invalid response',
      };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Get overall gateway health status
   */
  async getOverallHealth(): Promise<{
    status: string;
    timestamp: string;
    services: ServiceHealth[];
    gateway: {
      uptime: number;
      memory: NodeJS.MemoryUsage;
    };
  }> {
    const services = await this.checkServices();
    const allHealthy = services.every((s) => s.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
      gateway: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  }
}
