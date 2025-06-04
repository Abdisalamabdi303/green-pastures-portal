
import React, { memo, useCallback } from 'react';
import { Animal } from '@/types';
import { Edit, Trash, Loader2 } from 'lucide-react';

interface AnimalTableRowProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const AnimalTableRow = memo(({ animal, onEdit, onDelete, isDeleting }: AnimalTableRowProps) => {
  const handleEdit = useCallback(() => {
    onEdit(animal);
  }, [onEdit, animal]);

  const handleDelete = useCallback(() => {
    onDelete(animal.id);
  }, [onDelete, animal.id]);

  const healthStatusClass = React.useMemo(() => {
    switch (animal.health) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }, [animal.health]);

  const ageText = React.useMemo(() => {
    return `${animal.age} ${animal.age === 1 ? 'year' : 'years'}`;
  }, [animal.age]);

  const priceText = React.useMemo(() => {
    return `$${animal.purchasePrice.toFixed(2)}`;
  }, [animal.purchasePrice]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {animal.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.breed}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.gender}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ageText}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.weight} kg
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {priceText}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${healthStatusClass}`}>
          {animal.health}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.isVaccinated ? 'Yes' : 'No'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleEdit}
          className="text-farm-600 hover:text-farm-900 mr-4"
          disabled={isDeleting}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash className="h-5 w-5" />
          )}
        </button>
      </td>
    </tr>
  );
});

AnimalTableRow.displayName = 'AnimalTableRow';

export default AnimalTableRow;
