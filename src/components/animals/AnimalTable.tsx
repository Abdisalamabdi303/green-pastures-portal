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

const columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'breed', label: 'Breed', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'gender', label: 'Gender', sortable: true },
  { key: 'weight', label: 'Weight', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

const AnimalTable = ({ animals, onEdit, onDelete, isDeleting }: AnimalTableProps) => {
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
          {animals.length === 0 && (
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

export default memo(AnimalTable);
