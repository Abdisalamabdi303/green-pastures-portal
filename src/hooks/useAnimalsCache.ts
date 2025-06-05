
import { useCallback, useRef } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  lastDoc?: any;
}

class OptimizedCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 50;
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, lastDoc?: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastDoc
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  invalidate(pattern: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear() {
    this.cache.clear();
  }
}

export const useAnimalsCache = () => {
  const cacheRef = useRef(new OptimizedCache());

  const getCacheKey = useCallback((page: number, search: string, sortKey: string, sortDirection: string) => 
    `animals-${page}-${search}-${sortKey}-${sortDirection}`, 
    []
  );

  const getFromCache = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  const setInCache = useCallback((key: string, data: any, lastDoc?: any) => {
    cacheRef.current.set(key, data, lastDoc);
  }, []);

  const invalidateCache = useCallback((pattern?: string) => {
    if (pattern) {
      cacheRef.current.invalidate(pattern);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return {
    getCacheKey,
    getFromCache,
    setInCache,
    invalidateCache
  };
};
