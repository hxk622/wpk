import { Request, Response, NextFunction } from 'express';
/**
 * 管理员权限中间件
 * 验证当前用户是否具有管理员权限
 */
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void;
