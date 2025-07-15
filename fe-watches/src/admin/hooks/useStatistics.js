import { useState, useCallback, useEffect, useRef } from 'react';

export default function useStatistics(endpoint, defaultData = {}) {
  const [statistics, setStatistics] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const defaultDataRef = useRef(defaultData);

  // Cập nhật defaultDataRef khi defaultData thay đổi
  useEffect(() => {
    defaultDataRef.current = defaultData;
  }, [defaultData]);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        setStatistics(defaultDataRef.current);
      }
    } catch (error) {
      setStatistics(defaultDataRef.current);
    } finally {
      setLoading(false);
    }
  }, [endpoint]); // Chỉ phụ thuộc vào endpoint

  // Tự động fetch khi component mount hoặc endpoint thay đổi
  useEffect(() => {
    fetchStatistics();
  }, [endpoint]); // Chỉ phụ thuộc vào endpoint, không phụ thuộc vào fetchStatistics

  return { statistics, fetchStatistics, loading };
} 