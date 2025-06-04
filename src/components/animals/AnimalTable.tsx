
import React, { memo, useCallback, useMemo } from 'react';
import { Animal } from '@/types';
import AnimalTableHeader from './AnimalTableHeader';
import AnimalTableRow from './AnimalTableRow';

interface AnimalTableProps {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const AnimalTable = memo(({ animals, onEdit, onDelete, isDeleting }: AnimalTableProps) => {
  const handleEdit = useCallback((animal: Animal) => {
    onEdit(animal);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  const tableRows = useMemo(() => {
    return animals.map((animal) => (
      <AnimalTableRow
        key={animal.id}
        animal={animal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting === animal.id}
      />
    ));
  }, [animals, handleEdit, handleDelete, isDeleting]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <AnimalTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {tableRows}
        </tbody>
      </table>
    </div>
  );
});

AnimalTable.displayName = 'AnimalTable';

export default AnimalTable;
