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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative aspect-video">
        {animal.imageUrl ? (
          <img
            src={animal.imageUrl}
            alt={`${animal.type} - ${animal.breed}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {animal.name || animal.id}
          </h3>
          <p className="text-sm text-gray-500">{animal.type}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Breed:</span>
            <span className="font-medium text-gray-900">{animal.breed || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Age:</span>
            <span className="font-medium text-gray-900">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
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

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(animal)}
            className="text-farm-600 hover:text-farm-900"
            disabled={isDeleting === animal.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(animal.id)}
            className="text-red-600 hover:text-red-900"
            disabled={isDeleting === animal.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
