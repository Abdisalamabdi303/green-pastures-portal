
import { useState, useEffect, useCallback, useMemo } from 'react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTablePagination } from './useTablePagination';
import { useAnimalsCache } from './useAnimalsCache';

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE = 300;

export const useAnimalsData = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const pagination = useTablePagination(ITEMS_PER_PAGE);
  const cache = useAnimalsCache();

  const fetchAnimals = useCallback(async (
    page: number, 
    search: string = '', 
    append: boolean = false,
    resetPagination: boolean = false
  ) => {
    if (!currentUser) return;

    const cacheKey = cache.getCacheKey(page, search, sortKey, sortDirection);
    const cachedData = cache.getFromCache(cacheKey);
    
    if (cachedData && !resetPagination) {
      if (append) {
        setAnimals(prev => [...prev, ...cachedData.data.animals]);
      } else {
        setAnimals(cachedData.data.animals);
      }
      pagination.updateCursor(cachedData.lastDoc);
      pagination.updateHasMore(cachedData.data.hasMore);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const lastDoc = resetPagination ? null : pagination.lastDoc;
      const result = await animalServices.getAnimals(page, ITEMS_PER_PAGE, search, lastDoc);
      
      if (!result?.animals) {
        setAnimals([]);
        pagination.updateHasMore(false);
        return;
      }
      
      cache.setInCache(cacheKey, result, result.lastDoc);
      
      if (append) {
        setAnimals(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newAnimals = result.animals.filter(a => !existingIds.has(a.id));
          return [...prev, ...newAnimals];
        });
      } else {
        setAnimals(result.animals);
      }
      
      pagination.updateHasMore(result.hasMore);
      pagination.updateCursor(result.lastDoc);
      
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch animals. Please try again.',
        variant: 'destructive'
      });
      setAnimals([]);
      pagination.updateHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser, cache, sortKey, sortDirection, pagination, toast]);

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setAnimals([]);
    pagination.resetPagination();
    cache.invalidateCache('animals-');
    fetchAnimals(1, newSearchTerm, false, true);
  }, [fetchAnimals, pagination, cache]);

  const handleSort = useCallback((key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    setAnimals([]);
    pagination.resetPagination();
    cache.invalidateCache('animals-');
    fetchAnimals(1, searchTerm, false, true);
  }, [sortKey, sortDirection, searchTerm, fetchAnimals, pagination, cache]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && pagination.hasMore) {
      pagination.nextPage();
      fetchAnimals(pagination.currentPage + 1, searchTerm, true);
    }
  }, [loading, loadingMore, pagination, searchTerm, fetchAnimals]);

  const handleAddAnimal = useCallback(async (newAnimal: Animal, selectedAnimal?: Animal | null) => {
    try {
      if (selectedAnimal) {
        setAnimals(prev => prev.map(animal => 
          animal.id === selectedAnimal.id ? newAnimal : animal
        ));
        await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        toast({ title: "Success", description: "Animal updated successfully" });
      } else {
        setAnimals(prev => [newAnimal, ...prev]);
        await animalServices.addAnimal(newAnimal);
        toast({ title: "Success", description: "Animal added successfully" });
      }
      
      cache.invalidateCache();
    } catch (error) {
      console.error('Error saving animal:', error);
      toast({
        title: "Error",
        description: "Failed to save animal",
        variant: "destructive"
      });
      fetchAnimals(1, searchTerm, false, true);
    }
  }, [fetchAnimals, toast, searchTerm, cache]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      toast({ title: "Error", description: "Animal not found", variant: "destructive" });
      return;
    }

    if (window.confirm(`Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone.`)) {
      try {
        setIsDeleting(id);
        setAnimals(prev => prev.filter(animal => animal.id !== id));
        await animalServices.deleteAnimal(id);
        cache.invalidateCache();
        toast({ title: "Success", description: "Animal deleted successfully" });
      } catch (error) {
        console.error('Error deleting animal:', error);
        toast({
          title: "Error",
          description: `Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        fetchAnimals(1, searchTerm, false, true);
      } finally {
        setIsDeleting(null);
      }
    }
  }, [animals, fetchAnimals, toast, searchTerm, cache]);

  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''}?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setAnimals(prev => prev.filter(animal => !selectedIds.includes(animal.id)));
        
        await Promise.all(selectedIds.map(id => animalServices.deleteAnimal(id)));
        
        cache.invalidateCache();
        toast({ 
          title: "Success", 
          description: `${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''} deleted successfully` 
        });
      } catch (error) {
        console.error('Error bulk deleting animals:', error);
        toast({
          title: "Error",
          description: "Failed to delete some animals",
          variant: "destructive"
        });
        fetchAnimals(1, searchTerm, false, true);
      }
    }
  }, [fetchAnimals, toast, searchTerm, cache]);

  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: 'active' | 'sold' | 'deceased') => {
    if (selectedIds.length === 0) return;
    
    try {
      setAnimals(prev => prev.map(animal => 
        selectedIds.includes(animal.id) ? { ...animal, status } : animal
      ));
      
      await Promise.all(selectedIds.map(id => animalServices.updateAnimal(id, { status })));
      
      cache.invalidateCache();
      toast({ 
        title: "Success", 
        description: `${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''} updated successfully` 
      });
    } catch (error) {
      console.error('Error bulk updating animals:', error);
      toast({
        title: "Error",
        description: "Failed to update some animals",
        variant: "destructive"
      });
      fetchAnimals(1, searchTerm, false, true);
    }
  }, [fetchAnimals, toast, searchTerm, cache]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && !loading && !loadingMore && pagination.hasMore) {
      loadMore();
    }
  }, [loading, loadingMore, pagination.hasMore, loadMore]);

  useEffect(() => {
    if (!currentUser) return;
    fetchAnimals(1, '', false, true);
  }, [currentUser, fetchAnimals]);

  return useMemo(() => ({
    animals,
    loading,
    loadingMore,
    currentPage: pagination.currentPage,
    hasMore: pagination.hasMore,
    isDeleting,
    searchTerm,
    sortKey,
    sortDirection,
    handleSearch,
    handleSort,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    handleScroll,
    loadMore,
    SEARCH_DEBOUNCE
  }), [
    animals, loading, loadingMore, pagination.currentPage, pagination.hasMore,
    isDeleting, searchTerm, sortKey, sortDirection, handleSearch, handleSort,
    handleAddAnimal, handleDeleteAnimal, handleBulkDelete, handleBulkStatusChange,
    handleScroll, loadMore
  ]);
};
