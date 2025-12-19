"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redis_1 = __importDefault(require("./redis"));
const loggerService_1 = __importDefault(require("./loggerService"));
class RedisCache {
    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param expireTime 过期时间（秒）
     */
    static async set(key, value, expireTime) {
        try {
            const serializedValue = JSON.stringify(value);
            if (expireTime) {
                await redis_1.default.set(key, serializedValue, 'EX', expireTime);
            }
            else {
                await redis_1.default.set(key, serializedValue);
            }
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis set error:', { error });
            return false;
        }
    }
    /**
     * 获取缓存
     * @param key 缓存键
     * @returns 缓存值，如果不存在则返回null
     */
    static async get(key) {
        try {
            const value = await redis_1.default.get(key);
            if (value) {
                return JSON.parse(value);
            }
            return null;
        }
        catch (error) {
            loggerService_1.default.error('Redis get error:', { error });
            return null;
        }
    }
    /**
     * 删除缓存
     * @param key 缓存键
     */
    static async delete(key) {
        try {
            await redis_1.default.del(key);
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis delete error:', { error });
            return false;
        }
    }
    /**
     * 批量删除缓存
     * @param keys 缓存键数组
     */
    static async deleteBatch(keys) {
        try {
            if (keys.length > 0) {
                await redis_1.default.del(keys);
            }
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis deleteBatch error:', { error });
            return false;
        }
    }
    /**
     * 设置缓存过期时间
     * @param key 缓存键
     * @param expireTime 过期时间（秒）
     */
    static async expire(key, expireTime) {
        try {
            await redis_1.default.expire(key, expireTime);
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis expire error:', { error });
            return false;
        }
    }
    /**
     * 检查缓存是否存在
     * @param key 缓存键
     */
    static async exists(key) {
        try {
            const result = await redis_1.default.exists(key);
            return result === 1;
        }
        catch (error) {
            loggerService_1.default.error('Redis exists error:', { error });
            return false;
        }
    }
    /**
     * 清空所有缓存
     */
    static async flushAll() {
        try {
            await redis_1.default.flushall();
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis flushAll error:', { error });
            return false;
        }
    }
    /**
     * 获取缓存TTL（剩余过期时间，秒）
     * @param key 缓存键
     */
    static async ttl(key) {
        try {
            return await redis_1.default.ttl(key);
        }
        catch (error) {
            loggerService_1.default.error('Redis ttl error:', { error });
            return -1;
        }
    }
    /**
     * 根据模式删除缓存
     * @param pattern 缓存键模式（支持通配符*）
     */
    static async deletePattern(pattern) {
        try {
            const keys = await redis_1.default.keys(pattern);
            if (keys.length > 0) {
                await this.deleteBatch(keys);
            }
            return true;
        }
        catch (error) {
            loggerService_1.default.error('Redis deletePattern error:', { error });
            return false;
        }
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redisCache.js.map