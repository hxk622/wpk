import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/errors';
import loggerService from '../services/loggerService';

// 速率限制配置
interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 每个窗口内允许的最大请求数
}

// 客户端请求记录
interface ClientRecord {
  count: number;
  lastReset: number;
}

/**
 * 创建速率限制中间件
 * @param config 速率限制配置
 */
export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  // 存储客户端请求记录的映射
  const clientRecords = new Map<string, ClientRecord>();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 获取客户端IP
      const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
      const now = Date.now();

      // 获取或创建客户端记录
      let clientRecord = clientRecords.get(clientIp);
      if (!clientRecord) {
        clientRecord = {
          count: 1, // 直接设置为1，因为当前请求是第一个
          lastReset: now
        };
        clientRecords.set(clientIp, clientRecord);
      } else {
        // 检查是否需要重置计数
        if (now - clientRecord.lastReset > config.windowMs) {
          clientRecord.count = 1; // 重置后设置为1，因为当前请求是新窗口的第一个请求
          clientRecord.lastReset = now;
        } else {
          // 增加请求计数
          clientRecord.count++;
        }
      }

      // 检查是否超过限制
      if (clientRecord.count > config.max) {
        loggerService.warn('Rate limit exceeded', { clientIp, count: clientRecord.count, max: config.max });
        throw new TooManyRequestsError('请求过于频繁，请稍后再试');
      }

      // 设置响应头
      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', (config.max - clientRecord.count).toString());
      res.setHeader('X-RateLimit-Reset', (clientRecord.lastReset + config.windowMs).toString());
      res.setHeader('X-RateLimit-Count', clientRecord.count.toString()); // 添加当前计数响应头，方便调试

      loggerService.debug('Rate limit check passed', { clientIp, count: clientRecord.count, max: config.max });
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 默认的速率限制中间件（每15分钟最多100个请求）
export const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个窗口内允许的最大请求数
});

// 严格的速率限制中间件（每1分钟最多20个请求），用于敏感接口
export const strictRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1分钟
  max: 20 // 每个窗口内允许的最大请求数
});
