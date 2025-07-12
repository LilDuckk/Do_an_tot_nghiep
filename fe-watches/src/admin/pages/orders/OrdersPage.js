import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  message,
  Badge,
} from 'antd';
import { PlusOutlined, FilterOutlined, BellOutlined } from '@ant-design/icons';

import '@/admin/static/AdminCommon.css';

import { useAccessControl } from '@/admin/hooks';
import { 
  useOrderFilters, 
  useOrderData, 
  useOrderModal, 
  useOrderActions, 
  useOrderDetailModal,
  useUnassignedOrders
} from '@/admin/pages/orders/hooks';
import { AccessDeniedAlert, CustomPagination } from '@/admin/components';
import { OrderFilterBar, OrderTable, OrderModal, UnassignedOrdersModal, OrderDetailModal } from '@/admin/pages/orders/components';

import {
  getUserInfo,
  validateOrderDetailItem,
  validateOrderItems
} from '@/admin/pages/orders/utils';
import { usePagination } from '@/admin/hooks/usePagination';

const OrdersPage = () => {
  // User info
  const { user, isSuperUser, userEmployeeId, userStoreId } = getUserInfo();
  const userInfo = { user, isSuperUser, userEmployeeId, userStoreId };

  // Access control
  const { hasAccess } = useAccessControl();

  // Filter display state
  const [showFilters, setShowFilters] = useState(false);
  
  // Unassigned orders modal state
  const [unassignedOrdersModalVisible, setUnassignedOrdersModalVisible] = useState(false);

  // Custom hooks
  const pagination = usePagination(20, 1); // 10 item/trang mặc định
  const orderFilters = useOrderFilters();
  const { orders, ordersLoading, total, refreshOrders, fetchOrders } = useOrderData(orderFilters, hasAccess);
  const orderModal = useOrderModal(refreshOrders, userInfo);
  const orderActions = useOrderActions(refreshOrders);
  const unassignedOrders = useUnassignedOrders();
  
  // Order detail modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const refreshOrderDetails = useCallback(() => {
    if (selectedOrderId) {
      orderActions.handleViewOrderDetails(selectedOrderId, orderDetailModal.setOrderDetails, orderDetailModal.setOrderDetailLoading);
    }
  }, [selectedOrderId, orderActions]);
  const orderDetailModal = useOrderDetailModal(selectedOrderId, refreshOrderDetails, refreshOrders, userInfo);

  // Initial load
  useEffect(() => {
    if (!hasAccess) return;
    
    const fetchAll = async () => {
      unassignedOrders.fetchUnassignedOrders();
    };
    fetchAll();
  }, [hasAccess, unassignedOrders.fetchUnassignedOrders]);

  // Khi total thay đổi, cập nhật lại pagination
  useEffect(() => {
    pagination.updatePagination(total, pagination.pageSize);
  }, [total, pagination.pageSize, pagination]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      pagination.setCurrentPage(1);
    }
  }, [
    orderFilters.filterType,
    orderFilters.dateRange,
    orderFilters.statusFilter,
    orderFilters.paymentMethodFilter,
    orderFilters.paymentStatusFilter,
    orderFilters.shippingMethodFilter,
    orderFilters.isOnlineOrderFilter,
    orderFilters.totalAmountMin,
    orderFilters.totalAmountMax,
    orderFilters.storeFilter,
    orderFilters.employeeFilter
  ]);

  // Handle view order details
  const handleViewOrderDetails = useCallback((record) => {
    setSelectedOrderId(record.id);
    orderActions.handleViewOrderDetails(record.id, orderDetailModal.setOrderDetails, orderDetailModal.setOrderDetailLoading);
    orderDetailModal.openModal(record.id);
  }, [orderActions, orderDetailModal]);

  // Handle edit order
  const handleEdit = useCallback((record) => {
    orderModal.openEditModal(record);
  }, [orderModal]);

  // Handle assign order
  const handleAssignOrder = useCallback(async (orderId) => {
    await orderActions.handleAssignOrder(orderId);
    // Refresh unassigned orders after assigning
    setTimeout(() => {
      unassignedOrders.fetchUnassignedOrders();
    }, 1000);
  }, [orderActions, unassignedOrders.fetchUnassignedOrders]);

  // Handle order detail submit
  const handleOrderDetailSubmit = useCallback(async (values) => {
    // Validate order items trước khi submit
    const currentOrderDetails = orderDetailModal.orderDetails || [];
    const newItem = {
      product_variant: values.product_variant,
      quantity: values.quantity,
      unit_price: orderDetailModal.selectedVariant?.price_adjustment || 0
    };
    
    const allItems = orderDetailModal.editingOrderDetail 
      ? currentOrderDetails.map(item => 
          item.id === orderDetailModal.editingOrderDetail.id ? newItem : item
        )
      : [...currentOrderDetails, newItem];
    
    const validation = validateOrderItems(allItems);
    if (!validation.isValid) {
      message.error('Danh sách sản phẩm không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    
    const result = await orderActions.handleOrderDetailSubmit(values, selectedOrderId, orderDetailModal.editingOrderDetail);
    
    if (result.success) {
      message.success(orderDetailModal.editingOrderDetail ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
      orderDetailModal.handleCancelAddProduct();
      refreshOrderDetails();
      // Refresh danh sách đơn hàng để cập nhật thông tin mới nhất
      refreshOrders();
    } else {
      message.error(result.message || 'Có lỗi xảy ra khi thao tác với sản phẩm');
    }
  }, [orderActions, selectedOrderId, orderDetailModal, refreshOrderDetails, refreshOrders]);

  // Handle delete order detail
  const handleDeleteOrderDetail = useCallback(async (id) => {
    const result = await orderActions.handleDeleteOrderDetail(id);
    
    if (result.success) {
      message.success('Xóa sản phẩm thành công');
      refreshOrderDetails();
      // Refresh danh sách đơn hàng để cập nhật thông tin mới nhất
      refreshOrders();
    } else {
      message.error(result.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  }, [orderActions, refreshOrderDetails, refreshOrders]);

  // Action handlers for different order statuses
  const handleProcessOrder = useCallback((record) => {
    orderActions.handleProcessOrder(record);
  }, [orderActions]);

  const handleShipOrder = useCallback((record) => {
    orderActions.handleShipOrder(record);
  }, [orderActions]);

  const handleConfirmOrder = useCallback((record) => {
    orderActions.handleConfirmOrder(record);
  }, [orderActions]);

  const handleCancelOrder = useCallback((record) => {
    orderActions.handleCancelOrder(record);
  }, [orderActions]);

  // Customer search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderModal.customerSearchText) {
        orderModal.searchCustomers(orderModal.customerSearchText);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [orderModal.customerSearchText, orderModal.searchCustomers]);

  return (
    <div className="orders-page">
      <AccessDeniedAlert hasAccess={hasAccess} />
      
      <div className="admin-list-header">
        <h2>Quản lý đơn hàng</h2>
        <div className="search-bar">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={orderModal.openCreateModal}
          >
            Thêm đơn hàng
          </Button>
          
          {/* Nút thông báo đơn hàng mới */}
          <Badge count={unassignedOrders.unassignedOrdersCount} size="small">
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={() => {
                setUnassignedOrdersModalVisible(true);
                unassignedOrders.fetchUnassignedOrders();
              }}
              className={`btn-notification ${unassignedOrders.unassignedOrdersCount > 0 ? 'has-notifications' : 'no-notifications'}`}
            >
              Đơn hàng mới
              {unassignedOrders.unassignedOrdersCount > 0 && (
                <span className="badge-count">
                  ({unassignedOrders.unassignedOrdersCount})
                </span>
              )}
            </Button>
          </Badge>
          
          {/* Nút hiển thị bộ lọc ngoài cùng bên phải */}
          <div className="header-actions">
            <Button
              className={`filter-toggle-btn btn-filter-toggle ${showFilters ? 'showing' : 'hiding'}`}
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
            </Button>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      {/* <OrderStats
        stats={{
          total: total,
          pending: orders.filter(order => order.status === 'pending').length,
          processing: orders.filter(order => order.status === 'processing').length,
          shipped: orders.filter(order => order.status === 'shipped').length,
          delivered: orders.filter(order => order.status === 'delivered').length,
          cancelled: orders.filter(order => order.status === 'cancelled').length,
          totalAmount: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          averageAmount: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length : 0
        }}
        loading={ordersLoading}
        onStatClick={(status) => {
          // Có thể thêm logic filter theo status ở đây
          console.log('Filter by status:', status);
        }}
        className="admin-statistics-section"
      /> */}

      {/* Card bộ lọc chỉ hiện khi showFilters */}
      {showFilters && (
        <OrderFilterBar
          {...orderFilters}
          stores={orderModal.stores}
          employees={orderModal.employees}
          isSuperUser={isSuperUser}
          showFilters={showFilters}
        />
      )}

      <OrderTable
        orders={orders}
        loading={ordersLoading}
        onView={handleViewOrderDetails}
        onEdit={handleEdit}
        onProcessOrder={handleProcessOrder}
        onShipOrder={handleShipOrder}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={handleCancelOrder}
        hasAccess={hasAccess}
        pagination={false} // Tắt phân trang mặc định Table
      />

      <CustomPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(page) => {
          pagination.setCurrentPage(page);
          fetchOrders({ page });
        }}
        hasAccess={hasAccess}
        hasNext={pagination.hasNext}
        hasPrevious={pagination.hasPrevious}
      />

      {/* Order Modal */}
      <OrderModal
        visible={orderModal.modalVisible}
        loading={orderModal.modalLoading}
        form={orderModal.form} 
        onSubmit={orderModal.handleSubmit}
        onCancel={orderModal.closeModal}
        initialValues={{}}
        isEdit={!!orderModal.editingId}
        customers={orderModal.customers}
        stores={orderModal.stores}
        employees={orderModal.employees}
        filteredEmployees={orderModal.filteredEmployees}
        customerSearchLoading={orderModal.customerSearchLoading}
        isSuperUser={isSuperUser}
        onCustomerSearch={orderModal.setCustomerSearchText}
        onStoreChange={orderModal.filterEmployeesByStore}
        onEmployeeChange={() => {}}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={orderDetailModal.modalVisible}
        onCancel={() => {
          orderDetailModal.closeModal();
          setSelectedOrderId(null);
        }}
        orderDetails={orderDetailModal.orderDetails}
        orderDetailLoading={orderDetailModal.orderDetailLoading}
        showAddProductForm={orderDetailModal.showAddProductForm}
        onAddNewProduct={orderDetailModal.handleAddNewProduct}
        orderDetailForm={orderDetailModal.orderDetailForm}
        onSubmit={(values) => {
          // Validate form chi tiết đơn hàng trước khi submit
          const validation = validateOrderDetailItem(values);
          if (!validation.isValid) {
            // Hiển thị lỗi validation
            Object.keys(validation.errors).forEach(field => {
              orderDetailModal.orderDetailForm.setFields([
                {
                  name: field,
                  errors: [validation.errors[field]]
                }
              ]);
            });
            return;
          }
          handleOrderDetailSubmit(values);
        }}
        products={orderDetailModal.products}
        variants={orderDetailModal.variants}
        variantsLoading={orderDetailModal.variantsLoading}
        coupons={orderDetailModal.coupons}
        selectedProductId={orderDetailModal.selectedProductId}
        selectedVariant={orderDetailModal.selectedVariant}
        onProductChange={orderDetailModal.handleProductChange}
        onVariantChange={orderDetailModal.handleVariantChange}
        editingOrderDetail={orderDetailModal.editingOrderDetail}
        onCancelAddProduct={orderDetailModal.handleCancelAddProduct}
        onEditOrderDetail={orderDetailModal.handleEditOrderDetail}
        onDeleteOrderDetail={handleDeleteOrderDetail}
        productSearchText={orderDetailModal.productSearchText}
        onProductSearch={orderDetailModal.handleProductSearch}
      />

      {/* Modal đơn hàng chưa gán cửa hàng */}
      <UnassignedOrdersModal
        visible={unassignedOrdersModalVisible}
        onCancel={() => setUnassignedOrdersModalVisible(false)}
        unassignedOrders={unassignedOrders.unassignedOrders}
            loading={unassignedOrders.unassignedOrdersLoading}
        onRefresh={unassignedOrders.fetchUnassignedOrders}
        onViewOrderDetails={(record) => {
          setSelectedOrderId(record.id);
          orderActions.handleViewOrderDetails(record.id, orderDetailModal.setOrderDetails, orderDetailModal.setOrderDetailLoading);
          orderDetailModal.openModal(record.id);
        }}
        onAssignOrder={handleAssignOrder}
        unassignedOrdersCount={unassignedOrders.unassignedOrdersCount}
      />
    </div>
  );
};

export default OrdersPage; 