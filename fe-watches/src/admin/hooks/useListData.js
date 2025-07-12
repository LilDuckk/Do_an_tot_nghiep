import { useState, useCallback, useEffect } from 'react';
import { useAccessControl } from './useAccessControl';
import { useApiCall } from './useApiCall';
import { useSearchAndFilter } from './useSearchAndFilter';
import { usePagination } from './usePagination';

/**
 * Hook tích hợp cho các trang danh sách
 * @param {object} options - Các tùy chọn
 * @param {string} options.module - Tên module để kiểm tra quyền
 * @param {string} options.action - Hành động cần kiểm tra (view, create, edit, delete)
 * @param {string} options.apiEndpoint - API endpoint
 * @param {object} options.initialFilters - Filters ban đầu
 * @param {number} options.pageSize - Số item mỗi trang
 * @param {number} options.debounceDelay - Delay cho debounce search
 * @param {function} options.onError - Callback xử lý lỗi
 * @returns {object} - Các state và function để quản lý danh sách
 */
export const useListData = ({
  module = null,
  action = 'view',
  apiEndpoint = '',
  initialFilters = {},
  pageSize = 20,
  debounceDelay = 500,
  onError = null
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hook quản lý quyền truy cập
  const { hasAccess, showAccessError } = useAccessControl(module, action);

  // Hook quản lý API calls
  const { get } = useApiCall();

  // Hook quản lý search và filter
  const {
    searchText,
    setSearchText,
    debouncedSearchText,
    currentPage,
    setCurrentPage,
    buildQueryParams,
    filters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters
  } = useSearchAndFilter(initialFilters, debounceDelay);

  // Hook quản lý pagination
  const {
    totalPages,
    total,
    hasNext,
    hasPrevious,
    parseApiResponse
  } = usePagination(pageSize, currentPage);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!hasAccess || !apiEndpoint) return;

    setIsLoading(true);
    
    try {
      const params = buildQueryParams({
        page_size: pageSize
      });

      const result = await get(
        apiEndpoint,
        params,
        `Lỗi khi tải danh sách ${module || 'dữ liệu'}`
      );

      if (result.success) {
        const responseData = result.data;
        const results = responseData.results || [];
        setData(results);
        
        // Parse API response để cập nhật pagination
        parseApiResponse(responseData, pageSize);
      } else {
        setData([]);
        parseApiResponse(null, pageSize);
        
        // Kiểm tra lỗi quyền truy cập
        if (result.error && result.error.message?.includes('quyền')) {
          showAccessError(result.error.message);
        }

        // Gọi callback lỗi nếu có
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      setData([]);
      parseApiResponse(null, pageSize);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    hasAccess, 
    apiEndpoint, 
    debouncedSearchText, 
    currentPage, 
    get, 
    buildQueryParams, 
    parseApiResponse, 
    showAccessError, 
    pageSize, 
    onError
  ]);

  // Fetch data khi dependencies thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Clear search và reset về trang 1
  const clearSearch = useCallback(() => {
    setSearchText('');
    setCurrentPage(1);
  }, [setSearchText, setCurrentPage]);

  return {
    // Data states
    data,
    setData,
    isLoading,
    
    // Access control
    hasAccess,
    showAccessError,
    
    // Search and filter
    searchText,
    setSearchText,
    debouncedSearchText,
    buildQueryParams,
    filters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    hasNext,
    hasPrevious,
    
    // Functions
    fetchData,
    refreshData,
    clearSearch
  };
}; 