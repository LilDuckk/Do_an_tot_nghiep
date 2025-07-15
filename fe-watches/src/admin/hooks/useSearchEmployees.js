import React from 'react';
import { useState, useCallback } from 'react';
import { EMPLOYEE_ENDPOINTS } from '@/config/api';
import axios from 'axios';
import { useDebounce } from './useDebounce';

export function useSearchEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const fetchEmployees = useCallback(async (query) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(EMPLOYEE_ENDPOINTS.EMPLOYEES, {
        params: query ? { search: query } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(res.data.results || []);
    } catch (e) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động fetch khi debouncedSearch thay đổi
  React.useEffect(() => {
    fetchEmployees(debouncedSearch);
  }, [debouncedSearch, fetchEmployees]);

  return {
    employees,
    loading,
    searchText,
    setSearchText,
    fetchEmployees,
  };
} 