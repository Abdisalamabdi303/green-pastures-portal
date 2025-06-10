import { useState, useMemo, useCallback } from 'react';
import { Animal } from '@/types';

export const useAnimalsFilters = (animals: Animal[]) => {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const setSortByWithReset = useCallback((key: string) => {
    setSortBy(key);
    setSortOrder('desc');
  }, []);

  const processedAnimals = useMemo(() => {
    return [...animals].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'createdAt':
          comparison = new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
          break;
        case 'purchasePrice':
          comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
          break;
        case 'age':
          comparison = (a.age || 0) - (b.age || 0);
          break;
        case 'weight':
          comparison = (a.weight || 0) - (b.weight || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [animals, sortBy, sortOrder]);

  return {
    viewMode,
    setViewMode,
    processedAnimals,
    sortBy,
    setSortBy: setSortByWithReset,
    sortOrder,
    toggleSortOrder
  };
};
