import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Animal } from '@/types';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { firestoreDb } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAnimalsCache } from './useAnimalsCache';
import { cacheService } from '@/services/cacheService';

const ITEMS_PER_PAGE = 20;

interface UseAnimalsQueryReturn {
  animals: Animal[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAnimalsQuery = (): UseAnimalsQueryReturn => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const isInitialLoadRef = useRef(true);
  const { getCacheKey, setCache, getCache, invalidateCache } = useAnimalsCache();

  // Fetch animals with pagination and caching
  const fetchAnimals = useCallback(async (isInitial = false) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(isInitial ? 1 : Math.ceil(animals.length / ITEMS_PER_PAGE) + 1, '');
      const cachedData = getCache(cacheKey);

      if (cachedData && !isInitial) {
        setAnimals(prev => [...prev, ...cachedData.data]);
        setHasMore(cachedData.data.length === ITEMS_PER_PAGE);
        lastDocRef.current = cachedData.lastDoc;
        return;
      }

      let q = query(
        collection(firestoreDb, 'animals'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (!isInitial && lastDocRef.current) {
        q = query(q, startAfter(lastDocRef.current));
      }

      const snapshot = await getDocs(q);
      const newAnimals = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Animal[];

      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      // Cache the results
      setCache(cacheKey, newAnimals, lastDocRef.current);

      if (isInitial) {
        setAnimals(newAnimals);
      } else {
        setAnimals(prev => [...prev, ...newAnimals]);
      }

      // Warm up next page cache
      if (hasMore) {
        const nextPageKey = getCacheKey(Math.ceil(animals.length / ITEMS_PER_PAGE) + 2, '');
        cacheService.warmup(nextPageKey, async () => {
          const nextPageQuery = query(
            collection(firestoreDb, 'animals'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDocRef.current),
            limit(ITEMS_PER_PAGE)
          );
          const nextSnapshot = await getDocs(nextPageQuery);
          return nextSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Animal[];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animals');
      toast({
        title: 'Error',
        description: 'Failed to fetch animals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [animals.length, getCacheKey, hasMore, toast, currentUser, getCache, setCache]);

  // Load more animals
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchAnimals(false);
  }, [loading, hasMore, fetchAnimals]);

  // Refresh animals list
  const refresh = useCallback(async () => {
    lastDocRef.current = null;
    setAnimals([]);
    setHasMore(true);
    invalidateCache('animals-');
    await fetchAnimals(true);
  }, [fetchAnimals, invalidateCache]);

  // Initial load
  useEffect(() => {
    if (currentUser && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      fetchAnimals(true);
    }
  }, [currentUser, fetchAnimals]);

  return useMemo(() => ({
    animals,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }), [animals, loading, error, hasMore, loadMore, refresh]);
};
