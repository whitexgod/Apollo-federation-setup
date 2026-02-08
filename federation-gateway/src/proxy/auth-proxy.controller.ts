import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { Protected } from '../auth/decorators/protected.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/auth')
@Public() // All auth endpoints are public by default
export class AuthProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  /**
   * File upload endpoints (profile pictures)
   * JWT Protected route - requires valid authentication token
   */
  @All('profile-picture/*')
  @Protected() // Override controller-level @Public() to enforce JWT authentication
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async handleProfilePictureRequest(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const path = req.path.replace('/api/auth', '');

      // If file is present, forward as multipart
      if (file) {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);

        const result = await this.proxyService.forwardMultipartRequest(
          path,
          req.method,
          req.headers,
          formData,
        );

        res.status(result.status).json(result.data);
      } else {
        // Forward regular request
        const result = await this.proxyService.forwardToAuthService(
          path,
          req.method,
          req.headers,
          req.body,
          req.query,
        );

        res.status(result.status).json(result.data);
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Profile picture request failed',
        error: error.message,
      });
    }
  }

  /**
   * OAuth endpoints - Google OAuth callback
   */
  @All('google/*')
  async handleGoogleOAuthRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path.replace('/api/auth', '');
      const result = await this.proxyService.forwardToAuthService(
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );

      // Handle redirects for OAuth flow
      if (result.status >= 300 && result.status < 400 && result.headers.location) {
        res.redirect(result.status, result.headers.location);
      } else {
        res.status(result.status).json(result.data);
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'OAuth request failed',
        error: error.message,
      });
    }
  }

  /**
   * All other auth endpoints
   * No auth guard - auth service will handle authentication
   */
  // @All('*')
  // async handleProtectedRequest(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const path = req.path.replace('/api/auth', '');
  //     const result = await this.proxyService.forwardToAuthService(
  //       path,
  //       req.method,
  //       req.headers,
  //       req.body,
  //       req.query,
  //     );

  //     res.status(result.status).json(result.data);
  //   } catch (error) {
  //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       message: 'Proxy request failed',
  //       error: error.message,
  //     });
  //   }
  // }
}
