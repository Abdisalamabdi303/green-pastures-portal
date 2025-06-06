import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useDebounce } from '@/hooks/useDebounce';

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
}

export const useOptimizedAnimalsData = (): UseAnimalsDataReturn => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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

  // Fetch animals with pagination
  const fetchAnimals = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'animals'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (!isInitial && lastDocRef.current) {
        q = query(q, startAfter(lastDocRef.current));
      }

      const snapshot = await getDocs(q);
      const newAnimals = snapshot.docs.map(doc => {
        const data = doc.data() as Animal;
        cacheRef.current.set(doc.id, data);
        return { ...data, id: doc.id };
      });

      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
      setHasMore(snapshot.docs.length === PAGE_SIZE);

      if (isInitial) {
        setAnimals(newAnimals);
      } else {
        setAnimals(prev => [...prev, ...newAnimals]);
      }

      clearCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animals');
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  // Search animals with improved query
  const searchAnimals = useCallback(async (term: string) => {
    console.log('Searching for term:', term);

    if (!term.trim()) {
      console.log('Empty search term, fetching all animals');
      setAnimals([]);
      setHasMore(true);
      lastDocRef.current = null;
      return fetchAnimals(true);
    }

    try {
      setLoading(true);
      setError(null);

      const searchTermLower = term.toLowerCase().trim();
      console.log('Normalized search term:', searchTermLower);

      // Check cache first
      const cachedResults = searchCacheRef.current.get(searchTermLower);
      if (cachedResults) {
        console.log('Using cached results:', cachedResults.length);
        setAnimals(cachedResults);
        setHasMore(false);
        return;
      }

      const animalsRef = collection(db, 'animals');
      let results: Animal[] = [];

      // If the search term looks like an ID (alphanumeric), search by ID first
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

      // If no results found by ID or search term is not an ID, search by type
      if (results.length === 0) {
        const typeQuery = query(
          animalsRef,
          where('type', '>=', searchTermLower),
          where('type', '<=', searchTermLower + '\uf8ff'),
          limit(PAGE_SIZE)
        );

        const typeSnapshot = await getDocs(typeQuery);
        results = typeSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Animal[];

        // If still no results, try partial match on type
        if (results.length === 0) {
          const allAnimalsQuery = query(
            animalsRef,
            limit(PAGE_SIZE)
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

      console.log('Search results:', results.length);

      // Cache results
      searchCacheRef.current.set(searchTermLower, results);
      if (searchCacheRef.current.size > 10) {
        const firstKey = searchCacheRef.current.keys().next().value;
        searchCacheRef.current.delete(firstKey);
      }

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

  // Load more animals
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || debouncedSearchTerm) return;
    await fetchAnimals();
  }, [loading, hasMore, debouncedSearchTerm, fetchAnimals]);

  // Refresh data
  const refresh = useCallback(async () => {
    lastDocRef.current = null;
    await fetchAnimals(true);
  }, [fetchAnimals]);

  // Handle search term changes with immediate feedback
  const handleSearch = useCallback((term: string) => {
    console.log('handleSearch called with term:', term);
    setSearchTerm(term);
    searchAnimals(term);
  }, [searchAnimals]);

  // Effect to handle debounced search for performance
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      console.log('Debounced search triggered:', debouncedSearchTerm);
      searchAnimals(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, searchAnimals]);

  // Initial load
  useMemo(() => {
    fetchAnimals(true);
  }, [fetchAnimals]);

  // Optimized CRUD operations with cache invalidation
  const handleAddAnimal = useCallback(async (newAnimal: Animal, selectedAnimal?: Animal | null) => {
    try {
      console.log('Adding/updating animal:', { newAnimal, selectedAnimal });
      
      if (selectedAnimal) {
        // Update existing animal
        const updatedAnimal = await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        setAnimals(prev => prev.map(animal => 
          animal.id === selectedAnimal.id ? { ...animal, ...updatedAnimal } : animal
        ));
        toast({ title: "Success", description: "Animal updated successfully" });
      } else {
        // Add new animal
        const addedAnimal = await animalServices.addAnimal(newAnimal);
        setAnimals(prev => [addedAnimal, ...prev]);
        toast({ title: "Success", description: "Animal added successfully" });
      }
      
      // Clear cache to ensure fresh data
      animalsCache.clear();
    } catch (error) {
      console.error('Error saving animal:', error);
      toast({
        title: "Error",
        description: `Failed to ${selectedAnimal ? 'update' : 'add'} animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      // Refresh data on error
      fetchAnimals(true);
    }
  }, [fetchAnimals, toast]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    console.log('handleDeleteAnimal called with id:', id);
    
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      console.error('Animal not found:', id);
      toast({ title: "Error", description: "Animal not found", variant: "destructive" });
      return;
    }

    console.log('Animal found for deletion:', animalToDelete);

    const confirmMessage = `Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone and will also delete all related health records, vaccinations, and expenses.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('User confirmed deletion, setting isDeleting to:', id);
        setIsDeleting(id);
        
        console.log('Attempting to delete animal from backend:', id);
        
        // Call backend deletion first
        await animalServices.deleteAnimal(id);
        console.log('Animal successfully deleted from backend');
        
        // Only update UI state after successful backend deletion
        setAnimals(prev => {
          const newAnimals = prev.filter(animal => animal.id !== id);
          console.log('Updated animals list, removed animal:', id);
          return newAnimals;
        });
        
        // Clear cache to ensure consistency
        animalsCache.clear();
        
        toast({ 
          title: "Success", 
          description: "Animal and all related records deleted successfully" 
        });
        
      } catch (error) {
        console.error('Critical error deleting animal:', error);
        toast({
          title: "Error",
          description: `Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        
        // Refresh data on error to ensure UI consistency with backend
        fetchAnimals(true);
      } finally {
        console.log('Setting isDeleting to null');
        setIsDeleting(null);
      }
    } else {
      console.log('User cancelled deletion');
    }
  }, [animals, fetchAnimals, toast]);

  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''}?\n\nThis action cannot be undone and will also delete all related health records, vaccinations, and expenses.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('Bulk deleting animals from backend:', selectedIds);
        
        // Delete from backend first
        await Promise.all(selectedIds.map(id => animalServices.deleteAnimal(id)));
        console.log('All animals successfully deleted from backend');
        
        // Only update UI after successful backend deletion
        setAnimals(prev => prev.filter(animal => !selectedIds.includes(animal.id)));
        
        animalsCache.clear();
        toast({ 
          title: "Success", 
          description: `${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''} and all related records deleted successfully` 
        });
      } catch (error) {
        console.error('Error bulk deleting animals:', error);
        toast({
          title: "Error",
          description: `Failed to delete some animals: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        fetchAnimals(true);
      }
    }
  }, [fetchAnimals, toast]);

  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: 'active' | 'sold' | 'deceased') => {
    if (selectedIds.length === 0) return;
    
    try {
      console.log('Bulk updating animal status in backend:', selectedIds, status);
      
      // Update backend first
      await Promise.all(selectedIds.map(id => animalServices.updateAnimal(id, { status })));
      console.log('All animals successfully updated in backend');
      
      // Update UI state after successful backend update
      setAnimals(prev => prev.map(animal => 
        selectedIds.includes(animal.id) ? { ...animal, status } : animal
      ));
      
      animalsCache.clear();
      toast({ 
        title: "Success", 
        description: `${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''} updated successfully` 
      });
    } catch (error) {
      console.error('Error bulk updating animals:', error);
      toast({
        title: "Error",
        description: `Failed to update some animals: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      fetchAnimals(true);
    }
  }, [fetchAnimals, toast]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    animals,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search: handleSearch,
    searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange
  }), [
    animals,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    handleSearch,
    searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange
  ]);
};
