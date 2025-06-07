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
    if (window.confirm(`Are you sure you want to delete animal ${id}?`)) {
      onDelete(id);
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selection.isAllSelected}
            onCheckedChange={() => onToggleSelectAll(animals.map(a => a.id))}
          />
          <span className="text-sm font-medium">Animals</span>
        </div>
      </div>

      {/* Animal Cards */}
      <div className="space-y-2">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-2 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selection.selectedIds.has(animal.id)}
                    onCheckedChange={() => onToggleSelection(animal.id)}
                  />
                  <div>
                    <div className="font-medium text-sm">{highlightText(animal.id)}</div>
                    <div className="text-xs text-gray-600">{highlightText(animal.type || '')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(animal)}
                    className="h-6 w-6 p-0"
                    disabled={isDeleting === animal.id}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(animal.id)}
                    disabled={isDeleting === animal.id}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    {isDeleting === animal.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
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
                  <span className="ml-1">{animal.age || '-'}</span>
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