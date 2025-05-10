import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { animalData } from '../data/mockData';
import { User, Animal } from '../types';
import AnimalTable from '../components/animals/AnimalTable';
import AnimalCardGrid from '../components/animals/AnimalCardGrid';
import AddAnimalForm from '../components/animals/AddAnimalForm';
import AnimalSearchBar from '../components/animals/AnimalSearchBar';
import { LayoutGrid, List } from 'lucide-react'; // icon library

const AnimalsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null); // Selected animal for editing
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    setAnimals(animalData);
  }, [navigate]);

  const filteredAnimals = animals.filter(animal =>
    animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAnimal = (newAnimal: Animal) => {
    setAnimals([...animals, newAnimal]);
  };
  const handleEditAnimal = (animal: Animal) => {
    setSelectedAnimal(animal); // Set the selected animal for editing
    setIsAddAnimalOpen(true); // Open the modal for editing
  };

  const handleDeleteAnimal = (id: string) => {
    setAnimals((prevAnimals) => prevAnimals.filter((animal) => animal.id !== id)); // Remove the animal from the list
  };
  if (!user) {
    return <div className="p-8 text-center text-gray-700 text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Animals</h2>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition ${
                  viewMode === 'card'
                    ? 'bg-farm-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition ${
                  viewMode === 'list'
                    ? 'bg-farm-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          {/* Search Bar & Add Button */}
          <div className="mt-6">
            <AnimalSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddClick={() => setIsAddAnimalOpen(true)}
            />
          </div>

          {/* Conditional Display */}
          <div className="mt-8">
            {viewMode === 'card' ? (
            <AnimalCardGrid
              animals={animals}
              setSelectedAnimal={setSelectedAnimal}
              setIsAddAnimalOpen={setIsAddAnimalOpen}
              setAnimals={setAnimals}
            />
            ) : (
              <div className="overflow-x-auto">
                <AnimalTable animals={filteredAnimals} />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal */}
      {isAddAnimalOpen && (
        <AddAnimalForm
          onAddAnimal={handleAddAnimal}
          onClose={() => setIsAddAnimalOpen(false)}
        />
      )}
    </div>
  );
};

export default AnimalsPage;
