import { Request, Response, NextFunction } from 'express';
/**
 * JWT认证中间件
 * 验证请求中的JWT令牌，并将用户ID存储在请求对象和上下文中
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 可选的JWT认证中间件
 * 验证请求中的JWT令牌，如果存在且有效，则将用户ID存储在请求对象和上下文中
 * 如果令牌不存在或无效，不会阻止请求继续
 */
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void;
