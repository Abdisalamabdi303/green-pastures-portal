
import { useState, useCallback, useRef } from 'react';

export const useTablePagination = (itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    lastDocRef.current = null;
  }, []);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const updateCursor = useCallback((lastDoc: any) => {
    lastDocRef.current = lastDoc;
  }, []);

  const updateHasMore = useCallback((hasMoreData: boolean) => {
    setHasMore(hasMoreData);
  }, []);

  return {
    currentPage,
    hasMore,
    lastDoc: lastDocRef.current,
    resetPagination,
    nextPage,
    updateCursor,
    updateHasMore
  };
};
