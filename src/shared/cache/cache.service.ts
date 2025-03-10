import NodeCache from 'node-cache';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    // Initialize with default settings
    this.cache = new NodeCache({
      stdTTL: 300, // Default TTL: 5 minutes
      checkperiod: 60, // Cleanup every 1 minute
      useClones: false, // Better performance, but be careful with object mutations
      deleteOnExpire: true // Automatically delete expired items
    });

    // Optional: Setup event listeners
    this.cache.on('expired', (key, value) => {
      console.log(`Cache key expired: ${key}`);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, data: any, ttlMinutes: number = 5): Promise<void> {
    const ttlSeconds = ttlMinutes * 60;
    this.cache.set(key, data, ttlSeconds);
  }

  async get(key: string): Promise<any | null> {
    const value = this.cache.get(key);
    return value === undefined ? null : value;
  }

  async delete(key: string): Promise<void> {
    this.cache.del(key);
  }

  async clear(): Promise<void> {
    this.cache.flushAll();
  }

  // Get multiple keys at once
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    return this.cache.mget(keys);
  }

  // Set multiple keys at once
  async setMultiple(items: Record<string, any>, ttlMinutes: number = 5): Promise<void> {
    const ttlSeconds = ttlMinutes * 60;
    Object.entries(items).forEach(([key, value]) => {
      this.cache.set(key, value, ttlSeconds);
    });
  }

  // Check if key exists
  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  // Get cache statistics
  getStats() {
    return this.cache.getStats();
  }

  // Helper method to generate consistent cache keys
  generateKey(parts: string[]): string {
    return parts.join(':');
  }
}