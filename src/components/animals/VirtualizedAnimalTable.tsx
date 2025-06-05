
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Animal, TableColumn, SortConfig, TableSelection } from '@/types';
import { ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface VirtualizedAnimalTableProps {
  animals: Animal[];
  columns: TableColumn[];
  sortConfig: SortConfig;
  selection: TableSelection;
  onSort: (key: string) => void;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: (allIds: string[]) => void;
  isDeleting: string | null;
  loading?: boolean;
  searchTerm?: string;
}

const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 48;

interface VirtualRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    animals: Animal[];
    columns: TableColumn[];
    selection: TableSelection;
    onEdit: (animal: Animal) => void;
    onDelete: (id: string) => void;
    onToggleSelection: (id: string) => void;
    isDeleting: string | null;
    searchTerm?: string;
  };
}

const VirtualRow = memo(({ index, style, data }: VirtualRowProps) => {
  const { animals, columns, selection, onEdit, onDelete, onToggleSelection, isDeleting, searchTerm } = data;
  const animal = animals[index];

  if (!animal) return null;

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
    <div
      style={style}
      className="flex items-center border-b border-gray-200 hover:bg-gray-50 px-4"
    >
      <div className="w-12 flex items-center justify-center">
        <Checkbox
          checked={selection.selectedIds.has(animal.id)}
          onCheckedChange={() => onToggleSelection(animal.id)}
        />
      </div>
      
      <div className="flex-1 grid grid-cols-8 gap-4 items-center">
        <div className="truncate font-medium">
          {highlightText(animal.id)}
        </div>
        <div className="truncate">
          {highlightText(animal.type || '')}
        </div>
        <div className="truncate">
          {highlightText(animal.breed || '')}
        </div>
        <div className="truncate">
          {animal.age || '-'}
        </div>
        <div className="truncate">
          {animal.gender || '-'}
        </div>
        <div className="truncate">
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(animal)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(animal.id)}
            disabled={isDeleting === animal.id}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            {isDeleting === animal.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

VirtualRow.displayName = 'VirtualRow';

const TableHeader = memo(({ 
  columns, 
  sortConfig, 
  selection, 
  animalIds, 
  onSort, 
  onToggleSelectAll 
}: {
  columns: TableColumn[];
  sortConfig: SortConfig;
  selection: TableSelection;
  animalIds: string[];
  onSort: (key: string) => void;
  onToggleSelectAll: (allIds: string[]) => void;
}) => (
  <div className="flex items-center border-b border-gray-300 bg-gray-50 px-4 font-medium text-gray-700" style={{ height: HEADER_HEIGHT }}>
    <div className="w-12 flex items-center justify-center">
      <Checkbox
        checked={selection.isAllSelected}
        indeterminate={selection.selectedIds.size > 0 && !selection.isAllSelected}
        onCheckedChange={() => onToggleSelectAll(animalIds)}
      />
    </div>
    
    <div className="flex-1 grid grid-cols-8 gap-4 items-center">
      {columns.map((column) => (
        <div key={column.key} className="flex items-center">
          {column.sortable ? (
            <button
              onClick={() => onSort(column.key)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <span>{column.label}</span>
              {sortConfig.key === column.key && (
                sortConfig.direction === 'asc' ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span>{column.label}</span>
          )}
        </div>
      ))}
    </div>
  </div>
));

TableHeader.displayName = 'TableHeader';

const VirtualizedAnimalTable = ({
  animals,
  columns,
  sortConfig,
  selection,
  onSort,
  onEdit,
  onDelete,
  onToggleSelection,
  onToggleSelectAll,
  isDeleting,
  loading = false,
  searchTerm
}: VirtualizedAnimalTableProps) => {
  const animalIds = useMemo(() => animals.map(a => a.id), [animals]);

  const itemData = useMemo(() => ({
    animals,
    columns,
    selection,
    onEdit,
    onDelete,
    onToggleSelection,
    isDeleting,
    searchTerm
  }), [animals, columns, selection, onEdit, onDelete, onToggleSelection, isDeleting, searchTerm]);

  if (loading && animals.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <TableHeader
          columns={columns}
          sortConfig={sortConfig}
          selection={selection}
          animalIds={[]}
          onSort={onSort}
          onToggleSelectAll={onToggleSelectAll}
        />
        <div className="space-y-2 p-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="rounded bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <TableHeader
        columns={columns}
        sortConfig={sortConfig}
        selection={selection}
        animalIds={animalIds}
        onSort={onSort}
        onToggleSelectAll={onToggleSelectAll}
      />
      
      {animals.length > 0 ? (
        <List
          height={Math.min(animals.length * ROW_HEIGHT, 600)}
          itemCount={animals.length}
          itemSize={ROW_HEIGHT}
          itemData={itemData}
          overscanCount={5}
        >
          {VirtualRow}
        </List>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No animals found
        </div>
      )}
    </div>
  );
};

export default memo(VirtualizedAnimalTable);
