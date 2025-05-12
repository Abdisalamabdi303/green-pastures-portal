
import { Animal } from '@/types';
import AnimalCard from './AnimalCard';

interface AnimalCardGridProps {
  animals: Animal[];
}

const AnimalCardGrid = ({ animals }: AnimalCardGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {animals.length > 0 ? (
        animals.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-10 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No animals found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new animal.</p>
        </div>
      )}
    </div>
  );
};

export default AnimalCardGrid;
