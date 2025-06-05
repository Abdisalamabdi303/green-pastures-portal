
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimalsPaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const AnimalsPagination = ({
  currentPage,
  totalPages,
  loading,
  onPageChange
}: AnimalsPaginationProps) => {
  if (loading || totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-center items-center gap-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="bg-white border-gray-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AnimalsPagination;
