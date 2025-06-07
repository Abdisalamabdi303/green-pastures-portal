import React from 'react';
import { Animal } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const AnimalCard = ({ animal, onEdit, onDelete, isDeleting }: AnimalCardProps) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete animal ${animal.id}?`)) {
      onDelete(animal.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {animal.photoUrl && (
        <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
          <img 
            src={animal.photoUrl} 
            alt={`${animal.type} ${animal.breed}`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate text-sm">{animal.id}</h3>
            <p className="text-xs text-gray-600">{animal.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(animal)}
              className="h-7 w-7 p-0 hover:bg-gray-100"
              disabled={isDeleting === animal.id}
            >
              <Edit className="h-3 w-3 text-gray-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-7 w-7 p-0 hover:bg-red-50"
              disabled={isDeleting === animal.id}
            >
              {isDeleting === animal.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
              ) : (
                <Trash2 className="h-3 w-3 text-red-600" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Breed:</span>
            <span className="font-medium text-gray-900">{animal.breed || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Age:</span>
            <span className="font-medium text-gray-900">{animal.age || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Gender:</span>
            <span className="font-medium text-gray-900">{animal.gender || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Weight:</span>
            <span className="font-medium text-gray-900">
              {animal.weight ? `${animal.weight} kg` : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Price:</span>
            <span className="font-medium text-green-600">
              {formatPrice(animal.purchasePrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              animal.status === 'active' ? 'bg-green-100 text-green-800' :
              animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {animal.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
