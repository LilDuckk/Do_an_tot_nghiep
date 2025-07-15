/**
 * Hook quản lý dữ liệu đơn hàng
 * 
 * Yêu cầu:
 * - Quản lý state orders, loading, error
 * - Xử lý pagination cho danh sách đơn hàng
 * - Tích hợp với useOrderFilters để lọc dữ liệu
 * - Xử lý refresh data khi filter thay đổi
 * - Tránh infinite loop khi gọi API
 * - Tối ưu performance với useCallback, useMemo
 * - Xử lý error handling và loading states
 * - Tích hợp với useCRUD cho các thao tác CRUD
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { message } from 'antd';
import { ORDER_ENDPOINTS } from '@/config/api';
import { apiCall, buildQueryParams, handleApiError } from '../utils';

export default function useOrderData(orderFilters, hasAccess) {
  // State management
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Ref để tránh infinite loop
  const isInitialized = useRef(false);
  const lastFetchParams = useRef({});

  // Memoize filter params để tránh re-render không cần thiết
  const filterParams = useMemo(() => {
    if (!orderFilters) return {};
    
    return {
      search: orderFilters.debouncedSearchText,
      dateRange: orderFilters.dateRange,
      status: orderFilters.statusFilter,
      paymentMethod: orderFilters.paymentMethodFilter,
      paymentStatus: orderFilters.paymentStatusFilter,
      shippingMethod: orderFilters.shippingMethodFilter,
      isOnlineOrder: orderFilters.isOnlineOrderFilter,
      totalAmountMin: orderFilters.totalAmountMin,
      totalAmountMax: orderFilters.totalAmountMax,
      store: orderFilters.storeFilter,
      employee: orderFilters.employeeFilter
    };
  }, [
    orderFilters?.debouncedSearchText,
    orderFilters?.dateRange,
    orderFilters?.statusFilter,
    orderFilters?.paymentMethodFilter,
    orderFilters?.paymentStatusFilter,
    orderFilters?.shippingMethodFilter,
    orderFilters?.isOnlineOrderFilter,
    orderFilters?.totalAmountMin,
    orderFilters?.totalAmountMax,
    orderFilters?.storeFilter,
    orderFilters?.employeeFilter
  ]);

  // Custom fetch orders function
  const fetchOrders = useCallback(async (params = {}) => {
    if (!hasAccess) return;
    
    try {
      setOrdersLoading(true);
      setError(null);
      
      const paramsObj = { ...filterParams, ...params };
      const queryParams = buildQueryParams(paramsObj);
      
      const result = await apiCall(`${ORDER_ENDPOINTS.ORDERS}?${queryParams}`);
      
      if (result.success && result.data) {
        const ordersData = Array.isArray(result.data.results) ? result.data.results : [];
        const count = result.data.count || 0;
        
        setOrders(ordersData);
        setTotal(count);
        
        // Lưu params để so sánh
        lastFetchParams.current = paramsObj;
      } else {
        setError('Lỗi khi tải dữ liệu đơn hàng');
        message.error('Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Lỗi khi tải danh sách đơn hàng');
      setError(errorMessage);
    } finally {
      setOrdersLoading(false);
    }
  }, [hasAccess, filterParams]);

  // Refresh orders
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch orders when filters change
  useEffect(() => {
    if (!hasAccess || !orderFilters) return;
    
    // Kiểm tra xem có cần fetch lại không
    const currentParams = JSON.stringify(filterParams);
    const lastParams = JSON.stringify(lastFetchParams.current);
    
    if (currentParams !== lastParams || !isInitialized.current) {
      fetchOrders();
      isInitialized.current = true;
    }
  }, [hasAccess, filterParams, fetchOrders]);

  // Reset page when filters change (but not page change)
  useEffect(() => {
    if (!orderFilters) return;
    
    const shouldResetPage = 
      (orderFilters.filterType !== lastFetchParams.current.filterType ||
       orderFilters.dateRange !== lastFetchParams.current.dateRange ||
       orderFilters.statusFilter !== lastFetchParams.current.status ||
       orderFilters.paymentMethodFilter !== lastFetchParams.current.paymentMethod ||
       orderFilters.paymentStatusFilter !== lastFetchParams.current.paymentStatus ||
       orderFilters.shippingMethodFilter !== lastFetchParams.current.shippingMethod ||
       orderFilters.isOnlineOrderFilter !== lastFetchParams.current.isOnlineOrder ||
       orderFilters.totalAmountMin !== lastFetchParams.current.totalAmountMin ||
       orderFilters.totalAmountMax !== lastFetchParams.current.totalAmountMax ||
       orderFilters.storeFilter !== lastFetchParams.current.store ||
       orderFilters.employeeFilter !== lastFetchParams.current.employee);

    if (shouldResetPage) {
      // Reset page sẽ được xử lý ở component cha (OrdersPage.js)
      // bằng cách gọi pagination.setCurrentPage(1)
    }
  }, [
    orderFilters?.filterType,
    orderFilters?.dateRange,
    orderFilters?.statusFilter,
    orderFilters?.paymentMethodFilter,
    orderFilters?.paymentStatusFilter,
    orderFilters?.shippingMethodFilter,
    orderFilters?.isOnlineOrderFilter,
    orderFilters?.totalAmountMin,
    orderFilters?.totalAmountMax,
    orderFilters?.storeFilter,
    orderFilters?.employeeFilter
  ]);

  return {
    orders,
    ordersLoading,
    total,
    error,
    fetchOrders,
    refreshOrders
  };
} 