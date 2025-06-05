
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Animal } from '@/types';
import Navbar from '../components/layout/Navbar';
import AnimalsHeader from '../components/animals/AnimalsHeader';
import AnimalsList from '../components/animals/AnimalsList';
import AnimalsPagination from '../components/animals/AnimalsPagination';
import { useAnimalsData } from '../hooks/useAnimalsData';
import { useAnimalsFilters } from '../hooks/useAnimalsFilters';

// Lazy load components
const AddAnimalForm = lazy(() => import('../components/animals/AddAnimalForm'));

const AnimalsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);

  // Custom hooks for data management and filtering
  const {
    animals,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    isDeleting,
    fetchAnimals,
    handleAddAnimal,
    handleDeleteAnimal,
    handleScroll,
    SEARCH_DEBOUNCE
  } = useAnimalsData();

  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    processedAnimals
  } = useAnimalsFilters(animals);

  // Initial data fetch
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchAnimals(1, '');
  }, [navigate, fetchAnimals, currentUser, authLoading]);

  // Handle search and page changes with debounce
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchAnimals(1, searchTerm);
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUser, fetchAnimals, authLoading, setCurrentPage, SEARCH_DEBOUNCE]);

  // Load more data when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchAnimals(currentPage, searchTerm, true);
    }
  }, [currentPage, searchTerm, fetchAnimals]);

  // Memoized handlers
  const handleAddAnimalWrapper = useCallback(async (newAnimal: Animal) => {
    await handleAddAnimal(newAnimal, selectedAnimal);
    setSelectedAnimal(null);
    setIsAddAnimalOpen(false);
    fetchAnimals(1, searchTerm);
  }, [handleAddAnimal, selectedAnimal, searchTerm, fetchAnimals]);

  const handleEditAnimal = useCallback((animal: Animal) => {
    setSelectedAnimal(animal);
    setIsAddAnimalOpen(true);
  }, []);

  const handleSortOrderChange = useCallback(() => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  }, [sortOrder, setSortOrder]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <AnimalsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddAnimal={() => setIsAddAnimalOpen(true)}
        />

        <AnimalsList
          animals={processedAnimals}
          viewMode={viewMode}
          loading={loading}
          currentPage={currentPage}
          onEdit={handleEditAnimal}
          onDelete={handleDeleteAnimal}
          isDeleting={isDeleting}
          onScroll={handleScroll}
        />

        <AnimalsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Animal Modal */}
      {isAddAnimalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddAnimalForm
            onAddAnimal={handleAddAnimalWrapper}
            isAddAnimalOpen={isAddAnimalOpen}
            setIsAddAnimalOpen={setIsAddAnimalOpen}
            animalToEdit={selectedAnimal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AnimalsPage;
