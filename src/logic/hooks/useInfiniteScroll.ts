import { useState, useEffect, useCallback, useRef } from 'react';

export function useInfiniteScroll<T>(
  fetchData: (page: number, signal?: AbortSignal) => Promise<T[]>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMore = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    setLoading(true);
    setError(null);
    
    const currentPage = isInitial ? 0 : page;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const newData = await fetchData(currentPage, abortControllerRef.current.signal);
      
      if (newData.length === 0) {
        setHasMore(false);
        if (isInitial) setData([]);
      } else {
        setData(prev => isInitial ? newData : [...prev, ...newData]);
        setPage(currentPage + 1);
        setHasMore(true); // Default assume true, if it returns exactly limit, maybe more
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchData, hasMore, loading, page]);

  // Initial load
  useEffect(() => {
    loadMore(true);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, hasMore, error, loadMore, setData };
}
