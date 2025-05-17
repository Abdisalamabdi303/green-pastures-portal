import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { User, Animal } from '../types';
import AnimalTable from '../components/animals/AnimalTable';
import AnimalCardGrid from '../components/animals/AnimalCardGrid';
import AddAnimalForm from '../components/animals/AddAnimalForm';
import AnimalSearchBar from '../components/animals/AnimalSearchBar';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { animalServices } from '../services/firebase';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const AnimalsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch animals from Firestore
  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const animalsList = await animalServices.getAnimals();
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
    animal.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE);
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleAddAnimal = async (newAnimal: Animal) => {
    try {
      if (selectedAnimal) {
        // Editing existing animal
        const updatedAnimal = await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        setAnimals(prevAnimals => 
          prevAnimals.map(animal => 
            animal.id === selectedAnimal.id ? { ...updatedAnimal, id: selectedAnimal.id } : animal
          )
        );
        toast.success('Animal updated successfully');
      } else {
        // Adding new animal
        const addedAnimal = await animalServices.addAnimal(newAnimal);
        setAnimals(prevAnimals => [...prevAnimals, addedAnimal]);
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
    if (confirm('Are you sure you want to delete this animal?')) {
      try {
        await animalServices.deleteAnimal(id);
        setAnimals(prevAnimals => prevAnimals.filter(animal => animal.id !== id));
        toast.success('Animal deleted successfully');
      } catch (error) {
        console.error('Error deleting animal:', error);
        toast.error('Failed to delete animal');
      }
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
              onSearchChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1); // Reset to first page on search
              }}
              onAddClick={() => {
                setSelectedAnimal(null);
                setIsAddAnimalOpen(true);
              }}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading animals...</p>
            </div>
          ) : (
            <div className="mt-8">
              {viewMode === 'card' ? (
                <AnimalCardGrid
                  animals={paginatedAnimals}
                  onEdit={handleEditAnimal}
                  onDelete={handleDeleteAnimal}
                />
              ) : (
                <div className="overflow-x-auto">
                  <AnimalTable 
                    animals={paginatedAnimals} 
                    onEdit={handleEditAnimal}
                    onDelete={handleDeleteAnimal}
                  />
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * ITEMS_PER_PAGE, filteredAnimals.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredAnimals.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                            currentPage === 1 ? 'cursor-not-allowed' : 'hover:text-gray-500'
                          }`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === i + 1
                                ? 'z-10 bg-farm-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-farm-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                            currentPage === totalPages ? 'cursor-not-allowed' : 'hover:text-gray-500'
                          }`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
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
