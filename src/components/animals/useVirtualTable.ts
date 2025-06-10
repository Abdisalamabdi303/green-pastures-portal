
import { useCallback, useMemo, useEffect } from 'react';
import { Animal, TableSelection } from '@/types';

interface UseVirtualTableProps {
  animals: Animal[];
  selection: TableSelection;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  isDeleting: string | null;
  searchTerm?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const useVirtualTable = ({
  animals,
  selection,
  onEdit,
  onDelete,
  onToggleSelection,
  isDeleting,
  searchTerm,
  onLoadMore,
  hasMore = false
}: UseVirtualTableProps) => {
  
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

  return {
    handleDeleteClick,
    itemData,
    handleScroll
  };
};
