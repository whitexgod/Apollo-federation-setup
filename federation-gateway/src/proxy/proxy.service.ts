import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Forward request to auth service REST API
   */
  async forwardToAuthService(
    path: string,
    method: string,
    headers: any,
    body?: any,
    queryParams?: any,
  ): Promise<any> {
    const baseUrl = this.configService.get('AUTH_REST_SERVICE_URL');
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: this.sanitizeHeaders(headers),
      params: queryParams,
      data: body,
      maxRedirects: 0,
      validateStatus: () => true, // Accept all status codes
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      console.error('Proxy error:', error.message);
      throw error;
    }
  }

  /**
   * Forward request to media service REST API
   */
  async forwardToMediaService(
    path: string,
    method: string,
    headers: any,
    body?: any,
    queryParams?: any,
  ): Promise<any> {
    const baseUrl = this.configService.get('MEDIA_SERVICE_URL');
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: this.sanitizeHeaders(headers),
      params: queryParams,
      data: body,
      maxRedirects: 0,
      validateStatus: () => true, // Accept all status codes
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      console.error('Media proxy error:', error.message);
      throw error;
    }
  }

  /**
   * Forward multipart/form-data request (file uploads)
   */
  async forwardMultipartRequest(
    path: string,
    method: string,
    headers: any,
    formData: any,
    serviceType: 'auth' | 'media' = 'auth',
  ): Promise<any> {
    const baseUrlKey = serviceType === 'media' ? 'MEDIA_SERVICE_URL' : 'AUTH_REST_SERVICE_URL';
    const baseUrl = this.configService.get(baseUrlKey);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: {
        ...this.sanitizeHeaders(headers),
        ...formData.getHeaders(),
      },
      data: formData,
      maxRedirects: 0,
      validateStatus: () => true,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      console.error('Multipart proxy error:', error.message);
      throw error;
    }
  }

  /**
   * Generic forward request method
   */
  async forwardRequest(
    req: any,
    res: any,
    targetUrl: string,
    serviceName: string,
  ): Promise<void> {
    const config: AxiosRequestConfig = {
      method: req.method,
      url: targetUrl + (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''),
      headers: this.sanitizeHeaders(req.headers),
      data: req.body,
      maxRedirects: 0,
      validateStatus: () => true,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      
      // Forward response headers
      Object.keys(response.headers).forEach((key) => {
        res.setHeader(key, response.headers[key]);
      });
      
      // Forward status and body
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error(`${serviceName} proxy error:`, error.message);
      res.status(500).json({
        error: 'Proxy error',
        message: error.message,
        service: serviceName,
      });
    }
  }

  /**
   * Sanitize headers before forwarding
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove hop-by-hop headers
    delete sanitized['host'];
    delete sanitized['connection'];
    delete sanitized['keep-alive'];
    delete sanitized['transfer-encoding'];
    delete sanitized['te'];
    delete sanitized['trailer'];
    delete sanitized['proxy-authorization'];
    delete sanitized['proxy-authenticate'];
    delete sanitized['upgrade'];
    
    // Ensure user context headers are preserved and forwarded
    // These headers are added by JwtAuthGuard after token verification
    // - x-user-id
    // - x-user-email
    // - x-user-roles
    // - x-user-privileges (if available)
    // - x-workspace-id (if available)
    
    return sanitized;
  }
}
