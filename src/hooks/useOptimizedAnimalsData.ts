import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, Timestamp, addDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useDebounce } from '@/hooks/useDebounce';
import { cacheService } from '@/services/cacheService';

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const SEARCH_DEBOUNCE = 300; // 300ms
const PAGE_SIZE = 50;
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

interface UseAnimalsDataReturn {
  animals: Animal[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (term: string) => void;
  searchTerm: string;
  calculateMonthlyIncome: () => Promise<number>;
}

export const useOptimizedAnimalsData = (): UseAnimalsDataReturn => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Refs for pagination and caching
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const cacheRef = useRef<Map<string, Animal>>(new Map());
  const searchCacheRef = useRef<Map<string, Animal[]>>(new Map());

  // Memoized cache key generator
  const getCacheKey = useCallback((page: number, search: string) => 
    `animals-${page}-${search}`, 
    []
  );

  // Clear cache when it gets too large
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

  // Fetch animals with pagination and caching
  const fetchAnimals = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(isInitial ? 1 : Math.ceil(animals.length / ITEMS_PER_PAGE) + 1, debouncedSearchTerm);
      const cachedData = cacheService.get(cacheKey);

      if (cachedData && !isInitial) {
        setAnimals(prev => [...prev, ...cachedData.data]);
        setHasMore(cachedData.data.length === ITEMS_PER_PAGE);
        lastDocRef.current = cachedData.lastDoc;
        return;
      }

