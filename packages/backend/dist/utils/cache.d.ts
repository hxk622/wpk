/**
 * 缓存项接口
 */
export interface CacheItem<T> {
    value: T;
    expiresAt: number;
}
/**
 * 简单的内存缓存实现
 */
export declare class MemoryCache {
    private cache;
    private cleanupInterval;
    /**
     * 创建内存缓存实例
     * @param cleanupInterval 清理过期项的间隔时间（毫秒），默认30分钟
     */
    constructor(cleanupInterval?: number);
    /**
     * 设置缓存项
     * @param key 缓存键
     * @param value 缓存值
     * @param ttl 生存时间（毫秒），默认1小时
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * 获取缓存项
     * @param key 缓存键
     * @returns 缓存值，如果不存在或已过期则返回undefined
     */
    get<T>(key: string): T | undefined;
    /**
     * 删除缓存项
     * @param key 缓存键
     * @returns 是否删除成功
     */
    delete(key: string): boolean;
    /**
     * 清除所有缓存项
     */
    clear(): void;
    /**
     * 检查缓存项是否存在且未过期
     * @param key 缓存键
     * @returns 是否存在且未过期
     */
    has(key: string): boolean;
    /**
     * 获取缓存项数量
     * @returns 缓存项数量
     */
    size(): number;
    /**
     * 清理所有过期项
     */
    private cleanupExpired;
    /**
     * 关闭缓存，清理资源
     */
    close(): void;
}
export declare const cache: MemoryCache;
