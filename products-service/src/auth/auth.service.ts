import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly publicKey: string;

  constructor() {
    // Load RSA public key from keys directory
    const keysPath = path.join(process.cwd(), 'keys');
    try {
      this.publicKey = fs.readFileSync(path.join(keysPath, 'jwtRS256.key.pub'), 'utf8');
    } catch (error) {
      console.error('Failed to load JWT public key:', error.message);
      throw new Error('JWT public key not found in keys directory.');
    }
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
