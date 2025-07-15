/**
 * Hook quản lý modal đơn hàng
 * 
 * Yêu cầu:
 * - Quản lý state modal visible, loading, form data
 * - Xử lý form validation với Ant Design Form
 * - Tích hợp với useCRUD cho create/update
 * - Xử lý upload file (nếu có)
 * - Reset form khi đóng modal
 * - Xử lý error và success messages
 * - Tối ưu performance với useCallback
 * - Tích hợp với useOrderData để refresh list
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { ORDER_ENDPOINTS, CUSTOMER_ENDPOINTS, STORE_ENDPOINTS, EMPLOYEE_ENDPOINTS } from '@/config/api';
import { apiCall, handleApiError, formatOrderData, extractErrorMessage } from '../utils';

export default function useOrderModal(refreshOrders, userInfo) {
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form reference
  const [form] = Form.useForm();
  const formRef = useRef(form);

  // Customer search states
  const [customers, setCustomers] = useState([]);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

  // Store and employee states
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Order details states
  const [orderDetails, setOrderDetails] = useState([]);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      console.log('Fetching stores...');
      const result = await apiCall(STORE_ENDPOINTS.STORES_LIST_ALL);
      
      if (result.success && result.data) {
        const storesData = Array.isArray(result.data) ? result.data : [];
        console.log('Stores loaded:', storesData.length);
        setStores(storesData);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const result = await apiCall(STORE_ENDPOINTS.EMPLOYEES_LIST_ALL);
      
      if (result.success && result.data) {
        const employeesData = Array.isArray(result.data) ? result.data : [];
        setEmployees(employeesData);
      } else {
        console.error('📋 Failed to fetch employees:', result);
      }
    } catch (error) {
      console.error('📋 Error fetching employees:', error);
    }
  }, []);

  // Filter employees by store using API
  const filterEmployeesByStore = useCallback(async (storeId) => {
    if (!storeId) {
      console.log('No storeId provided, clearing filtered employees');
      setFilteredEmployees([]);
      return;
    }
    try {
      console.log('Filtering employees for store:', storeId);
      const apiUrl = `${STORE_ENDPOINTS.EMPLOYEES_LIST_ALL}?store=${storeId}`;
      
      const result = await apiCall(apiUrl);
      
      if (result.success && result.data) {
        const filteredEmployeesData = Array.isArray(result.data) ? result.data : [];
        console.log('Filtered employees loaded:', filteredEmployeesData.length);
        setFilteredEmployees(filteredEmployeesData);
      } else {
        console.log('No employees found for store');
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('🔍 Error filtering employees:', error);
      setFilteredEmployees([]);
    }
  }, []);

  // Open modal for create
  const openCreateModal = useCallback(async () => {
    setEditingId(null);
    setModalVisible(true);
    form.resetFields();
    setOrderDetails([]);
    setFilteredEmployees([]); // Reset filteredEmployees khi tạo mới
    // KHÔNG reset customers và customerSearchText ở đây
    // setCustomers([]); 
    // setCustomerSearchText(''); 
    
    // Load initial data first
    await Promise.all([
      fetchStores(),
      fetchEmployees()
    ]);
    
    // Set default values for non-super users
    if (userInfo && !userInfo.isSuperUser) {
      form.setFieldsValue({
        employee: userInfo.userEmployeeId,
        store: userInfo.userStoreId
      });
      // Filter employees for the user's store
      if (userInfo.userStoreId) {
        await filterEmployeesByStore(userInfo.userStoreId);
      }
    }
  }, [form, userInfo, fetchStores, fetchEmployees, filterEmployeesByStore]);

  // Open modal for edit
  const openEditModal = useCallback(async (record) => {
    try {
      setModalLoading(true);
      setEditingId(record.id);
      setModalVisible(true);
      setFilteredEmployees([]); // Reset filteredEmployees khi edit
      // KHÔNG reset customers và customerSearchText ở đây
      // setCustomers([]); 
      // setCustomerSearchText(''); 
      
      // Load initial data first
      await Promise.all([
        fetchStores(),
        fetchEmployees()
      ]);
      
      // Fetch order details
      const response = await apiCall(`${ORDER_ENDPOINTS.ORDERS}${record.id}/`);
      
      if (response.success && response.data) {
        const orderData = response.data;
        
        // Set form values
        form.setFieldsValue({
          customer: orderData.customer,
          store: orderData.store,
          employee: orderData.employee_id || null,
          order_date: orderData.order_date ? dayjs(orderData.order_date) : null,
          status: orderData.status,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          shipping_address: orderData.shipping_address,
          shipping_method: orderData.shipping_method,
          tracking_number: orderData.tracking_number,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping_fee: orderData.shipping_fee,
          discount: orderData.discount,
          total_amount: orderData.total_amount,
          note: orderData.note,
          is_online_order: orderData.is_online_order
        });

        // Filter employees by store if store is selected
        if (orderData.store) {
          await filterEmployeesByStore(orderData.store);
        }
      } else {
        const errorMessage = extractErrorMessage(response);
        message.error(errorMessage);
      }
    } catch (error) {
      handleApiError(error, 'Có lỗi xảy ra khi tải thông tin đơn hàng');
    } finally {
      setModalLoading(false);
    }
  }, [form, fetchStores, fetchEmployees, filterEmployeesByStore]);

  // Close modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingId(null);
    setModalLoading(false);
    form.resetFields();
    setOrderDetails([]);
    setCustomerSearchText('');
    setCustomers([]);
    setFilteredEmployees([]); // Reset filteredEmployees khi đóng modal
  }, [form]);

  // Handle form submit
  const handleSubmit = useCallback(async (values) => {
    try {
      setModalLoading(true);
      
      const formattedValues = formatOrderData(values, orderDetails, userInfo);
      
      if (editingId) {
        // Update order
        const response = await apiCall(`${ORDER_ENDPOINTS.ORDERS}${editingId}/`, {
          method: 'PUT',
          body: JSON.stringify(formattedValues)
        });
        
        if (response.success) {
          message.success('Cập nhật đơn hàng thành công');
          closeModal();
          refreshOrders();
        } else {
          const errorMessage = extractErrorMessage(response);
          message.error(errorMessage);
        }
      } else {
        // Create order
        const response = await apiCall(ORDER_ENDPOINTS.ORDERS, {
          method: 'POST',
          body: JSON.stringify(formattedValues)
        });
        
        if (response.success) {
          message.success('Tạo đơn hàng thành công');
          closeModal();
          refreshOrders();
        } else {
          const errorMessage = extractErrorMessage(response);
          message.error(errorMessage);
        }
      }
    } catch (error) {
      handleApiError(error, 'Có lỗi xảy ra khi lưu đơn hàng');
    } finally {
      setModalLoading(false);
    }
  }, [editingId, orderDetails, userInfo, closeModal, refreshOrders]);

  // Search customers
  const searchCustomers = useCallback(async (searchText) => {
    if (!searchText) {
      console.log('Search text is empty, keeping current customers list');
      // Không reset customers khi search text rỗng
      return;
    }
    
    try {
      console.log('Searching customers with:', searchText);
      setCustomerSearchLoading(true);
      const queryParams = new URLSearchParams({ search: searchText });
      const result = await apiCall(`${CUSTOMER_ENDPOINTS.CUSTOMERS}?${queryParams}`);
      
      if (result.success && result.data) {
        const customersData = Array.isArray(result.data.results) ? result.data.results : [];
        console.log('Customers found:', customersData.length);
        setCustomers(customersData);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setCustomerSearchLoading(false);
    }
  }, []);

  // Load initial customers when modal opens
  useEffect(() => {
    if (modalVisible && !customerSearchText && customers.length === 0) {
      // Load all customers initially only if customers list is empty
      const loadInitialCustomers = async () => {
        try {
          console.log('Loading initial customers...');
          setCustomerSearchLoading(true);
          const result = await apiCall(CUSTOMER_ENDPOINTS.CUSTOMERS);
          
          if (result.success && result.data) {
            const customersData = Array.isArray(result.data.results) ? result.data.results : [];
            console.log('Initial customers loaded:', customersData.length);
            setCustomers(customersData);
          }
        } catch (error) {
          console.error('Error loading initial customers:', error);
        } finally {
          setCustomerSearchLoading(false);
        }
      };
      
      loadInitialCustomers();
    }
  }, [modalVisible, customerSearchText, customers.length]);

  return {
    // Modal states
    modalVisible,
    modalLoading,
    editingId,
    
    // Form
    form,
    formRef,
    
    // Customer search
    customers,
    customerSearchText,
    customerSearchLoading,
    setCustomerSearchText,
    searchCustomers,
    
    // Store and employee
    stores,
    employees,
    filteredEmployees,
    setFilteredEmployees,
    fetchStores,
    fetchEmployees,
    filterEmployeesByStore,
    
    // Order details
    orderDetails,
    setOrderDetails,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit
  };
} 