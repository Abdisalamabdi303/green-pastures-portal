import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { Animal, TableColumn, SortConfig, TableSelection } from '@/types';
import { ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/utils/format';
import { useVirtualizer } from '@tanstack/react-virtual';

// Constants
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 48;
const OVERSCAN_COUNT = 5;

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
  onBulkStatusChange: (selectedIds: string[], status: 'active' | 'deceased') => void;
  isDeleting: string | null;
  loading?: boolean;
  searchTerm?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const VirtualRow = memo(({ index, style, data }: {
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
}) => {
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
  <div className="flex items-center border-b border-gray-300 bg-gray-50 px-2 sm:px-4 font-medium text-gray-700 text-sm" style={{ height: HEADER_HEIGHT }}>
    <div className="w-8 sm:w-12 flex items-center justify-center">
      <Checkbox
        checked={selection.isAllSelected}
        onCheckedChange={() => onToggleSelectAll(animalIds)}
      />
    </div>
    
    <div className="flex-1 grid grid-cols-4 sm:grid-cols-9 gap-2 sm:gap-4 items-center">
      {columns.map((column) => (
        <div 
          key={column.key} 
          className={`flex items-center ${
            ['breed', 'purchasePrice', 'age', 'gender', 'weight'].includes(column.key) 
              ? 'hidden sm:block' 
              : ''
          }`}
        >
          {column.sortable ? (
            <button
              onClick={() => onSort(column.key)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <span>{column.label}</span>
              {sortConfig.key === column.key && (
                sortConfig.direction === 'asc' ? 
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
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
  onBulkStatusChange,
  isDeleting,
  loading = false,
  searchTerm,
  onLoadMore,
  hasMore = false
}: VirtualizedAnimalTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const animalIds = useMemo(() => animals.map(a => a.id), [animals]);

  const rowVirtualizer = useVirtualizer({
    count: animals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: OVERSCAN_COUNT,
    initialOffset: 0,
    measureElement: useCallback((element) => {
      return element.getBoundingClientRect().height;
    }, [])
  });

  const handleDeleteClick = useCallback((animal: Animal) => {
    const confirmMessage = `Are you sure you want to delete this animal?\n\nID: ${animal.id}\nType: ${animal.type}\nBreed: ${animal.breed}\n\nThis action cannot be undone and will also delete all related health records, vaccinations, and expenses.`;
    
    if (window.confirm(confirmMessage)) {
      onDelete(animal.id);
    }
  }, [onDelete]);

  const itemData = useMemo(() => ({
    animals,
    selection,
    onEdit,
    onDelete: handleDeleteClick,
    onToggleSelection,
    isDeleting,
    searchTerm
  }), [animals, selection, onEdit, handleDeleteClick, onToggleSelection, isDeleting, searchTerm]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScrollEvent = (e: Event) => {
      handleScroll(e as unknown as React.UIEvent<HTMLDivElement>);
    };

    scrollElement.addEventListener('scroll', handleScrollEvent);
    return () => scrollElement.removeEventListener('scroll', handleScrollEvent);
  }, [handleScroll]);

  return (
    <div ref={parentRef} className="relative" style={{ height: 'calc(100vh - 300px)' }}>
      <TableHeader
        columns={columns}
        sortConfig={sortConfig}
        selection={selection}
        animalIds={animalIds}
        onSort={onSort}
        onToggleSelectAll={onToggleSelectAll}
      />
      
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <VirtualRow
            key={virtualRow.index}
            index={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
            data={itemData}
          />
        ))}
      </div>

      {loading && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-farm-600"></div>
        </div>
      )}
    </div>
  );
};

export default memo(VirtualizedAnimalTable);
