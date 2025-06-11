import React, { memo } from 'react';
import { Animal } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface MobileAnimalTableProps {
  animals: Animal[];
  selection: {
    selectedIds: Set<string>;
    isAllSelected: boolean;
  };
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: (allIds: string[]) => void;
  isDeleting: string | null;
  searchTerm?: string;
}

const MobileAnimalTable = memo(({
  animals,
  selection,
  onEdit,
  onDelete,
  onToggleSelection,
  onToggleSelectAll,
  isDeleting,
  searchTerm
}: MobileAnimalTableProps) => {
  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete this animal?`)) {
      onDelete(id);
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm?.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : part
    );
  };

  return (
    <div className="bg-white">
      <div className="border-t border-gray-200">
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <Checkbox
              checked={selection.isAllSelected}
              onCheckedChange={() => onToggleSelectAll(animals.map(a => a.id))}
            />
            <span className="ml-2 text-sm text-gray-500">
              {selection.selectedIds.size} selected
            </span>
          </div>
        </div>

        {animals.map((animal) => (
          <div key={animal.id} className="border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Checkbox
                    checked={selection.selectedIds.has(animal.id)}
                    onCheckedChange={() => onToggleSelection(animal.id)}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {highlightText(animal.id)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {highlightText(animal.type || '')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                    onClick={() => handleDelete(animal.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={isDeleting === animal.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div>
                  <span className="text-gray-500">Breed:</span>
                  <span className="ml-1">{highlightText(animal.breed || '-')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-1 text-green-600">{formatPrice(animal.purchasePrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-1">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-1">{animal.gender || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-1">{animal.weight ? `${animal.weight} kg` : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
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
        ))}
      </div>

      {animals.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'No animals found matching your search' : 'No animals found'}
          </p>
        </div>
      )}
    </div>
  );
});

MobileAnimalTable.displayName = 'MobileAnimalTable';

export default MobileAnimalTable; 