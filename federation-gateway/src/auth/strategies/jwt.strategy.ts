import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // Load RSA public key from keys directory
    const keysPath = path.join(process.cwd(), 'keys');
    let publicKey: string;
    
    try {
      publicKey = fs.readFileSync(path.join(keysPath, 'jwtRS256.key.pub'), 'utf8');
    } catch (error) {
      console.error('Failed to load JWT public key:', error.message);
      throw new Error('JWT public key not found in keys directory.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.userId || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
