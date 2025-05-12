
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Animal } from '../types';
import AnimalTable from '../components/animals/AnimalTable';
import AnimalCardGrid from '../components/animals/AnimalCardGrid';
import AddAnimalForm from '../components/animals/AddAnimalForm';
import AnimalSearchBar from '../components/animals/AnimalSearchBar';
import { LayoutGrid, List } from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

const AnimalsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch animals from Firestore
  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const animalsCollection = collection(db, 'animals');
      const snapshot = await getDocs(animalsCollection);
      
      const animalsList: Animal[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
      
      setAnimals(animalsList);
      console.log('Fetched animals:', animalsList);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast.error('Failed to load animals from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchAnimals();
  }, [navigate]);

  const filteredAnimals = animals.filter(animal =>
    animal.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAnimal = async (newAnimal: Animal) => {
    try {
      if (selectedAnimal) {
        // Editing existing animal
        const animalRef = doc(db, 'animals', selectedAnimal.id);
        await updateDoc(animalRef, newAnimal);
        setAnimals(prevAnimals => 
          prevAnimals.map(animal => 
            animal.id === selectedAnimal.id ? { ...newAnimal, id: selectedAnimal.id } : animal
          )
        );
        toast.success('Animal updated successfully');
      } else {
        // Adding new animal
        const docRef = await addDoc(collection(db, 'animals'), newAnimal);
        const animalWithId = { ...newAnimal, id: docRef.id };
        setAnimals(prevAnimals => [...prevAnimals, animalWithId]);
        toast.success('Animal added successfully');
      }
      
      setSelectedAnimal(null);
      setIsAddAnimalOpen(false);
    } catch (error) {
      console.error('Error saving animal:', error);
      toast.error('Failed to save animal');
    }
  };
  
  const handleEditAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsAddAnimalOpen(true);
  };

  const handleDeleteAnimal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'animals', id));
      setAnimals(prevAnimals => prevAnimals.filter(animal => animal.id !== id));
      toast.success('Animal deleted successfully');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
    }
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
              onAddClick={() => {
                setSelectedAnimal(null);
                setIsAddAnimalOpen(true);
              }}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading animals...</p>
            </div>
          ) : (
            <div className="mt-8">
              {viewMode === 'card' ? (
                <AnimalCardGrid
                  animals={filteredAnimals}
                  setSelectedAnimal={setSelectedAnimal}
                  setIsAddAnimalOpen={setIsAddAnimalOpen}
                  setAnimals={setAnimals}
                />
              ) : (
                <div className="overflow-x-auto">
                  <AnimalTable 
                    animals={filteredAnimals} 
                    onEdit={handleEditAnimal}
                    onDelete={handleDeleteAnimal}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {isAddAnimalOpen && (
        <AddAnimalForm
          animalToEdit={selectedAnimal}
          onAddAnimal={handleAddAnimal}
          onClose={() => {
            setIsAddAnimalOpen(false);
            setSelectedAnimal(null);
          }}
        />
      )}
    </div>
  );
};

export default AnimalsPage;
