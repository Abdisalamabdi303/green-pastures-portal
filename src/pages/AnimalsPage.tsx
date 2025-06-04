import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { animalServices } from '@/services/firebase';
import { Animal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '../components/layout/Navbar';

// Lazy load components
const AnimalTable = lazy(() => import('../components/animals/AnimalTable'));
const AnimalCardGrid = lazy(() => import('../components/animals/AnimalCardGrid'));
const AddAnimalForm = lazy(() => import('../components/animals/AddAnimalForm'));

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const SEARCH_DEBOUNCE = 300; // 300ms

// Create cache Map outside component to persist between renders
const animalsCache = new Map<string, { data: any; timestamp: number }>();

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const AnimalsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hasMore, setHasMore] = useState(true);

  // Memoized cache key generator
  const getCacheKey = useCallback((page: number, search: string) => 
    `${page}-${search}-${filter}-${sortBy}-${sortOrder}`, 
    [filter, sortBy, sortOrder]
  );

  // Memoized fetch function with infinite scroll support
  const fetchAnimals = useCallback(async (page: number, search: string, append: boolean = false) => {
    if (!currentUser) return;

    const cacheKey = getCacheKey(page, search);
    const cachedData = animalsCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      if (append) {
        setAnimals(prev => [...prev, ...cachedData.data.animals]);
      } else {
        setAnimals(cachedData.data.animals);
      }
      setTotalPages(Math.ceil((cachedData.data.total || 0) / ITEMS_PER_PAGE));
      setHasMore(cachedData.data.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const result = await animalServices.getAnimals(page, ITEMS_PER_PAGE, search);
      
      if (!result || !result.animals) {
        setAnimals([]);
        setTotalPages(1);
        setHasMore(false);
        return;
      }
      
      animalsCache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      
      if (append) {
        setAnimals(prev => [...prev, ...result.animals]);
      } else {
        setAnimals(result.animals);
      }
      setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch animals. Please try again.',
        variant: 'destructive'
      });
      setAnimals([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [toast, currentUser, getCacheKey]);

  // Memoized filtered and sorted animals
  const processedAnimals = useMemo(() => {
    let filtered = [...animals];

    if (filter !== 'all') {
      filtered = filtered.filter(animal => animal.status === filter);
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'value':
          comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [animals, filter, sortBy, sortOrder]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

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
  }, [searchTerm, currentUser, fetchAnimals, authLoading]);

  // Load more data when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchAnimals(currentPage, searchTerm, true);
    }
  }, [currentPage, searchTerm, fetchAnimals]);

  // Memoized handlers
  const handleAddAnimal = useCallback(async (newAnimal: Animal) => {
    try {
      // Optimistically update UI
      if (selectedAnimal) {
        setAnimals(prev => prev.map(animal => 
          animal.id === selectedAnimal.id ? newAnimal : animal
        ));
      } else {
        setAnimals(prev => [newAnimal, ...prev]);
      }
      setSelectedAnimal(null);
      setIsAddAnimalOpen(false);

      // Then perform the actual server operation
      if (selectedAnimal) {
        await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        toast({
          title: "Success",
          description: "Animal updated successfully"
        });
      } else {
        await animalServices.addAnimal(newAnimal);
        toast({
          title: "Success",
          description: "Animal added successfully"
        });
      }
      animalsCache.clear();
      fetchAnimals(1, searchTerm);
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error saving animal:', error);
      toast({
        title: "Error",
        description: "Failed to save animal",
        variant: "destructive"
      });
      // Refresh the data to ensure UI is in sync with server
      fetchAnimals(1, searchTerm);
    }
  }, [selectedAnimal, searchTerm, fetchAnimals, toast]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      toast({
        title: "Error",
        description: "Animal not found",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone.`)) {
      try {
        // Optimistically update UI
        setIsDeleting(id);
        setAnimals(prev => prev.filter(animal => animal.id !== id));

        // Then perform the actual server operation
        await animalServices.deleteAnimal(id);
        animalsCache.clear();
        toast({
          title: "Success",
          description: "Animal deleted successfully"
        });
      } catch (error) {
        // Revert optimistic update on error
        console.error('Error deleting animal:', error);
        toast({
          title: "Error",
          description: `Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        // Refresh the data to ensure UI is in sync with server
        fetchAnimals(1, searchTerm);
      } finally {
        setIsDeleting(null);
      }
    }
  }, [animals, searchTerm, fetchAnimals, toast]);

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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Animals</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your farm animals and their records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsAddAnimalOpen(true)}
                className="bg-farm-600 hover:bg-farm-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Animal
              </Button>
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gray-100' : ''}
                >
                  <List className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('card')}
                  className={viewMode === 'card' ? 'bg-gray-100' : ''}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search animals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="all">All Animals</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-white border-gray-200"
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
        >
          {loading && currentPage === 1 ? (
            <LoadingSkeleton />
          ) : (
            <Suspense fallback={<LoadingSkeleton />}>
              {viewMode === 'list' ? (
                <AnimalTable
                  animals={processedAnimals}
                  onEdit={setSelectedAnimal}
                  onDelete={handleDeleteAnimal}
                  isDeleting={isDeleting}
                />
              ) : (
                <AnimalCardGrid
                  animals={processedAnimals}
                  onEdit={setSelectedAnimal}
                  onDelete={handleDeleteAnimal}
                  isDeleting={isDeleting}
                />
              )}
            </Suspense>
          )}
          
          {!loading && processedAnimals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No animals found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-white border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-white border-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Animal Modal */}
      {isAddAnimalOpen && (
        <AddAnimalForm
          onAddAnimal={handleAddAnimal}
          isAddAnimalOpen={isAddAnimalOpen}
          setIsAddAnimalOpen={setIsAddAnimalOpen}
          animalToEdit={selectedAnimal}
        />
      )}
    </div>
  );
};

export default AnimalsPage;
