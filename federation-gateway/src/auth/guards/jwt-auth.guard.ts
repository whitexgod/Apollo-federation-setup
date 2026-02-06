import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = this.authService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const user = this.authService.verifyToken(token);

      // Attach user to request
      request.user = user;

      // Add user context headers for downstream services
      request.headers['x-user-id'] = user.userId;
      request.headers['x-user-email'] = user.email;
      request.headers['x-user-roles'] = JSON.stringify(user.roles || []);

      if (user.workspaceId) {
        request.headers['x-workspace-id'] = user.workspaceId;
      }

      if (user.privileges && user.privileges.length > 0) {
        request.headers['x-user-privileges'] = JSON.stringify(user.privileges);
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
