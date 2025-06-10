
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Animal } from '@/types';
import { useAnimalsQuery } from './useAnimalsQuery';
import { useAnimalsSearch } from './useAnimalsSearch';
import { useAnimalsMutations } from './useAnimalsMutations';
import { useAnimalsCache } from './useAnimalsCache';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface UseOptimizedAnimalsDataReturn {
  animals: Animal[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (term: string) => void;
  searchTerm: string;
  isDeleting: string | null;
  handleAddAnimal: (newAnimal: Animal, animalToEdit?: Animal | null) => Promise<boolean>;
  handleDeleteAnimal: (id: string) => Promise<boolean>;
  handleBulkDelete: (selectedIds: string[]) => Promise<boolean>;
  handleBulkStatusChange: (selectedIds: string[], status: 'active' | 'deceased') => Promise<boolean>;
  calculateMonthlyIncome: () => Promise<number>;
}

export const useOptimizedAnimalsData = (): UseOptimizedAnimalsDataReturn => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [displayAnimals, setDisplayAnimals] = useState<Animal[]>([]);
  
  const queryResult = useAnimalsQuery();
  const searchResult = useAnimalsSearch();
  const mutations = useAnimalsMutations();
  const { invalidateCache } = useAnimalsCache();

  // Handle search vs normal display
  useEffect(() => {
    if (searchResult.debouncedSearchTerm) {
      searchResult.searchAnimals(searchResult.debouncedSearchTerm)
        .then(results => setDisplayAnimals(results))
        .catch(console.error);
    } else {
      setDisplayAnimals(queryResult.animals);
    }
  }, [searchResult.debouncedSearchTerm, queryResult.animals, searchResult.searchAnimals]);

  // Enhanced delete with loading state
  const handleDeleteAnimal = useCallback(async (id: string) => {
    try {
      setIsDeleting(id);
      const success = await mutations.handleDeleteAnimal(id);
      if (success) {
        invalidateCache('animals-');
        invalidateCache('search-');
        await queryResult.refresh();
      }
      return success;
    } finally {
      setIsDeleting(null);
    }
  }, [mutations, invalidateCache, queryResult]);

  // Enhanced add/update with cache invalidation
  const handleAddAnimal = useCallback(async (newAnimal: Animal, animalToEdit?: Animal | null) => {
    const success = await mutations.handleAddAnimal(newAnimal, animalToEdit);
    if (success) {
      invalidateCache('animals-');
      invalidateCache('search-');
      await queryResult.refresh();
    }
    return success;
  }, [mutations, invalidateCache, queryResult]);

  // Enhanced bulk delete with cache invalidation
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    const success = await mutations.handleBulkDelete(selectedIds);
    if (success) {
      invalidateCache('animals-');
      invalidateCache('search-');
      await queryResult.refresh();
    }
    return success;
  }, [mutations, invalidateCache, queryResult]);

  // Enhanced bulk status change with cache invalidation
  const handleBulkStatusChange = useCallback(async (selectedIds: string[], status: 'active' | 'deceased') => {
    const success = await mutations.handleBulkStatusChange(selectedIds, status);
    if (success) {
      invalidateCache('animals-');
      invalidateCache('search-');
      await queryResult.refresh();
    }
    return success;
  }, [mutations, invalidateCache, queryResult]);

  // Calculate monthly income from sold animals
  const calculateMonthlyIncome = useCallback(async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

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

      return soldAnimals.reduce((sum, animal) => sum + (animal.sellingPrice || 0), 0);
    } catch (error) {
      console.error('Error calculating monthly income:', error);
      return 0;
    }
  }, []);

  return useMemo(() => ({
    animals: displayAnimals,
    loading: queryResult.loading,
    error: queryResult.error,
    hasMore: queryResult.hasMore,
    loadMore: queryResult.loadMore,
    refresh: queryResult.refresh,
    search: searchResult.setSearchTerm,
    searchTerm: searchResult.searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    calculateMonthlyIncome
  }), [
    displayAnimals,
    queryResult,
    searchResult.setSearchTerm,
    searchResult.searchTerm,
    isDeleting,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    calculateMonthlyIncome
  ]);
};
