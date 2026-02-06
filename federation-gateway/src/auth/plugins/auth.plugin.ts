import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

export class AuthPlugin implements ApolloServerPlugin {
  constructor(private readonly authService: AuthService) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const authService = this.authService; // Capture authService in closure

    return {
      async didResolveOperation({ request, contextValue }) {
        // Check if this is an introspection query - allow without authentication
        const query = request.query || '';
        const operationName = request.operationName;

        const isIntrospectionQuery =
          operationName === 'IntrospectionQuery' ||
          query.includes('IntrospectionQuery') ||
          query.includes('__schema') ||
          query.includes('__type');

        if (isIntrospectionQuery) {
          return; // Allow introspection queries for GraphQL Playground
        }

        // Check if this is a public mutation (login or register)
        const isPublicMutation =
          query.includes('mutation') && (query.includes('login') || query.includes('register'));

        if (isPublicMutation) {
          return; // Allow login and register mutations without authentication
        }

        // Validate authentication for all other queries
        const req = contextValue.req;
        const authHeader = req?.headers?.authorization;

        if (!authHeader) {
          throw new UnauthorizedException('Authorization required');
        }

        // Verify token
        const token = authService.extractTokenFromHeader(authHeader);
        if (!token) {
          throw new UnauthorizedException('Invalid authorization header format');
        }

        try {
          const user = authService.verifyToken(token);
          req.user = user;
        } catch (error) {
          console.error('Token verification error:', error.message);
          throw new UnauthorizedException('Invalid or expired token');
        }
      },
    };
  }
}
