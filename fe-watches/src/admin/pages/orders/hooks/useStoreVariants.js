/**
 * Hook quản lý store variants
 * 
 * Yêu cầu:
 * - Lấy variants theo store_id từ API STORE_VARIANTS
 * - Hỗ trợ filter theo product, search, in_stock_only
 * - Cache kết quả để tối ưu performance
 * - Xử lý error và loading states
 */

import { useState, useCallback, useRef } from 'react';
import { INVENTORY_ENDPOINTS } from '@/config/api';
import { apiCall } from '../utils';

export default function useStoreVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache để tránh gọi API trùng lặp
  const cache = useRef(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 phút

  // Fetch store variants
  const fetchStoreVariants = useCallback(async (params = {}) => {
    const {
      store_id,
      product_id = null,
      search = '',
      in_stock_only = true,
      ordering = 'product_variant__product__name'
    } = params;

    if (!store_id) {
      setVariants([]);
      setError('Store ID is required');
      return;
    }

    // Tạo cache key
    const cacheKey = JSON.stringify({ store_id, product_id, search, in_stock_only, ordering });
    
    // Kiểm tra cache
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      setVariants(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        store_id: store_id.toString(),
        in_stock_only: in_stock_only.toString(),
        ordering: ordering
      });

      if (search) {
        queryParams.append('search', search);
      }

      const result = await apiCall(`${INVENTORY_ENDPOINTS.STORE_VARIANTS}?${queryParams}`);

      if (result.success && result.data) {
        let storeVariants = result.data.variants || [];

        // Filter theo product_id nếu có
        if (product_id) {
          storeVariants = storeVariants.filter(variant => 
            variant.product === product_id || variant.product_id === product_id
          );
        }

        // Cache kết quả
        cache.current.set(cacheKey, {
          data: storeVariants,
          timestamp: Date.now()
        });

        setVariants(storeVariants);
      } else {
        setVariants([]);
        setError(result.message || 'Failed to fetch store variants');
      }
    } catch (error) {
      setVariants([]);
      setError('Error fetching store variants');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Get variants for specific product in store
  const getProductVariants = useCallback(async (store_id, product_id) => {
    return fetchStoreVariants({ store_id, product_id });
  }, [fetchStoreVariants]);

  // Search variants in store
  const searchStoreVariants = useCallback(async (store_id, search) => {
    return fetchStoreVariants({ store_id, search });
  }, [fetchStoreVariants]);

  return {
    variants,
    loading,
    error,
    setVariants,
    fetchStoreVariants,
    getProductVariants,
    searchStoreVariants,
    clearCache
  };
} 