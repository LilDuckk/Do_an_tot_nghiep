import { useState, useCallback } from 'react';
import { useDebounceSearch } from './useDebounce';

/**
 * Hook quản lý tìm kiếm và lọc dữ liệu
 * @param {object} initialFilters - Filters ban đầu
 * @param {number} debounceDelay - Delay cho debounce (ms)
 * @returns {object} - Các state và function để quản lý search và filter
 */
export const useSearchAndFilter = (initialFilters = {}, debounceDelay = 500) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Sử dụng useDebounceSearch hiện tại
  const { debouncedSearchText, currentPage, setCurrentPage } = useDebounceSearch(searchText, debounceDelay);

  /**
   * Thay đổi search text
   * @param {string} value - Giá trị search mới
   */
  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
  }, []);

  /**
   * Thay đổi filter
   * @param {string} key - Key của filter
   * @param {any} value - Giá trị filter mới
   */
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [setCurrentPage]);

  /**
   * Thay đổi nhiều filters cùng lúc
   * @param {object} newFilters - Object chứa các filter mới
   */
  const handleMultipleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  /**
   * Xóa tất cả filters và search
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchText('');
    setCurrentPage(1);
  }, [initialFilters, setCurrentPage]);

  /**
   * Xóa một filter cụ thể
   * @param {string} key - Key của filter cần xóa
   */
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  }, [setCurrentPage]);

  /**
   * Ẩn/hiện filter panel
   */
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  /**
   * Reset về trạng thái ban đầu
   */
  const reset = useCallback(() => {
    setSearchText('');
    setFilters(initialFilters);
    setShowFilters(false);
    setCurrentPage(1);
  }, [initialFilters, setCurrentPage]);

  /**
   * Tạo query parameters cho API call
   * @param {object} additionalParams - Parameters bổ sung
   * @returns {object} - Object chứa tất cả parameters
   */
  const buildQueryParams = useCallback((additionalParams = {}) => {
    const params = {
      page: currentPage,
      ...additionalParams
    };

    // Thêm search text nếu có
    if (debouncedSearchText && debouncedSearchText.trim()) {
      params.search = debouncedSearchText.trim();
    }

    // Thêm filters nếu có
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          // Xử lý array values (ví dụ: date range)
          if (value.length === 2 && value[0] && value[1]) {
            params[`${key}_from`] = value[0].format ? value[0].format('YYYY-MM-DD') : value[0];
            params[`${key}_to`] = value[1].format ? value[1].format('YYYY-MM-DD') : value[1];
          } else {
            params[key] = value;
          }
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }, [currentPage, debouncedSearchText, filters]);

  /**
   * Kiểm tra có filter nào đang active không
   */
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => 
      value !== null && value !== undefined && value !== '' && 
      (!Array.isArray(value) || value.length > 0)
    );
  }, [filters]);

  /**
   * Kiểm tra có search text không
   */
  const hasSearchText = useCallback(() => {
    return searchText && searchText.trim() !== '';
  }, [searchText]);

  /**
   * Kiểm tra có search hoặc filter nào active không
   */
  const hasAnySearchOrFilter = useCallback(() => {
    return hasSearchText() || hasActiveFilters();
  }, [hasSearchText, hasActiveFilters]);

  return {
    // Search states
    searchText,
    setSearchText,
    debouncedSearchText,
    
    // Filter states
    filters,
    setFilters,
    showFilters,
    
    // Pagination (từ useDebounceSearch)
    currentPage,
    setCurrentPage,
    
    // Search functions
    handleSearchChange,
    
    // Filter functions
    handleFilterChange,
    handleMultipleFilterChange,
    clearFilters,
    clearFilter,
    toggleFilters,
    
    // Utility functions
    reset,
    buildQueryParams,
    
    // Computed values
    hasActiveFilters: hasActiveFilters(),
    hasSearchText: hasSearchText(),
    hasAnySearchOrFilter: hasAnySearchOrFilter()
  };
}; 