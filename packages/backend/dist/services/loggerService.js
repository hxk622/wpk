"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const contextManager_1 = require("../utils/contextManager");
// 定义日志级别
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["HTTP"] = "http";
    LogLevel["VERBOSE"] = "verbose";
    LogLevel["DEBUG"] = "debug";
    LogLevel["SILLY"] = "silly";
})(LogLevel || (LogLevel = {}));
// 创建日志记录器
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || LogLevel.INFO,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({
        stack: true
    }), winston_1.default.format.splat(), winston_1.default.format.json()),
    transports: [
        // 错误日志输出到文件
        new winston_1.default.transports.File({
            filename: process.env.LOG_ERROR_FILE || 'logs/error.log',
            level: LogLevel.ERROR,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // 所有日志输出到文件
        new winston_1.default.transports.File({
            filename: process.env.LOG_COMBINED_FILE || 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});
// 在开发环境下，将日志输出到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
            format: 'HH:mm:ss'
        }), winston_1.default.format.printf((info) => {
            const { timestamp, level, message, ...meta } = info;
            let metaStr = '';
            if (Object.keys(meta).length > 0) {
                metaStr = JSON.stringify(meta, null, 2);
            }
            return `${timestamp} ${level}: ${message} ${metaStr}`;
        }))
    }));
}
// 创建日志目录
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir);
}
// 日志服务类
class LoggerService {
    static error(message, meta) {
        logger.error(message, this.enrichMeta(meta));
    }
    static warn(message, meta) {
        logger.warn(message, this.enrichMeta(meta));
    }
    static info(message, meta) {
        logger.info(message, this.enrichMeta(meta));
    }
    static http(message, meta) {
        logger.http(message, this.enrichMeta(meta));
    }
    static verbose(message, meta) {
        logger.verbose(message, this.enrichMeta(meta));
    }
    static debug(message, meta) {
        logger.debug(message, this.enrichMeta(meta));
    }
    static silly(message, meta) {
        logger.silly(message, this.enrichMeta(meta));
    }
    // 游戏特定的日志方法
    static gameEvent(event, sessionId, playerId, data) {
        const meta = {
            sessionId,
            playerId,
            data
        };
        logger.info(`[GAME] ${event}`, this.enrichMeta(meta));
    }
    static playerAction(action, sessionId, playerId, details) {
        const meta = {
            sessionId,
            playerId,
            details
        };
        logger.info(`[PLAYER] ${playerId} ${action}`, this.enrichMeta(meta));
    }
    static errorEvent(error, sessionId, playerId) {
        const meta = {
            sessionId,
            playerId,
            stack: error.stack
        };
        logger.error(error.message, this.enrichMeta(meta));
    }
    // 锦标赛特定的日志方法
    static tournamentEvent(event, tournamentId, userId, data) {
        const meta = {
            tournamentId,
            userId,
            data
        };
        logger.info(`[TOURNAMENT] ${event}`, this.enrichMeta(meta));
    }
    // 从上下文管理器获取requestId和sessionId并丰富元数据
    static enrichMeta(meta) {
        const context = contextManager_1.ContextManager.getContext();
        const enrichedMeta = context ? {
            requestId: context.requestId,
            sessionId: context.sessionId || meta?.sessionId,
            userId: context.userId
        } : {};
        // 如果提供了额外的元数据，将其合并
        if (meta) {
            Object.assign(enrichedMeta, meta);
        }
        return enrichedMeta;
    }
}
exports.default = LoggerService;
//# sourceMappingURL=loggerService.js.map