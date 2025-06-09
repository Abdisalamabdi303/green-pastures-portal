import { useState, useMemo } from 'react';
import { Animal } from '@/types';

export const useAnimalsFilters = (animals: Animal[]) => {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const processedAnimals = useMemo(() => {
    return [...animals].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
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
    setSortBy,
    sortOrder,
    toggleSortOrder
  };
};
