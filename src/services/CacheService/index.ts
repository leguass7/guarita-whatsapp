import { createHash } from 'crypto';
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

  public generatePriority(to: string, data: any) {
    const key = this.getHashKey(to, data);
    return this.getPriority(key);
  }

  public getPriority(key: string) {
    const has = this.hasKey(key);
    const count = has ? Number(this.get<number>(key)) + 1 : 1;
    this.set(key, count, 6200);
    
    // FIXME: Prioridade fixa para resolver problema de síndicos com múltiplos condomínios
    // Todos os envios terão a mesma prioridade, garantindo processamento FIFO
    return 1;
  }

  public getHashKey(to: string, data: any): string {
    const payload = `${to}-${typeof data === 'string' ? data : JSON.stringify(data)}`;
    const hash = createHash('md5').update(payload).digest('hex');
    return `${to}-${hash}`;
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
