import { Animal } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastDoc?: any;
  version: number;
  metadata?: {
    lastAccessed: number;
    accessCount: number;
    size: number;
  };
}

interface CacheConfig {
  maxSize: number;
  maxAge: number;
  version: number;
  warmupThreshold: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;
  private accessStats: Map<string, number>;
  private version: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.accessStats = new Map();
    this.version = config.version || 1;
    this.config = {
      maxSize: config.maxSize || 1000, // Maximum number of cache entries
      maxAge: config.maxAge || 1000 * 60 * 5, // 5 minutes default
      version: config.version || 1,
      warmupThreshold: config.warmupThreshold || 3 // Number of accesses to trigger warmup
    };
  }

  // Set data in cache with metadata
  set<T>(key: string, data: T, lastDoc?: any): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      lastDoc,
      version: this.version,
      metadata: {
        lastAccessed: Date.now(),
        accessCount: 0,
        size: this.calculateSize(data)
      }
    };

    // Check if we need to make space
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastValuable();
    }

    this.cache.set(key, entry);
  }

  // Get data from cache with access tracking
  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    this.updateAccessStats(key, entry);
    return entry;
  }

  // Warm up cache for frequently accessed data
  async warmup<T>(key: string, fetchFn: () => Promise<T>): Promise<void> {
    const accessCount = this.accessStats.get(key) || 0;
    
    if (accessCount >= this.config.warmupThreshold) {
      try {
        const data = await fetchFn();
        this.set(key, data);
      } catch (error) {
        console.error('Cache warmup failed:', error);
      }
    }
  }

  // Invalidate cache entries based on pattern
  invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Invalidate cache entries based on version
  invalidateByVersion(version: number): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.version < version) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
    this.accessStats.clear();
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitCount: number;
    missCount: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    return {
      size: this.cache.size,
      hitCount: Array.from(this.accessStats.values()).reduce((a, b) => a + b, 0),
      missCount: 0, // TODO: Implement miss tracking
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(e => e.timestamp)),
      newestEntry: Math.max(...Array.from(this.cache.values()).map(e => e.timestamp))
    };
  }

  // Private helper methods
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  private updateAccessStats(key: string, entry: CacheEntry<any>): void {
    const currentCount = this.accessStats.get(key) || 0;
    this.accessStats.set(key, currentCount + 1);
    
    if (entry.metadata) {
      entry.metadata.lastAccessed = Date.now();
      entry.metadata.accessCount += 1;
    }
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private evictLeastValuable(): void {
    let leastValuableKey: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (!entry.metadata) continue;

      const score = this.calculateEntryScore(entry);
      if (score < lowestScore) {
        lowestScore = score;
        leastValuableKey = key;
      }
    }

    if (leastValuableKey) {
      this.cache.delete(leastValuableKey);
    }
  }

  private calculateEntryScore(entry: CacheEntry<any>): number {
    if (!entry.metadata) return 0;

    const age = Date.now() - entry.timestamp;
    const accessCount = entry.metadata.accessCount;
    const size = entry.metadata.size;

    // Score formula: (age * size) / (accessCount + 1)
    // Higher score means more likely to be evicted
    return (age * size) / (accessCount + 1);
  }
}

// Create a singleton instance
export const cacheService = new CacheService({
  maxSize: 1000,
  maxAge: 1000 * 60 * 5, // 5 minutes
  version: 1,
  warmupThreshold: 3
});

export default cacheService; 