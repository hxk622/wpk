export declare class RedisCache {
    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param expireTime 过期时间（秒）
     */
    static set<T>(key: string, value: T, expireTime?: number): Promise<boolean>;
    /**
     * 获取缓存
     * @param key 缓存键
     * @returns 缓存值，如果不存在则返回null
     */
    static get<T>(key: string): Promise<T | null>;
    /**
     * 删除缓存
     * @param key 缓存键
     */
    static delete(key: string): Promise<boolean>;
    /**
     * 批量删除缓存
     * @param keys 缓存键数组
     */
    static deleteBatch(keys: string[]): Promise<boolean>;
    /**
     * 设置缓存过期时间
     * @param key 缓存键
     * @param expireTime 过期时间（秒）
     */
    static expire(key: string, expireTime: number): Promise<boolean>;
    /**
     * 检查缓存是否存在
     * @param key 缓存键
     */
    static exists(key: string): Promise<boolean>;
    /**
     * 清空所有缓存
     */
    static flushAll(): Promise<boolean>;
    /**
     * 获取缓存TTL（剩余过期时间，秒）
     * @param key 缓存键
     */
    static ttl(key: string): Promise<number>;
    /**
     * 根据模式删除缓存
     * @param pattern 缓存键模式（支持通配符*）
     */
    static deletePattern(pattern: string): Promise<boolean>;
}
