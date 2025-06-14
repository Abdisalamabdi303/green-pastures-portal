import { useState, useCallback } from 'react';
import { Animal } from '@/types';
import VirtualizedAnimalTable from '@/components/animals/VirtualizedAnimalTable';
import { useTableState } from '@/hooks/useTableState';
import { useDebounce } from '@/hooks/useDebounce';
import { useAnimals } from '@/hooks/useAnimals';

export default function Animals() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    animals,
    loading,
    loadingMore,
    hasMore,
    sortKey,
    sortDirection,
    handleSort,
    handleSearch,
    loadMore,
    fetchInitialData
  } = useAnimals();

  const {
    selection,
    selectedCount,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  } = useTableState();

  // Memoize handlers
  const handleEdit = useCallback((animal: Animal) => {
    // Implement edit logic
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Implement delete logic
  }, []);

  const handleBulkDelete = useCallback((selectedIds: string[]) => {
    // Implement bulk delete logic
  }, []);

  const handleBulkStatusChange = useCallback((selectedIds: string[], status: 'active' | 'sold' | 'deceased') => {
    // Implement bulk status change logic
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search animals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
        />
      </div>

      <VirtualizedAnimalTable
        animals={animals}
        columns={[
          { key: 'id', label: 'ID', sortable: true },
          { key: 'type', label: 'Type', sortable: true },
          { key: 'breed', label: 'Breed', sortable: true },
          { key: 'age', label: 'Age', sortable: true },
          { key: 'gender', label: 'Gender', sortable: false },
          { key: 'weight', label: 'Weight', sortable: true },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'actions', label: 'Actions', sortable: false }
        ]}
        sortConfig={{ key: sortKey, direction: sortDirection }}
        selection={selection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
        isDeleting={null}
        loading={loading}
        searchTerm={debouncedSearchTerm}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      {loadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-farm-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading more animals...</p>
        </div>
      )}
    </div>
  );
} 