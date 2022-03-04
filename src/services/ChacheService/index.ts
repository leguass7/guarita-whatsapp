import NodeCache, { Options } from 'node-cache';

/**
 * @class CacheService
 * - TTL in seconds
 */
export class CacheService {
  public cacheService: NodeCache;

  constructor(options?: Options) {
    this.cacheService = new NodeCache(options);
  }

  public set<T>(key: string, value: T, ttl = 3600): boolean {
    return this.cacheService.set(key, value, ttl);
  }

  public get<T>(key: string): T | undefined {
    return this.cacheService.get<T>(key);
  }

  public clearAllCache(): void {
    return this.cacheService.flushAll();
  }

  public hasKey(key: string): boolean {
    return !!(key && this.cacheService.has(key));
  }

  public getKey(): string {
    return '';
  }
}
