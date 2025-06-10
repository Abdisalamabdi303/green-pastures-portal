
import { useState, useRef, useCallback } from 'react';
import { Animal } from '@/types';
import { QueryDocumentSnapshot } from 'firebase/firestore';

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const CACHE_SIZE = 200;

// Enhanced cache with WeakMap for better memory management
class AnimalsCache {
  private cache = new Map<string, { data: any; timestamp: number; lastDoc?: any }>();
  private maxSize = 100; // Limit cache size

  set(key: string, data: any, lastDoc?: any) {
    // Remove oldest entries if cache is full
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

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  clear() {
    this.cache.clear();
  }

  invalidatePattern(pattern: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

const animalsCache = new AnimalsCache();

export const useAnimalsCache = () => {
  const cacheRef = useRef<Map<string, Animal>>(new Map());
  const searchCacheRef = useRef<Map<string, Animal[]>>(new Map());

  const getCacheKey = useCallback((page: number, search: string) => 
    `animals-${page}-${search}`, 
    []
  );

  const clearCache = useCallback(() => {
    if (cacheRef.current.size > CACHE_SIZE) {
      const newCache = new Map();
      let count = 0;
      for (const [key, value] of cacheRef.current.entries()) {
        if (count < CACHE_SIZE / 2) {
          newCache.set(key, value);
          count++;
        }
      }
      cacheRef.current = newCache;
    }
  }, []);

  const setCache = useCallback((key: string, data: any, lastDoc?: QueryDocumentSnapshot) => {
    animalsCache.set(key, data, lastDoc);
  }, []);

  const getCache = useCallback((key: string) => {
    return animalsCache.get(key);
  }, []);

  const invalidateCache = useCallback((pattern: string = '') => {
    if (pattern) {
      animalsCache.invalidatePattern(pattern);
    } else {
      animalsCache.clear();
    }
  }, []);

  return {
    getCacheKey,
    clearCache,
    setCache,
    getCache,
    invalidateCache,
    cacheRef,
    searchCacheRef
  };
};
