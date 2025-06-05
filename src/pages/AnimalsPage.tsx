
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

const AddAnimalForm = lazy(() => import('../components/animals/AddAnimalForm'));

const AnimalsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);

  const {
    animals,
    loading,
    loadingMore,
    currentPage,
    hasMore,
    isDeleting,
    searchTerm,
    sortKey,
    sortDirection,
    handleSearch,
    handleSort,
    handleAddAnimal,
    handleDeleteAnimal,
    handleBulkDelete,
    handleBulkStatusChange,
    handleScroll,
    SEARCH_DEBOUNCE
  } = useAnimalsData();

  const {
    viewMode,
    setViewMode,
    processedAnimals
  } = useAnimalsFilters(animals);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate, currentUser, authLoading]);

  useEffect(() => {
    if (!currentUser || authLoading) return;

    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUser, authLoading, handleSearch, SEARCH_DEBOUNCE]);

  const handleAddAnimalWrapper = useCallback(async (newAnimal: Animal) => {
    await handleAddAnimal(newAnimal, selectedAnimal);
    setSelectedAnimal(null);
    setIsAddAnimalOpen(false);
  }, [handleAddAnimal, selectedAnimal]);

  const handleEditAnimal = useCallback((animal: Animal) => {
    setSelectedAnimal(animal);
    setIsAddAnimalOpen(true);
  }, []);

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
          onSearchChange={handleSearch}
          sortBy={sortKey}
          onSortByChange={handleSort}
          sortOrder={sortDirection}
          onSortOrderChange={() => handleSort(sortKey)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddAnimal={() => setIsAddAnimalOpen(true)}
        />

        <AnimalsList
          animals={processedAnimals}
          viewMode={viewMode}
          loading={loading}
          loadingMore={loadingMore}
          onEdit={handleEditAnimal}
          onDelete={handleDeleteAnimal}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          isDeleting={isDeleting}
          onScroll={handleScroll}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          searchTerm={searchTerm}
        />

        <AnimalsPagination
          currentPage={currentPage}
          totalPages={Math.ceil(animals.length / 20)}
          loading={loading}
          onPageChange={() => {}}
        />
      </div>

      {isAddAnimalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddAnimalForm
            onAddAnimal={handleAddAnimalWrapper}
            onClose={() => {
              setIsAddAnimalOpen(false);
              setSelectedAnimal(null);
            }}
            animalToEdit={selectedAnimal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AnimalsPage;
