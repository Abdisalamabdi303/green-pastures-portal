import { useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, DocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal } from '@/types';

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem {
  data: Animal[];
  timestamp: number;
  lastDoc: DocumentSnapshot | null;
}

interface UseAnimalsOptions {
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
  filterStatus?: 'active' | 'sold' | 'deceased';
}

export function useAnimals({
  initialSortKey = 'id',
  initialSortDirection = 'asc',
  filterStatus
}: UseAnimalsOptions = {}) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [cache, setCache] = useState<Record<string, CacheItem>>({});

  const getCacheKey = useCallback(() => {
    return `${sortKey}-${sortDirection}-${filterStatus || 'all'}`;
  }, [sortKey, sortDirection, filterStatus]);

  const getCachedData = useCallback(() => {
    const key = getCacheKey();
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, [cache, getCacheKey]);

  const setCachedData = useCallback((data: Animal[], lastDoc: DocumentSnapshot | null) => {
    const key = getCacheKey();
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        lastDoc
      }
    }));
  }, [getCacheKey]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setAnimals(cached.data);
        setLastDoc(cached.lastDoc);
        setHasMore(cached.data.length === ITEMS_PER_PAGE);
        return;
      }

      const animalsRef = collection(db, 'animals');
      let q = query(
        animalsRef,
        orderBy(sortKey, sortDirection),
        limit(ITEMS_PER_PAGE)
      );

      if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
      }
      
      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      
      const animalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
      
      setAnimals(animalsData);
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      
      // Cache the results
      setCachedData(animalsData, lastVisible);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
    }
  }, [sortKey, sortDirection, filterStatus, getCachedData, setCachedData]);

  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const animalsRef = collection(db, 'animals');
      let q = query(
        animalsRef,
        orderBy(sortKey, sortDirection),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );

      if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
      }
      
      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      
      const newAnimals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
      
      setAnimals(prev => [...prev, ...newAnimals]);
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more animals:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore, hasMore, sortKey, sortDirection, filterStatus]);

  const handleSort = useCallback((key: string) => {
    setSortKey(key);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      await fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const animalsRef = collection(db, 'animals');
      let q = query(
        animalsRef,
        orderBy(sortKey, sortDirection),
        limit(ITEMS_PER_PAGE)
      );

      if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
      }
      
      const snapshot = await getDocs(q);
      const animalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
      
      const searchTerm = term.toLowerCase();
      const filteredAnimals = animalsData.filter(animal => 
        animal.id.toLowerCase().includes(searchTerm) ||
        (animal.type && animal.type.toLowerCase().includes(searchTerm)) ||
        (animal.breed && animal.breed.toLowerCase().includes(searchTerm))
      );
      
      setAnimals(filteredAnimals);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching animals:', error);
    } finally {
      setLoading(false);
    }
  }, [sortKey, sortDirection, filterStatus, fetchInitialData]);

  // Clear cache when sort or filter changes
  useEffect(() => {
    setCache({});
  }, [sortKey, sortDirection, filterStatus]);

  return {
    animals,
    loading,
    loadingMore,
    hasMore,
    sortKey,
    sortDirection,
    handleSort,
    handleSearch,
    loadMore,
    fetchInitialData
  };
} 