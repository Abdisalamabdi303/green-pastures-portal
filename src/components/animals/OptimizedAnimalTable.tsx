
import React, { memo, useMemo, useCallback } from 'react';
import { Animal } from '@/types';
import { FixedSizeList as List } from 'react-window';
import AnimalTableHeader from './AnimalTableHeader';
import AnimalTableRow from './AnimalTableRow';

interface OptimizedAnimalTableProps {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
  loading?: boolean;
  loadingMore?: boolean;
}

// Memoized row component for react-window
const VirtualizedRow = memo(({ index, style, data }: any) => {
  const { animals, onEdit, onDelete, isDeleting } = data;
  const animal = animals[index];
  
  if (!animal) return null;
  
  return (
    <div style={style}>
      <AnimalTableRow
        animal={animal}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting === animal.id}
      />
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

const OptimizedAnimalTable = ({ 
  animals, 
  onEdit, 
  onDelete, 
  isDeleting,
  loading = false,
  loadingMore = false
}: OptimizedAnimalTableProps) => {
  
  // Memoized handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((animal: Animal) => {
    onEdit(animal);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  // Memoized data for virtualized list
  const listData = useMemo(() => ({
    animals,
    onEdit: handleEdit,
    onDelete: handleDelete,
    isDeleting
  }), [animals, handleEdit, handleDelete, isDeleting]);

  // Show loading skeleton
  if (loading && animals.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <AnimalTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <AnimalTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {animals.map((animal) => (
            <AnimalTableRow
              key={animal.id}
              animal={animal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting === animal.id}
            />
          ))}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <tr>
              <td colSpan={10} className="px-6 py-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-farm-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading more animals...</span>
                </div>
              </td>
            </tr>
          )}
          
          {/* Empty state */}
          {animals.length === 0 && !loading && (
            <tr>
              <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                No animals found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default memo(OptimizedAnimalTable);
