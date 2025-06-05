
import { useState, useEffect, useCallback, useMemo } from 'react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const SEARCH_DEBOUNCE = 300; // 300ms

// Create cache Map outside component to persist between renders
const animalsCache = new Map<string, { data: any; timestamp: number }>();

export const useAnimalsData = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Memoized cache key generator
  const getCacheKey = useCallback((page: number, search: string, filter: string, sortBy: string, sortOrder: string) => 
    `${page}-${search}-${filter}-${sortBy}-${sortOrder}`, 
    []
  );

  // Memoized fetch function with infinite scroll support
  const fetchAnimals = useCallback(async (page: number, search: string, append: boolean = false, filter?: string, sortBy?: string, sortOrder?: string) => {
    if (!currentUser) return;

    const cacheKey = getCacheKey(page, search, filter || 'all', sortBy || 'date', sortOrder || 'desc');
    const cachedData = animalsCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      if (append) {
        setAnimals(prev => [...prev, ...cachedData.data.animals]);
      } else {
        setAnimals(cachedData.data.animals);
      }
      setTotalPages(Math.ceil((cachedData.data.total || 0) / ITEMS_PER_PAGE));
      setHasMore(cachedData.data.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const result = await animalServices.getAnimals(page, ITEMS_PER_PAGE, search);
      
      if (!result || !result.animals) {
        setAnimals([]);
        setTotalPages(1);
        setHasMore(false);
        return;
      }
      
      animalsCache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      
      if (append) {
        setAnimals(prev => [...prev, ...result.animals]);
      } else {
        setAnimals(result.animals);
      }
      setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
      setHasMore(result.hasMore);
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
    }
  }, [toast, currentUser, getCacheKey]);

  const handleAddAnimal = useCallback(async (newAnimal: Animal, selectedAnimal?: Animal | null) => {
    try {
      // Optimistically update UI
      if (selectedAnimal) {
        setAnimals(prev => prev.map(animal => 
          animal.id === selectedAnimal.id ? newAnimal : animal
        ));
      } else {
        setAnimals(prev => [newAnimal, ...prev]);
      }

      // Then perform the actual server operation
      if (selectedAnimal) {
        await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        toast({
          title: "Success",
          description: "Animal updated successfully"
        });
      } else {
        await animalServices.addAnimal(newAnimal);
        toast({
          title: "Success",
          description: "Animal added successfully"
        });
      }
      animalsCache.clear();
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error saving animal:', error);
      toast({
        title: "Error",
        description: "Failed to save animal",
        variant: "destructive"
      });
      // Refresh the data to ensure UI is in sync with server
      fetchAnimals(1, '');
    }
  }, [fetchAnimals, toast]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      toast({
        title: "Error",
        description: "Animal not found",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone.`)) {
      try {
        // Optimistically update UI
        setIsDeleting(id);
        setAnimals(prev => prev.filter(animal => animal.id !== id));

        // Then perform the actual server operation
        await animalServices.deleteAnimal(id);
        animalsCache.clear();
        toast({
          title: "Success",
          description: "Animal deleted successfully"
        });
      } catch (error) {
        // Revert optimistic update on error
        console.error('Error deleting animal:', error);
        toast({
          title: "Error",
          description: `Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        // Refresh the data to ensure UI is in sync with server
        fetchAnimals(1, '');
      } finally {
        setIsDeleting(null);
      }
    }
  }, [animals, fetchAnimals, toast]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return {
    animals,
    setAnimals,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    hasMore,
    isDeleting,
    fetchAnimals,
    handleAddAnimal,
    handleDeleteAnimal,
    handleScroll,
    SEARCH_DEBOUNCE
  };
};
