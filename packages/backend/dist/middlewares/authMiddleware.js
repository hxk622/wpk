"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const contextManager_1 = require("../utils/contextManager");
// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
/**
 * JWT认证中间件
 * 验证请求中的JWT令牌，并将用户ID存储在请求对象和上下文中
 */
const authMiddleware = (req, res, next) => {
    try {
        // 从请求头获取授权信息
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.UnauthorizedError('未提供认证令牌');
        }
        // 验证JWT令牌
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 将用户ID存储在请求对象中
        req.user = { userId: decoded.userId };
        // 将用户ID设置到请求上下文中
        contextManager_1.ContextManager.setUserId(decoded.userId);
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errors_1.UnauthorizedError('认证令牌已过期'));
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.UnauthorizedError('无效的认证令牌'));
        }
        else {
            next(error);
        }
    }
};
exports.authMiddleware = authMiddleware;
/**
 * 可选的JWT认证中间件
 * 验证请求中的JWT令牌，如果存在且有效，则将用户ID存储在请求对象和上下文中
 * 如果令牌不存在或无效，不会阻止请求继续
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        // 从请求头获取授权信息
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            // 验证JWT令牌
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // 将用户ID存储在请求对象中
            req.user = { userId: decoded.userId };
            // 将用户ID设置到请求上下文中
            contextManager_1.ContextManager.setUserId(decoded.userId);
        }
        next();
    }
    catch (error) {
        // 如果令牌无效，不阻止请求继续
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=authMiddleware.js.map