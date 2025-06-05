
import { useState, useCallback, useMemo } from 'react';
import { SortConfig, TableSelection } from '@/types';

export const useTableState = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [selection, setSelection] = useState<TableSelection>({ selectedIds: new Set(), isAllSelected: false });

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return {
        selectedIds: newSelectedIds,
        isAllSelected: false
      };
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: string[]) => {
    setSelection(prev => {
      if (prev.isAllSelected) {
        return { selectedIds: new Set(), isAllSelected: false };
      } else {
        return { selectedIds: new Set(allIds), isAllSelected: true };
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ selectedIds: new Set(), isAllSelected: false });
  }, []);

  const selectedCount = useMemo(() => selection.selectedIds.size, [selection.selectedIds]);

  return {
    sortConfig,
    selection,
    selectedCount,
    handleSort,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  };
};
