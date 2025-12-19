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
export class MemoryCache {
  private cache: Map<string, CacheItem<any>>;
  private cleanupInterval: NodeJS.Timeout;

  /**
   * 创建内存缓存实例
   * @param cleanupInterval 清理过期项的间隔时间（毫秒），默认30分钟
   */
  constructor(cleanupInterval: number = 30 * 60 * 1000) {
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
  set<T>(key: string, value: T, ttl: number = 60 * 60 * 1000): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回undefined
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

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
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有缓存项
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存项是否存在且未过期
   * @param key 缓存键
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 获取缓存项数量
   * @returns 缓存项数量
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理所有过期项
   */
  private cleanupExpired(): void {
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
  close(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// 导出全局缓存实例
export const cache = new MemoryCache();
