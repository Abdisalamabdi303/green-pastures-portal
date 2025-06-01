import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Animal } from '@/types';

export const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnimals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const animalsRef = collection(db, 'animals');
      const snapshot = await getDocs(animalsRef);
      const animalsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];

      setAnimals(animalsList);
    } catch (error) {
      console.error('Error fetching animals:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch animals'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return {
    animals,
    isLoading,
    error
  };
}; 