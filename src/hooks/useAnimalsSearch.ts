import { useState, useCallback } from 'react';
import { Animal } from '@/types';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { firestoreDb } from '@/firebase/config';
import { useDebounce } from '@/hooks/useDebounce';
import { cacheService } from '@/services/cacheService';

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE = 300;

export const useAnimalsSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE);

  const searchAnimals = useCallback(async (term: string): Promise<Animal[]> => {
    if (!term.trim()) {
      return [];
    }

    try {
      const searchTermLower = term.toLowerCase().trim();
      const cacheKey = `search-${searchTermLower}`;
      const cachedResults = cacheService.get(cacheKey);

      if (cachedResults) {
        return cachedResults.data;
      }

      const animalsRef = collection(firestoreDb, 'animals');
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
      }

      // Cache the results
      cacheService.set(cacheKey, results);
      return results;
    } catch (err) {
      console.error('Error searching animals:', err);
      throw err;
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    searchAnimals
  };
};
