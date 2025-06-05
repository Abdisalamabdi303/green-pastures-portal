
import { useState, useMemo } from 'react';
import { Animal } from '@/types';

export const useAnimalsFilters = (animals: Animal[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  // Memoized filtered and sorted animals
  const processedAnimals = useMemo(() => {
    let filtered = [...animals];

    if (filter !== 'all') {
      filtered = filtered.filter(animal => animal.status === filter);
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'value':
          comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [animals, filter, sortBy, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    processedAnimals
  };
};
