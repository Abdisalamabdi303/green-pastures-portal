import React, { memo, useMemo } from 'react';
import { Animal, TableColumn } from '@/types';
import VirtualizedAnimalTable from './VirtualizedAnimalTable';
import MobileAnimalTable from './MobileAnimalTable';
import AnimalCardGrid from './AnimalCardGrid';
import BulkActions from './BulkActions';
import { useTableState } from '@/hooks/useTableState';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AnimalsListProps {
  animals: Animal[];
  viewMode: 'card' | 'list';
  loading: boolean;
  loadingMore?: boolean;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (selectedIds: string[]) => void;
  onBulkStatusChange: (selectedIds: string[], status: 'active' | 'sold' | 'deceased') => void;
  isDeleting: string | null;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onSort: (key: string) => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  searchTerm?: string;
}

const AnimalsList = memo(({
  animals,
  viewMode,
  loading,
  loadingMore = false,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  isDeleting,
  onScroll,
  onSort,
  sortKey,
  sortDirection,
  searchTerm
}: AnimalsListProps) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const {
    selection,
    selectedCount,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  } = useTableState();

  const tableColumns: TableColumn[] = useMemo(() => [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'breed', label: 'Breed', sortable: true },
    { key: 'purchasePrice', label: 'Purchase Price', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'gender', label: 'Gender', sortable: false },
    { key: 'weight', label: 'Weight', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ], []);

  const sortConfig = useMemo(() => ({
    key: sortKey,
    direction: sortDirection
  }), [sortKey, sortDirection]);

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selection.selectedIds);
    const selectedAnimals = animals.filter(animal => selectedIds.includes(animal.id));
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.length} selected animal${selectedIds.length > 1 ? 's' : ''}?\n\nSelected animals:\n${selectedAnimals.map(animal => `- ID: ${animal.id}, Type: ${animal.type}, Breed: ${animal.breed}`).join('\n')}\n\nThis action cannot be undone and will also delete all related health records, vaccinations, and expenses.`;
    
    if (window.confirm(confirmMessage)) {
      onBulkDelete(selectedIds);
      clearSelection();
    }
  };

  const handleBulkStatusChange = (status: 'active' | 'sold' | 'deceased') => {
    const selectedIds = Array.from(selection.selectedIds);
    onBulkStatusChange(selectedIds, status);
    clearSelection();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <BulkActions
        selectedCount={selectedCount}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={clearSelection}
        selectedIds={Array.from(selection.selectedIds)}
        animals={animals}
      />
      
      <div 
        onScroll={onScroll}
        style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
      >
        {viewMode === 'list' ? (
          isMobile ? (
            <MobileAnimalTable
              animals={animals}
              selection={selection}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelection={toggleSelection}
              onToggleSelectAll={toggleSelectAll}
              isDeleting={isDeleting}
              searchTerm={searchTerm}
            />
          ) : (
            <VirtualizedAnimalTable
              animals={animals}
              columns={tableColumns}
              sortConfig={sortConfig}
              selection={selection}
              onSort={onSort}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelection={toggleSelection}
              onToggleSelectAll={toggleSelectAll}
              isDeleting={isDeleting}
              loading={loading}
              searchTerm={searchTerm}
            />
          )
        ) : (
          <AnimalCardGrid
            animals={animals}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
      
      {!loading && !loadingMore && animals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No animals found</p>
        </div>
      )}
    </div>
  );
});

AnimalsList.displayName = 'AnimalsList';

export default AnimalsList;
