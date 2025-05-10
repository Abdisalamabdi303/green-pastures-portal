import { Animal } from '@/types';

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}
const AnimalCard = ({ animal, onEdit, onDelete }: AnimalCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="h-48 w-full bg-gray-200 overflow-hidden">
        {animal.photoUrl ? (
          <img 
            src={animal.photoUrl} 
            alt={`${animal.type} - ${animal.breed}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{animal.type}</h3>
            <p className="text-sm text-gray-600">ID: {animal.id}</p>
            <p className="text-sm text-gray-600">Breed: {animal.breed}</p>
          </div>
          <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
            animal.health === 'Excellent' ? 'bg-green-100 text-green-800' : 
            animal.health === 'Good' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {animal.health}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Age:</span>
            <span className="ml-2 text-gray-900">{animal.age} {animal.age === 1 ? 'year' : 'years'}</span>
          </div>
          <div>
            <span className="text-gray-500">Weight:</span>
            <span className="ml-2 text-gray-900">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Vaccinated:</span>
            <span className="ml-2 text-gray-900">{animal.isVaccinated === 'Yes' ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(animal)}
            className="text-farm-600 hover:text-farm-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(animal.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


export default AnimalCard;
