import { Animal } from '@/types';
import { Edit, Trash, Loader2 } from 'lucide-react';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const AnimalCard = ({ animal, onEdit, onDelete, isDeleting }: AnimalCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {animal.photoUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={animal.photoUrl} 
            alt={`${animal.type} ${animal.breed}`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">ID: {animal.id}</h3>
            <p className="text-sm text-gray-600">Type: {animal.type}</p>
            <p className="text-sm text-gray-600">Breed: {animal.breed}</p>
          </div>
          <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
            animal.health === 'Excellent' ? 'bg-green-100 text-green-800' : 
            animal.health === 'Good' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {animal.health}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Age:</span>
            <span className="ml-2 text-gray-900">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
          </div>
          <div>
            <span className="text-gray-500">Weight:</span>
            <span className="ml-2 text-gray-900">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>
            <span className="ml-2 text-gray-900">{animal.gender}</span>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-2 text-gray-900">${animal.purchasePrice.toFixed(2)}</span>
          </div>
          {animal.isVaccinated !== undefined && (
            <div>
              <span className="text-gray-500">Vaccinated:</span>
              <span className="ml-2 text-gray-900">
                {typeof animal.isVaccinated === 'boolean' 
                  ? (animal.isVaccinated ? 'Yes' : 'No') 
                  : animal.isVaccinated}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(animal)}
            className="p-2 text-gray-600 hover:text-farm-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting === animal.id}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(animal.id)}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting === animal.id}
          >
            {isDeleting === animal.id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
