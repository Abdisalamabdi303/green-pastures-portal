
import React, { memo, useRef } from 'react';
import { Animal, TableColumn, SortConfig, TableSelection } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { VirtualTableHeader } from './VirtualTableHeader';
import { VirtualTableRow } from './VirtualTableRow';
import { useVirtualTable } from './useVirtualTable';

const ROW_HEIGHT = 60;
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
  const { handleDeleteClick, itemData, handleScroll } = useVirtualTable({
    animals,
    selection,
    onEdit,
    onDelete,
    onToggleSelection,
    isDeleting,
    searchTerm,
    onLoadMore,
    hasMore
  });

  const rowVirtualizer = useVirtualizer({
    count: animals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
  });

  return (
    <div ref={parentRef} className="relative" style={{ height: 'calc(100vh - 300px)' }}>
      <VirtualTableHeader
        columns={columns}
        sortConfig={sortConfig}
        selection={selection}
        animalIds={animals.map(a => a.id)}
        onSort={onSort}
        onToggleSelectAll={onToggleSelectAll}
      />
      
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <VirtualTableRow
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
