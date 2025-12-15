import { Request, Response, NextFunction } from 'express';
interface RateLimitConfig {
    windowMs: number;
    max: number;
}
/**
 * 创建速率限制中间件
 * @param config 速率限制配置
 */
export declare const createRateLimitMiddleware: (config: RateLimitConfig) => (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const strictRateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export {};
