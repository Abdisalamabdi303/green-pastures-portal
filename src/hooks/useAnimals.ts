import { useQuery } from '@tanstack/react-query';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';

export const useAnimals = () => {
  const {
    data: animals = [],
    isLoading,
    error
  } = useQuery<Animal[]>({
    queryKey: ['animals'],
    queryFn: animalServices.getAnimals
  });

  return {
    animals,
    isLoading,
    error
  };
}; 