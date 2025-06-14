import { Animal } from '@/types';
import AnimalCard from './AnimalCard';

interface AnimalCardGridProps {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting?: string | null;
}

const AnimalCardGrid = ({ 
  animals, 
  onEdit,
  onDelete,
  isDeleting
}: AnimalCardGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {animals.map((animal) => (
        <div key={animal.id} className="h-fit">
          <AnimalCard
            animal={animal}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
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
