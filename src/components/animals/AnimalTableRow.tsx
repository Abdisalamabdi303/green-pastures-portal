import React, { memo } from 'react';
import { Animal } from '@/types';
import { Edit, Trash, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface AnimalTableRowProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const AnimalTableRow = memo(({ animal, onEdit, onDelete, isDeleting }: AnimalTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
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
        {animal.age} {animal.age === 1 ? 'year' : 'years'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {animal.weight} kg
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(animal.purchasePrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
          animal.status === 'active' ? 'bg-green-100 text-green-800' : 
          animal.status === 'sold' ? 'bg-blue-100 text-blue-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {animal.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(animal)}
          className="text-farm-600 hover:text-farm-900 mr-4 transition-colors duration-150"
          disabled={isDeleting}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(animal.id)}
          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
