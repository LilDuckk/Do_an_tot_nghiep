/**
 * Hook quản lý các action đơn hàng
 * 
 * Yêu cầu:
 * - Xử lý các action: view, edit, delete, duplicate
 * - Tích hợp với useCRUD cho delete
 * - Xử lý confirm dialog cho delete
 * - Xử lý navigation cho view/edit
 * - Tối ưu performance với useCallback
 * - Xử lý error và success messages
 * - Tích hợp với useOrderData để refresh list
 * - Xử lý bulk actions (nếu có)
 */

import { useCallback } from 'react';
import { message } from 'antd';
import { ORDER_ENDPOINTS } from '@/config/api';
import { apiCall, handleApiError, extractErrorMessage } from '../utils';

export default function useOrderActions(refreshOrders) {
  // Handle order status changes
  const handleOrderStatusAction = useCallback(async (id, action) => {
    let url = '';
    let actionText = '';
    
    switch (action) {
      case 'process':
        url = ORDER_ENDPOINTS.ORDER_PROCESS(id);
        actionText = 'Chuyển sang đang xử lý';
        break;
      case 'ship':
        url = ORDER_ENDPOINTS.ORDER_SHIP(id);
        actionText = 'Chuyển sang đang giao hàng';
        break;
      case 'confirm':
        url = ORDER_ENDPOINTS.ORDER_CONFIRM(id);
        actionText = 'Xác nhận hoàn thành';
        break;
      case 'cancel':
        url = ORDER_ENDPOINTS.ORDER_CANCEL(id);
        actionText = 'Hủy đơn hàng';
        break;
      default:
        throw new Error('Action không hợp lệ');
    }

    const response = await apiCall(url, { method: 'POST' });
    
    if (response.success) {
      message.success(response.message || `${actionText} thành công!`);
      refreshOrders();
    } else {
      const errorMessage = extractErrorMessage(response);
      message.error(errorMessage);
    }
  }, [refreshOrders]);

  // Handle assign order to store
  const handleAssignOrder = useCallback(async (orderId) => {
    const response = await apiCall(ORDER_ENDPOINTS.ASSIGN_ORDER(orderId), {
      method: 'POST'
    });

    if (response.success) {
      message.success(response.message || 'Đã nhận đơn hàng thành công');
      refreshOrders();
    } else {
      const errorMessage = extractErrorMessage(response);
      message.error(errorMessage);
    }
  }, [refreshOrders]);

  // Handle delete order detail
  const handleDeleteOrderDetail = useCallback(async (id) => {
    try {
      const response = await apiCall(ORDER_ENDPOINTS.ORDER_DETAIL_ITEM(id), {
        method: 'DELETE'
      });

      // API DELETE thường trả về 204 No Content khi thành công
      // hoặc có thể trả về response với success: true
      if (response.success || response.status === 204 || response.status === 200) {
        return { success: true, message: 'Xóa sản phẩm thành công' };
      } else {
        const errorMessage = response.message || 'Có lỗi xảy ra khi xóa sản phẩm';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error deleting order detail:', error);
      return { success: false, message: 'Có lỗi xảy ra khi xóa sản phẩm' };
    }
  }, []);

  // Handle order detail submit (create/update)
  const handleOrderDetailSubmit = useCallback(async (values, selectedOrderId, editingOrderDetail) => {
    try {
      // Xử lý coupon_id: nếu undefined hoặc empty string thì gửi null
      const couponId = values.coupon_id && values.coupon_id !== '' ? values.coupon_id : null;
      
      const orderDetailData = {
        product_variant: values.product_variant,
        quantity: values.quantity,
        coupon_id: couponId,
        order: selectedOrderId
      };

      if (editingOrderDetail) {
        // Update
        const response = await apiCall(ORDER_ENDPOINTS.ORDER_DETAIL_ITEM(editingOrderDetail.id), {
          method: 'PUT',
          body: JSON.stringify({
            ...orderDetailData,
            id: editingOrderDetail.id
          })
        });
        
        return response;
      } else {
        // Create
        const response = await apiCall(ORDER_ENDPOINTS.ORDER_DETAILS, {
          method: 'POST',
          body: JSON.stringify(orderDetailData)
        });
        
        return response;
      }
    } catch (error) {
      return { success: false, error };
    }
  }, []);

  // Handle view order details
  const handleViewOrderDetails = useCallback(async (orderId, setOrderDetails, setOrderDetailLoading) => {
    setOrderDetailLoading(true);
    try {
      const response = await apiCall(`${ORDER_ENDPOINTS.ORDER_DETAILS}?order=${orderId}`);
      
      if (response.success && response.data) {
        setOrderDetails(Array.isArray(response.data.results) ? response.data.results : []);
      } else {
        setOrderDetails([]);
        const errorMessage = extractErrorMessage(response);
        message.error(errorMessage);
      }
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn hàng');
      setOrderDetails([]);
    } finally {
      setOrderDetailLoading(false);
    }
  }, []);



  // Action handlers for different order statuses
  const handleProcessOrder = useCallback((record) => {
    handleOrderStatusAction(record.id, 'process');
  }, [handleOrderStatusAction]);

  const handleShipOrder = useCallback((record) => {
    handleOrderStatusAction(record.id, 'ship');
  }, [handleOrderStatusAction]);

  const handleConfirmOrder = useCallback((record) => {
    handleOrderStatusAction(record.id, 'confirm');
  }, [handleOrderStatusAction]);

  const handleCancelOrder = useCallback((record) => {
    handleOrderStatusAction(record.id, 'cancel');
  }, [handleOrderStatusAction]);

  return {
    // Status actions
    handleOrderStatusAction,
    handleProcessOrder,
    handleShipOrder,
    handleConfirmOrder,
    handleCancelOrder,
    
    // Assignment actions
    handleAssignOrder,
    
    // Detail actions
    handleDeleteOrderDetail,
    handleOrderDetailSubmit,
    handleViewOrderDetails
  };
} 