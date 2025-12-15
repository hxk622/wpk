"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const loggerService_1 = __importDefault(require("../services/loggerService"));
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    // 确保所有错误都有默认状态码和消息
    let errorStatus = 500;
    let errorMessage = '服务器内部错误';
    let errorDetails = null;
    // 处理应用程序自定义错误
    if (err instanceof errors_1.AppError) {
        errorStatus = err.statusCode;
        errorMessage = err.message;
        errorDetails = err.details;
    }
    // 处理JWT错误
    else if (err.name === 'JsonWebTokenError') {
        errorStatus = 401;
        errorMessage = '无效的令牌';
        errorDetails = err.message;
    }
    // 处理令牌过期错误
    else if (err.name === 'TokenExpiredError') {
        errorStatus = 401;
        errorMessage = '令牌已过期';
        errorDetails = err.message;
    }
    // 处理数据库唯一约束错误
    else if (err.code === '23505') {
        errorStatus = 400;
        errorMessage = '该资源已存在';
        errorDetails = err.detail;
    }
    // 处理数据库外键约束错误
    else if (err.code === '23503') {
        errorStatus = 400;
        errorMessage = '引用的资源不存在';
        errorDetails = err.detail;
    }
    // 处理其他类型的错误
    else if (err instanceof Error) {
        errorMessage = err.message;
        errorDetails = err.stack;
    }
    // 记录错误日志
    loggerService_1.default.error(`[${req.method}] ${req.originalUrl} - ${errorStatus} - ${errorMessage}`, {
        error: err,
        user: req.user ? req.user.userId : 'anonymous',
        ip: req.ip,
    });
    // 返回标准化的错误响应
    const response = (0, response_1.errorResponse)(errorMessage, errorStatus, {
        details: errorDetails,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9)
    });
    res.status(errorStatus).json(response);
};
exports.errorHandler = errorHandler;
// 未处理路由的处理中间件
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.AppError(`未找到路由: ${req.originalUrl}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map