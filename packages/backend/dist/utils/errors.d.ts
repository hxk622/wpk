export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;
    timestamp: Date;
    constructor(message: string, statusCode: number, details?: any);
}
export declare class BadRequestError extends AppError {
    constructor(message: string, details?: any);
}
export declare class UnauthorizedError extends AppError {
    constructor(message: string, details?: any);
}
export declare class ForbiddenError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(message: string, details?: any);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: any);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class TooManyRequestsError extends AppError {
    constructor(message?: string, details?: any);
}