      let q = query(
        collection(db, 'animals'),
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
      cacheService.set(cacheKey, newAnimals, lastDocRef.current);

      if (isInitial) {
        setAnimals(newAnimals);
      } else {
        setAnimals(prev => [...prev, ...newAnimals]);
      }

      // Warm up next page cache
      if (hasMore) {
        const nextPageKey = getCacheKey(Math.ceil(animals.length / ITEMS_PER_PAGE) + 2, debouncedSearchTerm);
        cacheService.warmup(nextPageKey, async () => {
          const nextPageQuery = query(
            collection(db, 'animals'),
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
  }, [animals.length, debouncedSearchTerm, getCacheKey, hasMore, toast]);

  // Search animals with improved caching
  const searchAnimals = useCallback(async (term: string) => {
    if (!term.trim()) {
      setAnimals([]);
      setHasMore(true);
      lastDocRef.current = null;
      return fetchAnimals(true);
    }

    try {
      setLoading(true);
      setError(null);

      const searchTermLower = term.toLowerCase().trim();
      const cacheKey = `search-${searchTermLower}`;
      const cachedResults = cacheService.get(cacheKey);

      if (cachedResults) {
        setAnimals(cachedResults.data);
        setHasMore(false);
        return;
      }

      const animalsRef = collection(db, 'animals');
      let results: Animal[] = [];

      // If the search term looks like an ID, search by ID first
      if (/^[a-zA-Z0-9]+$/.test(searchTermLower)) {
        const idQuery = query(
          animalsRef,
          where('id', '==', searchTermLower),
          limit(1)
        );
        const idSnapshot = await getDocs(idQuery);
        results = idSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Animal[];
      }

      // If no results found by ID, search by type
      if (results.length === 0) {
        const typeQuery = query(
          animalsRef,
          where('type', '>=', searchTermLower),
          where('type', '<=', searchTermLower + '\uf8ff'),
          limit(ITEMS_PER_PAGE)
        );

        const typeSnapshot = await getDocs(typeQuery);
        results = typeSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Animal[];

        // If still no results, try partial match
        if (results.length === 0) {
          const allAnimalsQuery = query(
            animalsRef,
            limit(ITEMS_PER_PAGE)
          );
          const allSnapshot = await getDocs(allAnimalsQuery);
          const allAnimals = allSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Animal[];

          results = allAnimals.filter(animal => 
            animal.type?.toLowerCase().includes(searchTermLower) ||
            animal.id?.toLowerCase().includes(searchTermLower)
          );
        }
      }

      // Cache search results
      cacheService.set(cacheKey, results);

      setAnimals(results);
      setHasMore(false);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search animals');
      toast({
        title: "Search Error",
        description: "Failed to search animals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAnimals, toast]);

  // Handle animal deletion with cache invalidation
  const handleDeleteAnimal = useCallback(async (id: string) => {
    try {
      setIsDeleting(id);
      await animalServices.deleteAnimal(id);
      
      // Invalidate all animal-related caches
      cacheService.invalidatePattern('animals-');
      cacheService.invalidatePattern('search-');
      
      setAnimals(prev => prev.filter(animal => animal.id !== id));
      toast({
        title: "Success",
        description: "Animal deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: "Error",
        description: "Failed to delete animal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  }, [toast]);

  // Handle bulk delete with cache invalidation
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    try {
      for (const id of selectedIds) {
        await animalServices.deleteAnimal(id);
      }
      
      // Invalidate all animal-related caches
      cacheService.invalidatePattern('animals-');
      cacheService.invalidatePattern('search-');
      
      setAnimals(prev => prev.filter(animal => !selectedIds.includes(animal.id)));
      toast({
        title: "Success",
        description: "Selected animals deleted successfully.",
      });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete some animals. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle bulk status change with cache invalidation
  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: 'active' | 'sold' | 'deceased', sellingPrice?: number) => {
    try {
      console.log('Bulk updating animals:', { selectedIds, status, sellingPrice });
      
      // Validate inputs
      if (status === 'sold' && (sellingPrice === undefined || sellingPrice <= 0)) {
        throw new Error('Valid selling price is required for sold status');
      }

      // Process each animal
      for (const id of selectedIds) {
        const updateData: Partial<Animal> = { 
          status,
          updatedAt: Timestamp.now()
        };
        
        if (status === 'sold' && sellingPrice !== undefined) {
          // Calculate individual selling price for each animal
          const individualPrice = sellingPrice / selectedIds.length;
          
          // Update animal record with selling price and date
          updateData.sellingPrice = individualPrice;
          updateData.soldDate = Timestamp.now();
        }

        // Update the animal - this will also create income records for sold animals
        await animalServices.updateAnimal(id, updateData);
      }
      
      // Invalidate all caches
      cacheService.invalidatePattern('animals-');
      cacheService.invalidatePattern('search-');
      cacheService.invalidatePattern('income-');
      
      // Update UI state after successful backend update
      setAnimals(prev => prev.map(animal => {
        if (selectedIds.includes(animal.id)) {
          const update: Partial<Animal> = { status };
          if (status === 'sold' && sellingPrice !== undefined) {
            const individualPrice = sellingPrice / selectedIds.length;
            update.sellingPrice = individualPrice;
            update.soldDate = new Date().toISOString();
          }
          return { ...animal, ...update };
        }
        return animal;
      }));
      
      toast({
        title: "Success",
        description: "Selected animals updated successfully.",
      });
    } catch (error) {
      console.error('Error in bulk status change:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update some animals. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle adding new animal with cache invalidation
  const handleAddAnimal = useCallback(async (newAnimal: Animal, animalToEdit?: Animal | null) => {
    try {
      if (animalToEdit) {
        await animalServices.updateAnimal(animalToEdit.id, newAnimal);
        toast({
          title: "Success",
          description: "Animal updated successfully.",
        });
      } else {
        await animalServices.addAnimal(newAnimal);
        toast({
          title: "Success",
          description: "Animal added successfully.",
        });
      }
      
      // Invalidate all animal-related caches
      cacheService.invalidatePattern('animals-');
      cacheService.invalidatePattern('search-');
      
      // Refresh the list
      fetchAnimals(true);
    } catch (error) {
      console.error('Error adding/updating animal:', error);
      toast({
        title: "Error",
        description: "Failed to add/update animal. Please try again.",
        variant: "destructive"
      });
    }
  }, [fetchAnimals, toast]);

  // Calculate monthly income from sold animals
  const calculateMonthlyIncome = useCallback(async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      console.log('Calculating monthly income for period:', {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      });

      const soldAnimalsQuery = query(
        collection(db, 'animals'),
        where('status', '==', 'sold'),
        where('soldDate', '>=', Timestamp.fromDate(startOfMonth)),
        where('soldDate', '<=', Timestamp.fromDate(endOfMonth))
      );

      const snapshot = await getDocs(soldAnimalsQuery);
      const soldAnimals = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Animal[];

      console.log('Found sold animals:', soldAnimals);

      const totalIncome = soldAnimals.reduce((sum, animal) => {
        const price = animal.sellingPrice || 0;
        console.log(`Animal ${animal.id} sold for: ${price}`);
        return sum + price;
      }, 0);

      console.log('Total monthly income:', totalIncome);
      return totalIncome;
    } catch (error) {
      console.error('Error calculating monthly income:', error);
      return 0;
    }
  }, []);

  // Effect for initial load and search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAnimals(debouncedSearchTerm);
    } else {
      fetchAnimals(true);
    }
  }, [debouncedSearchTerm, fetchAnimals, searchAnimals]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    animals,
    loading,
    error,
    hasMore,
    loadMore: () => fetchAnimals(false),
    refresh: () => fetchAnimals(true),
    search: setSearchTerm,
    searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    calculateMonthlyIncome
  }), [
    animals,
    loading,
    error,
    hasMore,
    fetchAnimals,
    setSearchTerm,
    searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    calculateMonthlyIncome
  ]);
};
