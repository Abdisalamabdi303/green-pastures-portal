import React, { useState } from 'react';
import { Animal } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const AnimalCard = ({ animal, onEdit, onDelete, isDeleting }: AnimalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {animal.id}
            </h3>
            <p className="text-sm text-gray-500">{animal.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
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

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Breed:</span>
                <span className="font-medium text-gray-900">{animal.breed || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Age:</span>
                <span className="font-medium text-gray-900">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Gender:</span>
                <span className="font-medium text-gray-900">{animal.gender || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Weight:</span>
                <span className="font-medium text-gray-900">
                  {animal.weight ? `${animal.weight} kg` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium text-green-600">
                  {formatPrice(animal.purchasePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Lineage:</span>
                <span className="font-medium text-gray-900">
                  {animal.bornInFarm ? 'Born in Farm' : 'Not born in farm'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                animal.status === 'active' ? 'bg-green-100 text-green-800' :
                animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                animal.vaccinated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {animal.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                animal.washing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {animal.washing ? 'Washed' : 'Not Washed'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalCard;
