import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/media')
@UseGuards(JwtAuthGuard) // Protect all media endpoints by default
export class MediaProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  /**
   * Media file upload endpoint - Multiple files
   * POST /api/media/upload
   */
  @All('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async handleMediaUpload(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      const path = '/media/upload';

      // If files are present, forward as multipart
      if (files && files.length > 0) {
        const FormData = require('form-data');
        const formData = new FormData();

        // Append all files
        files.forEach((file) => {
          formData.append('files', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
        });

        // Append other form fields from body
        Object.keys(req.body).forEach((key) => {
          formData.append(key, req.body[key]);
        });

        const result = await this.proxyService.forwardMultipartRequest(
          path,
          req.method,
          req.headers,
          formData,
          'media',
        );

        res.status(result.status).json(result.data);
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No files provided',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Media upload failed',
        error: error.message,
      });
    }
  }

  /**
   * Media file update endpoint - Single file
   * POST /api/media/update
   */
  @All('update')
  @UseInterceptors(FileInterceptor('file'))
  async handleMediaUpdate(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const path = '/media/update';

      // If file is present, forward as multipart
      if (file) {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

        // Add query params to form data
        Object.keys(req.query).forEach((key) => {
          formData.append(key, req.query[key] as string);
        });

        const result = await this.proxyService.forwardMultipartRequest(
          path,
          req.method,
          req.headers,
          formData,
          'media',
        );

        res.status(result.status).json(result.data);
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No file provided',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Media update failed',
        error: error.message,
      });
    }
  }

  /**
   * Get signed URLs endpoint
   * GET /api/media/signed-urls
   */
  @All('signed-urls')
  async handleSignedUrls(@Req() req: Request, @Res() res: Response) {
    try {
      const path = '/media/signed-urls';
      const result = await this.proxyService.forwardToMediaService(
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );

      res.status(result.status).json(result.data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get signed URLs',
        error: error.message,
      });
    }
  }

  /**
   * Delete media endpoint
   * POST /api/media/delete
   */
  @All('delete')
  async handleMediaDelete(@Req() req: Request, @Res() res: Response) {
    try {
      const path = '/media/delete';
      const result = await this.proxyService.forwardToMediaService(
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );

      res.status(result.status).json(result.data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to delete media',
        error: error.message,
      });
    }
  }

  /**
   * Health check for media service
   * GET /api/media/health
   */
  @All('health')
  async handleMediaHealth(@Req() req: Request, @Res() res: Response) {
    try {
      const path = '/health';
      const result = await this.proxyService.forwardToMediaService(
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
      );

      res.status(result.status).json(result.data);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Media service health check failed',
        error: error.message,
      });
    }
  }
}
