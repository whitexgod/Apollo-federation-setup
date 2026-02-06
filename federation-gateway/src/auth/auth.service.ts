import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../config/config.service';

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  workspaceId?: string;
  privileges?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private jwksClient: jwksClient.JwksClient;
  private publicKey: string;
  private useJwks: boolean;

  constructor(private readonly configService: ConfigService) {
    // Try to load public key from keys directory first
    const publicKeyPath = path.join(process.cwd(), 'keys', 'jwtRS256.key.pub');

    if (fs.existsSync(publicKeyPath)) {
      try {
        this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        this.useJwks = true; // We have RSA public key
        console.log('✓ RSA public key loaded successfully for JWT verification');
      } catch (error) {
        console.error('Failed to load public key:', error.message);
        this.useJwks = false;
      }
    } else {
      console.warn('⚠ Public key file not found, will use JWT_SECRET');
      this.useJwks = false;
    }
  }

  /**
   * Verify and decode JWT token using JWKS or JWT_SECRET
   */
  verifyToken(token: string): JwtPayload {
    try {
      let decoded: any;

      if (this.useJwks && this.publicKey) {
        // Verify using RSA public key from JWKS
        decoded = jwt.verify(token, this.publicKey, {
          algorithms: ['RS256'],
        });
      } else {
        // Fallback to JWT_SECRET (HS256)
        const secret = this.configService.get('JWT_SECRET');
        decoded = jwt.verify(token, secret, {
          algorithms: ['HS256'],
        });
      }

      return {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        roles: decoded.roles || (decoded.role ? [decoded.role] : []),
        workspaceId: decoded.workspaceId,
        privileges: decoded.privileges || [],
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Convert JWK to PEM format
   */
  private jwkToPem(jwk: any): string {
    // For RSA keys, we need to construct PEM from modulus (n) and exponent (e)
    const NodeRSA = require('node-rsa');

    try {
      const key = new NodeRSA();
      key.importKey(
        {
          n: Buffer.from(jwk.n, 'base64'),
          e: Buffer.from(jwk.e, 'base64'),
        },
        'components-public',
      );
      return key.exportKey('public');
    } catch (error) {
      console.error('Error converting JWK to PEM:', error);
      throw new Error('Failed to convert JWK to PEM format');
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Validate if user has required role
   */
  hasRole(user: JwtPayload, requiredRole: string): boolean {
    return user.roles && user.roles.includes(requiredRole);
  }

  /**
   * Validate if user has any of the required roles
   */
  hasAnyRole(user: JwtPayload, requiredRoles: string[]): boolean {
    return user.roles && requiredRoles.some((role) => user.roles.includes(role));
  }

  /**
   * Validate if user has required privilege
   */
  hasPrivilege(user: JwtPayload, requiredPrivilege: string): boolean {
    return user.privileges && user.privileges.includes(requiredPrivilege);
  }

  /**
   * Check if token is valid (doesn't throw exception)
   */
  isTokenValid(token: string): boolean {
    try {
      this.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }
}
