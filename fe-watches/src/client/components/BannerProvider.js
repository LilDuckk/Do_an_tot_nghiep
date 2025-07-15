import React, { useEffect } from 'react';
import { useSharedData } from '../hooks/useSharedData';

export default function BannerProvider({ children }) {
  const { fetchBanners, data, loading, error } = useSharedData();

  // Fetch banners một lần duy nhất khi provider mount
  useEffect(() => {
    fetchBanners().catch(err => {
      console.error('BannerProvider: Error fetching banners:', err);
    });
  }, [fetchBanners]);

  // Đảm bảo dữ liệu đã sẵn sàng trước khi render children
  if (loading.banners) {
    return <div>Đang tải banners...</div>;
  }

  if (error.banners) {
    return <div>Lỗi tải banners: {error.banners}</div>;
  }

  return <>{children}</>;
} 