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
      if (selectedAnimal) {
        await animalServices.updateAnimal(selectedAnimal.id, newAnimal);
        toast.success('Animal updated successfully');
      } else {
        await animalServices.addAnimal(newAnimal);
        toast.success('Animal added successfully');
      }
      animalsCache.clear();
      setSelectedAnimal(null);
      setIsAddAnimalOpen(false);
      fetchAnimals(1, searchTerm);
    } catch (error) {
      console.error('Error saving animal:', error);
      toast.error('Failed to save animal');
    }
  }, [selectedAnimal, searchTerm, fetchAnimals, toast]);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    const animalToDelete = animals.find(a => a.id === id);
    if (!animalToDelete) {
      toast.error('Animal not found');
      return;
    }

    if (window.confirm(`Are you sure you want to delete this animal?\n\nID: ${animalToDelete.id}\nType: ${animalToDelete.type}\nBreed: ${animalToDelete.breed}\n\nThis action cannot be undone.`)) {
      try {
        setIsDeleting(id);
        await animalServices.deleteAnimal(id);
        animalsCache.clear();
        toast.success('Animal deleted successfully');
        fetchAnimals(1, searchTerm);
      } catch (error) {
        console.error('Error deleting animal:', error);
        toast.error(`Failed to delete animal: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
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

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Animals</h2>

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

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search animals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading && currentPage === 1 ? (
            <LoadingSkeleton />
          ) : (
            <div 
              className="mt-8" 
              style={{ height: '600px', overflow: 'auto' }}
              onScroll={handleScroll}
            >
              <Suspense fallback={<LoadingSkeleton />}>
                {viewMode === 'card' ? (
                  <AnimalCardGrid
                    animals={processedAnimals}
                    onEdit={handleEditAnimal}
                    onDelete={handleDeleteAnimal}
                    isDeleting={isDeleting}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <AnimalTable 
                      animals={processedAnimals} 
                      onEdit={handleEditAnimal}
                      onDelete={handleDeleteAnimal}
                      isDeleting={isDeleting}
                    />
                  </div>
                )}
              </Suspense>
              {loading && currentPage > 1 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-farm-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {isAddAnimalOpen && (
        <Suspense fallback={<LoadingSkeleton />}>
          <AddAnimalForm
            animalToEdit={selectedAnimal}
            onAddAnimal={handleAddAnimal}
            onClose={() => {
              setIsAddAnimalOpen(false);
              setSelectedAnimal(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AnimalsPage;
