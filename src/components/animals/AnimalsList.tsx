
import React, { Suspense, lazy, memo } from 'react';
import { Animal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components
const OptimizedAnimalTable = lazy(() => import('./OptimizedAnimalTable'));
const AnimalCardGrid = lazy(() => import('./AnimalCardGrid'));

const ITEMS_PER_PAGE = 20;

// Memoized loading skeleton component
const LoadingSkeleton = memo(() => (
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
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

interface AnimalsListProps {
  animals: Animal[];
  viewMode: 'card' | 'list';
  loading: boolean;
  loadingMore?: boolean;
  currentPage: number;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const AnimalsList = memo(({
  animals,
  viewMode,
  loading,
  loadingMore = false,
  currentPage,
  onEdit,
  onDelete,
  isDeleting,
  onScroll
}: AnimalsListProps) => {
  
  // Show initial loading state
  if (loading && currentPage === 1 && animals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      onScroll={onScroll}
      style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        {viewMode === 'list' ? (
          <OptimizedAnimalTable
            animals={animals}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
            loading={loading}
            loadingMore={loadingMore}
          />
        ) : (
          <AnimalCardGrid
            animals={animals}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        )}
      </Suspense>
      
      {!loading && !loadingMore && animals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No animals found</p>
        </div>
      )}
    </div>
  );
});

AnimalsList.displayName = 'AnimalsList';

export default AnimalsList;
