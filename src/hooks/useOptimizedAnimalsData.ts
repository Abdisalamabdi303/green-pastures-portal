
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const SEARCH_DEBOUNCE = 300; // 300ms

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

export const useOptimizedAnimalsData = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for managing pagination cursors
  const lastDocRef = useRef<any>(null);
  const isInitialLoadRef = useRef(true);

  // Memoized cache key generator
  const getCacheKey = useCallback((page: number, search: string) => 
    `animals-${page}-${search}`, 
    []
  );

  // Optimized fetch function with cursor-based pagination
  const fetchAnimals = useCallback(async (
    page: number, 
    search: string = '', 
    append: boolean = false,
    resetPagination: boolean = false
  ) => {
    if (!currentUser) return;

    const cacheKey = getCacheKey(page, search);
    const cachedData = animalsCache.get(cacheKey);
    
    // Use cache if available and not forcing refresh
    if (cachedData && !resetPagination) {
      console.log('Using cached data for', cacheKey);
      if (append) {
        setAnimals(prev => [...prev, ...cachedData.data.animals]);
      } else {
        setAnimals(cachedData.data.animals);
      }
      
      if (cachedData.data.totalPages) {
        setTotalPages(cachedData.data.totalPages);
      }
      setHasMore(cachedData.data.hasMore);
      lastDocRef.current = cachedData.lastDoc;
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // Set appropriate loading state
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const lastDoc = resetPagination ? null : lastDocRef.current;
      const result = await animalServices.getAnimals(page, ITEMS_PER_PAGE, search, lastDoc);
      
      if (!result || !result.animals) {
        setAnimals([]);
        setTotalPages(1);
        setHasMore(false);
        return;
      }
      
      // Cache the result
      animalsCache.set(cacheKey, result, result.lastDoc);
      
      // Update state
      if (append) {
        setAnimals(prev => {
          // Prevent duplicates by filtering out animals that already exist
          const existingIds = new Set(prev.map(a => a.id));
          const newAnimals = result.animals.filter(a => !existingIds.has(a.id));
          return [...prev, ...newAnimals];
        });
      } else {
        setAnimals(result.animals);
      }
      
      // Update pagination info only on first page
      if (page === 1 && result.totalPages) {
        setTotalPages(result.totalPages);
      }
      
      setHasMore(result.hasMore);
      lastDocRef.current = result.lastDoc;
      
      console.log(`Fetched page ${page}: ${result.animals.length} animals, hasMore: ${result.hasMore}`);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch animals. Please try again.',
        variant: 'destructive'
      });
      setAnimals([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast, currentUser, getCacheKey]);

  // Optimized search handler with debouncing
  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
    setAnimals([]);
    lastDocRef.current = null;
    
    // Clear relevant cache entries
    animalsCache.invalidatePattern('animals-');
    
    // Fetch with new search term
    fetchAnimals(1, newSearchTerm, false, true);
  }, [fetchAnimals]);

  // Load more animals for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAnimals(nextPage, searchTerm, true);
    }
  }, [loading, loadingMore, hasMore, currentPage, searchTerm, fetchAnimals]);

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
      fetchAnimals(1, searchTerm, false, true);
    }
  }, [fetchAnimals, toast, searchTerm]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      toast({ title: "Error", description: "Animal not found", variant: "destructive" });
      return;
    }

    const confirmMessage = `Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone and will also delete all related health records, vaccinations, and expenses.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsDeleting(id);
        console.log('Attempting to delete animal from backend:', id);
        
        // Call backend deletion first
        await animalServices.deleteAnimal(id);
        console.log('Animal successfully deleted from backend');
        
        // Only update UI state after successful backend deletion
        setAnimals(prev => prev.filter(animal => animal.id !== id));
        
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
        fetchAnimals(1, searchTerm, false, true);
      } finally {
        setIsDeleting(null);
      }
    }
  }, [animals, fetchAnimals, toast, searchTerm]);

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
        fetchAnimals(1, searchTerm, false, true);
      }
    }
  }, [fetchAnimals, toast, searchTerm]);

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
      fetchAnimals(1, searchTerm, false, true);
    }
  }, [fetchAnimals, toast, searchTerm]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when scrolled to 80% of the content
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && !loading && !loadingMore && hasMore) {
      loadMore();
    }
  }, [loading, loadingMore, hasMore, loadMore]);

  // Initial data fetch
  useEffect(() => {
    if (!currentUser) return;
    
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      fetchAnimals(1, '', false, true);
    }
  }, [currentUser, fetchAnimals]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    animals,
    loading,
    loadingMore,
    currentPage,
    totalPages,
    hasMore,
    isDeleting,
    searchTerm,
    handleSearch,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    handleScroll,
    loadMore,
    SEARCH_DEBOUNCE
  }), [
    animals,
    loading,
    loadingMore,
    currentPage,
    totalPages,
    hasMore,
    isDeleting,
    searchTerm,
    handleSearch,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    handleScroll,
    loadMore
  ]);
};
