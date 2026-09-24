import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { productService } from '../services/productService';

/**
 * Custom hook to manage product list fetching, pagination, race condition prevention,
 * and loading/error states without React Query or third-party libraries.
 */
export function useProducts({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  sortBy = '',
  order = 'asc',
  delay = 0,
}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCombinedFilter, setIsCombinedFilter] = useState(false);

  // Reference to abort previous in-flight requests (prevents race conditions)
  const abortControllerRef = useRef(null);
  // Monotonically increasing request ID counter
  const requestIdRef = useRef(0);

  const fetchProductsData = useCallback(async () => {
    // 1. Abort any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Create new controller and increment request token
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const result = await productService.fetchProducts({
        page,
        limit,
        search,
        category,
        sortBy,
        order,
        delay,
        signal: controller.signal,
      });

      // 3. Ensure only the latest initiated request sets the state
      if (currentRequestId === requestIdRef.current) {
        setProducts(result.products || []);
        setTotal(result.total || 0);
        setIsCombinedFilter(Boolean(result.isCombinedFilter));
        setIsLoading(false);
      }
    } catch (err) {
      // Ignore cancelled request errors
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        return;
      }

      if (currentRequestId === requestIdRef.current) {
        console.error('Error fetching products:', err);
        setError(err.userMessage || 'Failed to load products. Please check your connection and retry.');
        setIsLoading(false);
      }
    }
  }, [page, limit, search, category, sortBy, order, delay]);

  useEffect(() => {
    fetchProductsData();

    return () => {
      // Abort in-flight request when component unmounts or query changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProductsData]);

  return {
    products,
    total,
    isLoading,
    error,
    isCombinedFilter,
    refetch: fetchProductsData,
  };
}
