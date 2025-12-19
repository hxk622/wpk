"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const loggerService_1 = __importDefault(require("./loggerService"));
dotenv_1.default.config();
// 创建Redis连接
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0, // 默认数据库
    retryStrategy: (times) => {
        // 重试策略：每次重试的间隔时间递增
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: null, // 无限重试
});
// 测试Redis连接
redis.ping()
    .then(() => {
    loggerService_1.default.info('Redis连接成功');
})
    .catch(err => {
    loggerService_1.default.error('Redis连接失败:', { error: err.message });
    loggerService_1.default.info('Redis服务可选，应用将继续运行...');
});
// 监听Redis错误事件
redis.on('error', (err) => {
    loggerService_1.default.error('Redis错误:', { error: err.message });
});
exports.default = redis;
//# sourceMappingURL=redis.js.map