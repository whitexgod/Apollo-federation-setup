import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { APP_GUARD } from '@nestjs/core';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { ProxyModule } from './proxy/proxy.module';
import { HealthModule } from './health/health.module';
import { GraphqlGlobalAuthGuard } from './auth/guards/graphql-global-auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthPlugin } from './auth/plugins/auth.plugin';

@Module({
  imports: [
    ConfigModule,
    // Apollo Federation Gateway (Supergraph)
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService],
      useFactory: async (configService: ConfigService, authService: AuthService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'users',
                url: configService.get('USERS_SERVICE_URL') || 'http://users-service:3001/graphql',
              },
              {
                name: 'products',
                url: configService.get('PRODUCTS_SERVICE_URL') || 'http://products-service:3002/graphql',
              },
            ],
          }),
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                // Forward authorization header to subgraphs
                if (context.req?.headers?.authorization) {
                  request.http.headers.set(
                    'authorization',
                    context.req.headers.authorization,
                  );
                }
              },
            });
          },
        },
        server: {
          context: ({ req }) => ({ req }),
          plugins: [
            new AuthPlugin(authService),
            ApolloServerPluginLandingPageLocalDefault(),
          ],
          playground: false, // Disable old playground in favor of Apollo Sandbox
          introspection: true, // Enable introspection for GraphQL Playground/Sandbox
        },
      }),
    }),
    AuthModule,
    ProxyModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GraphqlGlobalAuthGuard,
    },
  ],
})
export class AppModule {}
