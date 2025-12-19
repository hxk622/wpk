"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.MemoryCache = void 0;
/**
 * 简单的内存缓存实现
 */
class MemoryCache {
    /**
     * 创建内存缓存实例
     * @param cleanupInterval 清理过期项的间隔时间（毫秒），默认30分钟
     */
    constructor(cleanupInterval = 30 * 60 * 1000) {
        this.cache = new Map();
        // 定期清理过期项
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, cleanupInterval);
    }
    /**
     * 设置缓存项
     * @param key 缓存键
     * @param value 缓存值
     * @param ttl 生存时间（毫秒），默认1小时
     */
    set(key, value, ttl = 60 * 60 * 1000) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { value, expiresAt });
    }
    /**
     * 获取缓存项
     * @param key 缓存键
     * @returns 缓存值，如果不存在或已过期则返回undefined
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return undefined;
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }
    /**
     * 删除缓存项
     * @param key 缓存键
     * @returns 是否删除成功
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * 清除所有缓存项
     */
    clear() {
        this.cache.clear();
    }
    /**
     * 检查缓存项是否存在且未过期
     * @param key 缓存键
     * @returns 是否存在且未过期
     */
    has(key) {
        return this.get(key) !== undefined;
    }
    /**
     * 获取缓存项数量
     * @returns 缓存项数量
     */
    size() {
        return this.cache.size;
    }
    /**
     * 清理所有过期项
     */
    cleanupExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * 关闭缓存，清理资源
     */
    close() {
        clearInterval(this.cleanupInterval);
        this.cache.clear();
    }
}
exports.MemoryCache = MemoryCache;
// 导出全局缓存实例
exports.cache = new MemoryCache();
//# sourceMappingURL=cache.js.map