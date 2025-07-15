import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONTENT_ENDPOINTS } from '@/config/api';

const BannerContext = createContext();

export const useBannerContext = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBannerContext must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider = ({ children }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(CONTENT_ENDPOINTS.BANNERS_ALL);
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        const data = await response.json();
        setBanners(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('BannerContext: Error fetching banners:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const value = {
    banners,
    loading,
    error
  };

  return (
    <BannerContext.Provider value={value}>
      {children}
    </BannerContext.Provider>
  );
}; 