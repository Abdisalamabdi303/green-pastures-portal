
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { animalData } from '../data/mockData';
import { User, Animal } from '../types';
import AnimalTable from '../components/animals/AnimalTable';
import AnimalCardGrid from '../components/animals/AnimalCardGrid';
import AddAnimalForm from '../components/animals/AddAnimalForm';
import AnimalSearchBar from '../components/animals/AnimalSearchBar';

const AnimalsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
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

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AnimalSearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setIsAddAnimalOpen(true)}
          />
          
          {/* Display animals as cards */}
          <AnimalCardGrid animals={filteredAnimals} />
          
          {/* Animals Table */}
          <AnimalTable animals={filteredAnimals} />
        </div>
      </main>

      {/* Add Animal Modal */}
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
