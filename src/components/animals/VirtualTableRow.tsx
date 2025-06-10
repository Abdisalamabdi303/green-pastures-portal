
import React, { memo, useCallback } from 'react';
import { Animal, TableSelection } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface VirtualTableRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    animals: Animal[];
    selection: TableSelection;
    onEdit: (animal: Animal) => void;
    onDelete: (animal: Animal) => void;
    onToggleSelection: (id: string) => void;
    isDeleting: string | null;
    searchTerm?: string;
  };
}

export const VirtualTableRow = memo(({ index, style, data }: VirtualTableRowProps) => {
  const { animals, selection, onEdit, onDelete, onToggleSelection, isDeleting, searchTerm } = data;
  const animal = animals[index];

  if (!animal) return null;

  const handleDelete = useCallback(() => {
    onDelete(animal);
  }, [animal, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(animal);
  }, [animal, onEdit]);

  const handleToggleSelection = useCallback(() => {
    onToggleSelection(animal.id);
  }, [animal.id, onToggleSelection]);

  const highlightText = useCallback((text: string) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
  }, [searchTerm]);

  return (
    <div
      style={style}
      className="flex items-center border-b border-gray-200 hover:bg-gray-50 px-2 sm:px-4"
    >
      <div className="w-8 sm:w-12 flex items-center justify-center">
        <Checkbox
          checked={selection.selectedIds.has(animal.id)}
          onCheckedChange={handleToggleSelection}
        />
      </div>
      
      <div className="flex-1 grid grid-cols-4 sm:grid-cols-9 gap-2 sm:gap-4 items-center text-sm">
        <div className="truncate font-medium">
          {highlightText(animal.id)}
        </div>
        <div className="truncate">
          {highlightText(animal.type || '')}
        </div>
        <div className="truncate hidden sm:block">
          {highlightText(animal.breed || '')}
        </div>
        <div className="truncate font-medium text-green-600 hidden sm:block">
          {formatPrice(animal.purchasePrice)}
        </div>
        <div className="truncate hidden sm:block">
          {animal.age || '-'}
        </div>
        <div className="truncate hidden sm:block">
          {animal.gender || '-'}
        </div>
        <div className="truncate hidden sm:block">
          {animal.weight ? `${animal.weight} kg` : '-'}
        </div>
        <div className="truncate">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            animal.status === 'active' ? 'bg-green-100 text-green-800' :
            animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {animal.status}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            disabled={isDeleting === animal.id}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting === animal.id}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
          >
            {isDeleting === animal.id ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600" />
            ) : (
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

VirtualTableRow.displayName = 'VirtualTableRow';
