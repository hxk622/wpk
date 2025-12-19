"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestsError = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
// 基础异常类
class AppError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        this.timestamp = new Date();
        // 捕获堆栈跟踪
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// 400 Bad Request
class BadRequestError extends AppError {
    constructor(message, details) {
        super(message, 400, details);
    }
}
exports.BadRequestError = BadRequestError;
// 401 Unauthorized
class UnauthorizedError extends AppError {
    constructor(message, details) {
        super(message, 401, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
// 403 Forbidden
class ForbiddenError extends AppError {
    constructor(message, details) {
        super(message, 403, details);
    }
}
exports.ForbiddenError = ForbiddenError;
// 404 Not Found
class NotFoundError extends AppError {
    constructor(message, details) {
        super(message, 404, details);
    }
}
exports.NotFoundError = NotFoundError;
// 409 Conflict
class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 409, details);
    }
}
exports.ConflictError = ConflictError;
// 500 Internal Server Error
class InternalServerError extends AppError {
    constructor(message = '服务器内部错误', details) {
        super(message, 500, details);
    }
}
exports.InternalServerError = InternalServerError;
// 429 Too Many Requests
class TooManyRequestsError extends AppError {
    constructor(message = '请求过于频繁', details) {
        super(message, 429, details);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
//# sourceMappingURL=errors.js.map