import { Animal } from '@/types';
import { Edit, Trash } from 'lucide-react';

interface AnimalTableProps {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

const AnimalTable = ({ animals, onEdit, onDelete }: AnimalTableProps) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Breed</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Age</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Weight</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Health</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {animals.map((animal) => (
            <tr key={animal.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {animal.id}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{animal.name}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{animal.type}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{animal.breed}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {animal.age} {animal.age === 1 ? 'year' : 'years'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {animal.weight ? `${animal.weight} kg` : 'N/A'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  animal.health === 'Excellent' ? 'bg-green-100 text-green-800' : 
                  animal.health === 'Good' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {animal.health}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  animal.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {animal.status}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(animal)}
                    className="text-farm-600 hover:text-farm-900"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(animal.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {animals.length === 0 && (
            <tr>
              <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                No animals found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnimalTable;
