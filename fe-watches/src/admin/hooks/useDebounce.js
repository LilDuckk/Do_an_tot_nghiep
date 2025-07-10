import { useState, useEffect, useCallback } from 'react';

// Hook debounce cơ bản cho value
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook debounce search với pagination reset
export function useDebounceSearch(searchText, delay = 500) {
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText, delay]);

  // Reset page khi search text thay đổi (chỉ khi search text thực sự thay đổi)
  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      setCurrentPage(1);
    }
  }, [debouncedSearchText, searchText]);

  // Memoize setCurrentPage để tránh re-render không cần thiết
  const setCurrentPageMemo = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  return {
    debouncedSearchText,
    currentPage,
    setCurrentPage: setCurrentPageMemo
  };
} 