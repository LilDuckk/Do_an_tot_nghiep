/**
 * Hook quản lý unassigned orders
 * 
 * Yêu cầu:
 * - Quản lý state unassigned orders, loading, count
 * - Fetch unassigned orders từ API
 * - Tránh infinite loop
 * - Tối ưu performance với useCallback
 */

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { ORDER_ENDPOINTS } from '@/config/api';
import { apiCall, handleApiError } from '../utils';

export default function useUnassignedOrders() {
  // State management
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [unassignedOrdersCount, setUnassignedOrdersCount] = useState(0);
  const [unassignedOrdersLoading, setUnassignedOrdersLoading] = useState(false);

  // Fetch unassigned orders
  const fetchUnassignedOrders = useCallback(async () => {
    try {
      setUnassignedOrdersLoading(true);
      const response = await apiCall(ORDER_ENDPOINTS.UNASSIGNED_ORDERS);

      if (response.success && response.data) {
        // Xử lý cấu trúc dữ liệu nested
        if (response.data.results && response.data.results.success) {
          setUnassignedOrders(response.data.results.data || []);
          setUnassignedOrdersCount(response.data.count || 0);
        } else {
          // Fallback cho cấu trúc cũ
          setUnassignedOrders(response.data.data || []);
          setUnassignedOrdersCount(response.data.count || 0);
        }
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách đơn hàng chưa gán cửa hàng');
        setUnassignedOrders([]);
        setUnassignedOrdersCount(0);
      }
    } catch (error) {
      handleApiError(error, 'Lỗi khi tải danh sách đơn hàng chưa gán cửa hàng');
      setUnassignedOrders([]);
      setUnassignedOrdersCount(0);
    } finally {
      setUnassignedOrdersLoading(false);
    }
  }, []);

  return {
    unassignedOrders,
    setUnassignedOrders,
    unassignedOrdersCount,
    setUnassignedOrdersCount,
    unassignedOrdersLoading,
    setUnassignedOrdersLoading,
    fetchUnassignedOrders
  };
} 