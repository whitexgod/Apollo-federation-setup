import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GraphqlJwtAuthGuard } from './graphql-jwt-auth.guard';

@Injectable()
export class GraphqlGlobalAuthGuard extends GraphqlJwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  // List of public operations that don't require authentication
  private readonly publicOperations = [
    'login',
    'register',
    'IntrospectionQuery',
    '__schema',
    '_service',
  ];

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Check if it's a GraphQL request by checking the context type
    const contextType = context.getType() as string;

    // If it's not a GraphQL request, let REST guards handle it
    if (contextType !== 'graphql') {
      // REST endpoints will be protected by JwtAuthGuard on their controllers
      return true;
    }

    // This is a GraphQL request
    // GraphQL authentication is now handled in the Apollo Gateway context
    // This guard is kept for consistency but defers to the context authentication
    return true;
  }
}
