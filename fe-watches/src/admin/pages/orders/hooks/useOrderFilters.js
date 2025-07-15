import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useDebounce } from '@/admin/hooks/useDebounce';

export default function useOrderFilters() {
  // Search & filter states
  const [filterType, setFilterType] = useState('customer_first_name');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(undefined);
  const [shippingMethodFilter, setShippingMethodFilter] = useState(undefined);
  const [isOnlineOrderFilter, setIsOnlineOrderFilter] = useState(undefined);
  const [totalAmountMin, setTotalAmountMin] = useState('');
  const [totalAmountMax, setTotalAmountMax] = useState('');
  const [storeFilter, setStoreFilter] = useState(undefined);
  const [employeeFilter, setEmployeeFilter] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search text để tối ưu API calls
  const debouncedSearchText = useDebounce(searchText, 500);

  // Hàm build params cho API (không bao gồm pagination)
  const buildOrderQueryParams = useCallback(() => {
    const paramsObj = {};
    if (debouncedSearchText && debouncedSearchText.trim()) {
      paramsObj[filterType] = debouncedSearchText.trim();
    }
    if (dateRange && dateRange.length === 2) {
      paramsObj.order_date_from = dateRange[0].format('YYYY-MM-DDTHH:mm:ss[Z]');
      paramsObj.order_date_to = dateRange[1].format('YYYY-MM-DDTHH:mm:ss[Z]');
    }
    if (statusFilter) paramsObj.status = statusFilter;
    if (paymentMethodFilter) paramsObj.payment_method = paymentMethodFilter;
    if (paymentStatusFilter) paramsObj.payment_status = paymentStatusFilter;
    if (shippingMethodFilter) paramsObj.shipping_method = shippingMethodFilter;
    if (isOnlineOrderFilter !== undefined && isOnlineOrderFilter !== '') paramsObj.is_online_order = isOnlineOrderFilter;
    if (totalAmountMin) paramsObj.total_amount_min = totalAmountMin;
    if (totalAmountMax) paramsObj.total_amount_max = totalAmountMax;
    if (storeFilter) paramsObj.store = storeFilter;
    if (employeeFilter) paramsObj.employee = employeeFilter;
    return paramsObj;
  }, [debouncedSearchText, filterType, dateRange, statusFilter, paymentMethodFilter, paymentStatusFilter, shippingMethodFilter, isOnlineOrderFilter, totalAmountMin, totalAmountMax, storeFilter, employeeFilter]);

  // Hàm clear/reset filter
  const clearOrderFilters = useCallback(() => {
    setSearchText('');
    setDateRange(null);
    setStatusFilter(undefined);
    setPaymentMethodFilter(undefined);
    setPaymentStatusFilter(undefined);
    setShippingMethodFilter(undefined);
    setIsOnlineOrderFilter(undefined);
    setTotalAmountMin('');
    setTotalAmountMax('');
    setStoreFilter(undefined);
    setEmployeeFilter(undefined);
    setFilterType('customer_first_name');
  }, []);

  return {
    filterType, setFilterType,
    searchText, setSearchText,
    debouncedSearchText, // Thêm debouncedSearchText để component có thể sử dụng
    dateRange, setDateRange,
    statusFilter, setStatusFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    paymentStatusFilter, setPaymentStatusFilter,
    shippingMethodFilter, setShippingMethodFilter,
    isOnlineOrderFilter, setIsOnlineOrderFilter,
    totalAmountMin, setTotalAmountMin,
    totalAmountMax, setTotalAmountMax,
    storeFilter, setStoreFilter,
    employeeFilter, setEmployeeFilter,
    showFilters, setShowFilters,
    buildOrderQueryParams,
    clearOrderFilters
  };
} 