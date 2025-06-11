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

  const handleToggleSelection = useCallback(() => {
    onToggleSelection(animal.id);
  }, [animal.id, onToggleSelection]);

  const highlightText = useCallback((text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm?.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : part
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
          {animal.age} {animal.age === 1 ? 'year' : 'years'}
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
        <div className="flex justify-end gap-2">
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
            onClick={() => onDelete(animal)}
            className="text-red-600 hover:text-red-900"
            disabled={isDeleting === animal.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

VirtualTableRow.displayName = 'VirtualTableRow';
