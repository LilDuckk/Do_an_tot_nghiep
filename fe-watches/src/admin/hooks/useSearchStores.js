import React from 'react';
import { useState, useCallback } from 'react';
import { STORE_ENDPOINTS } from '@/config/api';
import axios from 'axios';
import { useDebounce } from './useDebounce';

export function useSearchStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const fetchStores = useCallback(async (query) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(STORE_ENDPOINTS.STORES, {
        params: query ? { search: query } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStores(res.data.results || []);
    } catch (e) {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động fetch khi debouncedSearch thay đổi
  React.useEffect(() => {
    fetchStores(debouncedSearch);
  }, [debouncedSearch, fetchStores]);

  return {
    stores,
    loading,
    searchText,
    setSearchText,
    fetchStores,
  };
} 