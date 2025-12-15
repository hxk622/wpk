"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLoggerMiddleware = exports.requestContextMiddleware = void 0;
const loggerService_1 = __importDefault(require("../services/loggerService"));
const contextManager_1 = require("../utils/contextManager");
// 请求上下文中间件
const requestContextMiddleware = (req, res, next) => {
    // 生成requestId
    const requestId = contextManager_1.ContextManager.generateRequestId();
    // 尝试从请求头或Cookie中获取sessionId，如果没有则生成一个
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        sessionId = contextManager_1.ContextManager.generateSessionId();
        // 将sessionId设置到响应头中
        res.setHeader('X-Session-Id', sessionId);
    }
    // 尝试从认证信息中获取userId（如果有的话）
    const userId = req.user?.id;
    // 设置请求上下文
    contextManager_1.ContextManager.setContext({
        requestId,
        sessionId,
        userId
    });
    // 将requestId和sessionId设置到响应头中
    res.setHeader('X-Request-Id', requestId);
    next();
};
exports.requestContextMiddleware = requestContextMiddleware;
// API请求日志中间件
const apiLoggerMiddleware = (req, res, next) => {
    // 记录请求开始时间
    const startTime = Date.now();
    // 获取requestId和sessionId
    const requestId = contextManager_1.ContextManager.getRequestId();
    const sessionId = contextManager_1.ContextManager.getSessionId();
    // 记录请求信息
    loggerService_1.default.info('API请求开始', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params
    });
    // 保存原始的res.send方法
    const originalSend = res.send.bind(res);
    // 重写res.send方法以记录响应信息
    res.send = (body) => {
        // 计算请求处理时间
        const duration = Date.now() - startTime;
        // 尝试解析响应体
        let responseBody = body;
        if (typeof body === 'string') {
            try {
                responseBody = JSON.parse(body);
            }
            catch (e) {
                // 如果不是JSON，保持原样
            }
        }
        // 记录响应信息
        loggerService_1.default.info('API请求结束', {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            responseBody: responseBody,
            method: req.method,
            path: req.path
        });
        // 调用原始的res.send方法
        return originalSend(body);
    };
    next();
};
exports.apiLoggerMiddleware = apiLoggerMiddleware;
//# sourceMappingURL=loggerMiddleware.js.map