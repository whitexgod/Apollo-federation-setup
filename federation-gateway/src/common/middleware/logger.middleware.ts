import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${ip}`;

      if (statusCode >= 500) {
        console.error(`❌ ${logMessage}`);
      } else if (statusCode >= 400) {
        console.warn(`⚠️  ${logMessage}`);
      } else {
        console.log(`✅ ${logMessage}`);
      }
    });

    next();
  }
}
