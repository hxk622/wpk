import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { ContextManager } from '../utils/contextManager';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * JWT认证中间件
 * 验证请求中的JWT令牌，并将用户ID存储在请求对象和上下文中
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取授权信息
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('未提供认证令牌');
    }
    
    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // 将用户ID存储在请求对象中
    (req as any).user = { userId: decoded.userId };
    
    // 将用户ID设置到请求上下文中
    ContextManager.setUserId(decoded.userId);
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('认证令牌已过期'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('无效的认证令牌'));
    } else {
      next(error);
    }
  }
};

/**
 * 可选的JWT认证中间件
 * 验证请求中的JWT令牌，如果存在且有效，则将用户ID存储在请求对象和上下文中
 * 如果令牌不存在或无效，不会阻止请求继续
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取授权信息
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // 验证JWT令牌
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // 将用户ID存储在请求对象中
      (req as any).user = { userId: decoded.userId };
      
      // 将用户ID设置到请求上下文中
      ContextManager.setUserId(decoded.userId);
    }
    
    next();
  } catch (error) {
    // 如果令牌无效，不阻止请求继续
    next();
  }
};
