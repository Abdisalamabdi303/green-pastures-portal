import { Animal } from '@/types';
import AnimalCard from './AnimalCard';
import { Dispatch, SetStateAction } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface AnimalCardGridProps {
  animals: Animal[];
  setSelectedAnimal?: Dispatch<SetStateAction<Animal | null>>;
  setIsAddAnimalOpen?: Dispatch<SetStateAction<boolean>>;
  setAnimals?: Dispatch<SetStateAction<Animal[]>>;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

const AnimalCardGrid = ({ 
  animals, 
  setSelectedAnimal, 
  setIsAddAnimalOpen, 
  setAnimals,
  onEdit,
  onDelete
}: AnimalCardGridProps) => {
  
  const handleEdit = (animal: Animal) => {
    if (onEdit) {
      onEdit(animal);
    } else if (setSelectedAnimal && setIsAddAnimalOpen) {
      setSelectedAnimal(animal);
      setIsAddAnimalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (onDelete) {
        await onDelete(id);
        return;
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'animals', id));
      
      // Update local state
      if (setAnimals) {
        setAnimals(prevAnimals => prevAnimals.filter(animal => animal.id !== id));
      }
      
      toast.success('Animal deleted successfully');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
      {animals.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          No animals found
        </div>
      )}
    </div>
  );
};

export default AnimalCardGrid;
