import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN: string | number = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  constructor(private readonly usersService: UsersService) {
    // Load RSA keys from keys directory
    const keysPath = path.join(process.cwd(), 'keys');
    try {
      this.privateKey = fs.readFileSync(path.join(keysPath, 'jwtRS256.key'), 'utf8');
      this.publicKey = fs.readFileSync(path.join(keysPath, 'jwtRS256.key.pub'), 'utf8');
    } catch (error) {
      console.error('Failed to load JWT keys:', error.message);
      throw new Error('JWT keys not found. Please generate keys in the keys directory.');
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user by email
    const user = this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For demo purposes, we're using a simple password check
    // In production, use bcrypt.compare with hashed passwords
    const isPasswordValid = await this.validatePassword(password, user);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in user (in production, store hashed in DB)
    user.refreshToken = refreshToken;

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async validatePassword(password: string, user: User): Promise<boolean> {
    // For demo purposes, we're using a simple password comparison
    // In production, use bcrypt.compare with hashed passwords stored in DB
    if (!user.password) {
      return false;
    }
    return password === user.password;
  }

  async register(
    name: string,
    email: string,
    password: string,
    role?: string,
  ): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create user with password
    // In production, hash the password with bcrypt before storing
    const user = this.usersService.create(name, email, role, password);

    // Generate tokens
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in user (in production, store hashed in DB)
    user.refreshToken = refreshToken;

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign with RS256 algorithm using private key
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.JWT_EXPIRES_IN,
    } as any);
  }

  generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign with RS256 algorithm using private key with longer expiry
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as any);
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;

      // Find user
      const user = this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify refresh token matches stored token
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update stored refresh token
      user.refreshToken = newRefreshToken;

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
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

  getPublicKey(): string {
    return this.publicKey;
  }
}
