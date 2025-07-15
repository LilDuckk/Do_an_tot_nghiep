import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
  InputNumber,
  AutoComplete,
  Typography,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { RETURN_ORDER_ENDPOINTS, ORDER_ENDPOINTS } from '@/config/api';
import { useSearchAndFilter } from '@/admin/hooks/useSearchAndFilter';
import '@/admin/static/AdminCommon.css';
import { formatCurrency, formatDate } from '@/admin/utils/formatters';
import StatisticsCards from '@/admin/components/common/StatisticsCards';
import useStatistics from '@/admin/hooks/useStatistics';
import { getReturnOrderStatisticsConfig } from '@/admin/utils/statisticsConfigs';
import { useAccessControl } from '@/admin/hooks/useAccessControl';
import AccessDeniedAlert from '@/admin/components/common/AccessDeniedAlert';
import { useCRUD } from '@/admin/hooks/useCRUD';
import ActionButtons from '@/admin/components/common/ActionButtons';
import { isSuperUser } from '@/services/permission';

const { Title } = Typography;

const { Option } = Select;
const { TextArea } = Input;

// Di chuyển default stats ra ngoài component để tránh tạo mới mỗi lần render
const defaultReturnOrderStats = {
  total_returns: 0,
  pending_returns: 0,
  approved_returns: 0,
  completed_returns: 0,
  total_refund_amount: 0,
};

const ReturnOrdersPage = () => {
  // Kiểm tra quyền truy cập trang (luôn gọi ở đầu)
  const { hasAccess } = useAccessControl('returnorder', 'view');

  // Sử dụng useSearchAndFilter hook để quản lý search và filter
  const {
    searchText,
    setSearchText,
    debouncedSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    handleMultipleFilterChange,
    clearFilters,
    toggleFilters,
    buildQueryParams,
    hasActiveFilters,
    hasSearchText,
    hasAnySearchOrFilter
  } = useSearchAndFilter({
    status: '',
    date_range: null,
    order: null
  }, 500);

  // CRUD cho đơn trả hàng với search và filter
  const {
    data: returnOrders,
    loading,
    modalVisible,
    editingId,
    total,
    totalPages,
    setModalVisible,
    setEditingId,
    fetchData: fetchReturnOrders,
    refreshData: refreshReturnOrders,
    handleSubmit: handleCrudSubmit,
    handleDelete: handleCrudDelete,
    openCreateModal,
    openEditModal,
  } = useCRUD({
    baseUrl: RETURN_ORDER_ENDPOINTS.RETURN_ORDERS,
    entityName: 'đơn trả hàng',
    pageSize: 10, // Sử dụng pageSize cố định để tránh infinite loop
    formatData: (values) => ({
      ...values,
      return_date: values.return_date?.format ? values.return_date.format('YYYY-MM-DD') : values.return_date,
    }),
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnOrderProducts, setReturnOrderProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [form] = Form.useForm();
  const [productForm] = Form.useForm();
  const [editingProductId, setEditingProductId] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Pagination states - sử dụng pageSize từ useCRUD
  const [localPageSize, setLocalPageSize] = useState(10);

  // Sử dụng default stats đã định nghĩa bên ngoài
  const { statistics, fetchStatistics, loading: statisticsLoading } = useStatistics(
    RETURN_ORDER_ENDPOINTS.RETURN_ORDER_STATISTICS,
    defaultReturnOrderStats
  );

  // Fetch data với search và filter
  const fetchDataWithFilters = useCallback(async () => {
    const params = buildQueryParams({
      page_size: localPageSize
    });
    await refreshReturnOrders(params);
  }, [buildQueryParams, localPageSize, refreshReturnOrders]);

  // Fetch data khi search hoặc filter thay đổi
  useEffect(() => {
    fetchDataWithFilters();
  }, [debouncedSearchText, currentPage, filters]); // Loại bỏ fetchDataWithFilters khỏi dependencies

  // Fetch data lần đầu khi component mount
  useEffect(() => {
    fetchDataWithFilters();
  }, []); // Chỉ chạy một lần khi component mount

  const [orderOptions, setOrderOptions] = useState([]);
const [selectedOrder, setSelectedOrder] = useState(null);

  // Search orders
  const searchOrders = async (value) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Nếu value là số, tìm theo id, nếu không thì tìm theo tên khách hàng
      let params;
      if (/^\d+$/.test(value)) {
        params = new URLSearchParams({ id: value });
      } else {
        params = new URLSearchParams({ customer_name: value });
      }
      // Nếu API không hỗ trợ customer_name, dùng search chung
      if (!/^\d+$/.test(value)) {
        params = new URLSearchParams({ search: value });
      }
      const response = await fetch(`${ORDER_ENDPOINTS.ORDERS}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const options = data.results.map(order => ({
        value: String(order.id),
        label: `Đơn hàng #${order.id} - ${order.customer_first_name || ''}`.trim(),
        order: order
      }));
      setOrderOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm đơn hàng');
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_APPROVE(id), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền duyệt đơn trả hàng này.');
        return;
      }

      if (!response.ok) {
        message.error('Có lỗi xảy ra khi duyệt đơn trả hàng');
        return;
      }

      message.success('Duyệt đơn trả hàng thành công');
      fetchDataWithFilters();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi duyệt');
    }
  };

  const handleReject = async (id, rejectionReason) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_REJECT(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền từ chối đơn trả hàng này.');
        return;
      }

      if (!response.ok) {
        message.error('Có lỗi xảy ra khi từ chối đơn trả hàng');
        return;
      }

      message.success('Từ chối đơn trả hàng thành công');
      setRejectModalVisible(false);
      setRejectingOrderId(null);
      setRejectionReason('');
      fetchDataWithFilters();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi từ chối');
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    handleReject(rejectingOrderId, rejectionReason);
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_COMPLETE(id), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền hoàn thành đơn trả hàng này.');
        return;
      }

      if (!response.ok) {
        message.error('Có lỗi xảy ra khi hoàn thành đơn trả hàng');
        return;
      }

      message.success('Hoàn thành đơn trả hàng thành công');
      fetchDataWithFilters();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi hoàn thành');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setSelectedReturnOrder(record);
    form.setFieldsValue({
      order: record.order?.id,
      return_date: record.return_date ? dayjs(record.return_date) : null,
      status: record.status,
      reason: record.reason,
      refund_amount: record.refund_amount,
      return_store: record.return_store?.id,
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedReturnOrder(record);
    setDetailModalVisible(true);
  };

  const handleViewProducts = async (record) => {
    try {
      setProductsLoading(true);
      setSelectedReturnOrder(record);
      const token = localStorage.getItem('accessToken');
      
      // Fetch return order products
      const response = await fetch(`${RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAILS}?return_order=${record.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReturnOrderProducts(data.results || []);
      } else {
        message.error('Lỗi khi tải danh sách sản phẩm');
        setReturnOrderProducts([]);
      }

      // Fetch order details for adding new products
      setOrderDetailsLoading(true);
      const orderDetailsResponse = await fetch(`${ORDER_ENDPOINTS.ORDER_DETAILS}?order=${record.order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (orderDetailsResponse.ok) {
        const orderDetailsData = await orderDetailsResponse.json();
        setOrderDetails(orderDetailsData.results || []);
      } else {
        message.error('Lỗi khi tải chi tiết đơn hàng');
        setOrderDetails([]);
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
      setReturnOrderProducts([]);
      setOrderDetails([]);
    } finally {
      setProductsLoading(false);
      setOrderDetailsLoading(false);
      setProductsModalVisible(true);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleAddProduct = () => {
    setEditingProductId(null);
    productForm.resetFields();
    setProductModalVisible(true);
  };

  const handleEditProduct = (record) => {
    setEditingProductId(record.id);
    productForm.setFieldsValue({
      order_detail: record.order_detail,
      quantity: record.quantity,
      reason: record.reason,
      condition: record.condition,
    });
    setProductModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAIL_ITEM(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa sản phẩm này.');
        return;
      }

      if (!response.ok) {
        message.error('Có lỗi xảy ra khi xóa sản phẩm');
        return;
      }

      message.success('Xóa sản phẩm thành công');
      handleViewProducts(selectedReturnOrder); // Refresh products list
      // Tải lại danh sách đơn trả hàng để cập nhật thông tin
      fetchDataWithFilters();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleSubmitProduct = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        ...values,
        return_order: selectedReturnOrder.id,
      };

      if (editingProductId) {
        const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAIL_ITEM(editingProductId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi cập nhật sản phẩm');
          return;
        }
        message.success('Cập nhật sản phẩm thành công');
      } else {
        const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAILS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi thêm sản phẩm');
          return;
        }
        message.success('Thêm sản phẩm thành công');
      }
      
      setProductModalVisible(false);
      productForm.resetFields();
      setEditingProductId(null);
      handleViewProducts(selectedReturnOrder); // Refresh products list
      // Tải lại danh sách đơn trả hàng để cập nhật thông tin
      fetchDataWithFilters();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const getAvailableOrderDetails = () => {
    if (!orderDetails.length) return [];
    
    // Get order detail IDs that are already in return order
    const existingOrderDetailIds = returnOrderProducts.map(item => item.order_detail);
    
    // Filter out order details that are already added
    return orderDetails.filter(detail => !existingOrderDetailIds.includes(detail.id));
  };

  const getMaxQuantityForOrderDetail = (orderDetailId) => {
    const orderDetail = orderDetails.find(detail => detail.id === orderDetailId);
    if (!orderDetail) return 0;
    
    // Get current return quantity for this order detail
    const currentReturnItem = returnOrderProducts.find(item => item.order_detail === orderDetailId);
    const currentReturnQuantity = currentReturnItem ? currentReturnItem.quantity : 0;
    
    // Available quantity = original quantity - current return quantity
    return orderDetail.quantity - currentReturnQuantity;
  };

  const getMaxQuantityForEditing = (orderDetailId, editingProductId) => {
    const orderDetail = orderDetails.find(detail => detail.id === orderDetailId);
    if (!orderDetail) return 0;
    
    // Get current return quantity for this order detail (excluding the item being edited)
    const currentReturnItems = returnOrderProducts.filter(item => 
      item.order_detail === orderDetailId && item.id !== editingProductId
    );
    const currentReturnQuantity = currentReturnItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Available quantity = original quantity - current return quantity (excluding editing item)
    return orderDetail.quantity - currentReturnQuantity;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'APPROVED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã đơn trả',
      dataIndex: 'return_number',
      key: 'return_number',
      width: 150,
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Đơn hàng gốc',
      dataIndex: ['order', 'order_number'],
      key: 'order_number',
      width: 150,
      render: (text, record) => (
        <div>
          <div className="return-order-number">{record.order?.order_number || text}</div>
          <div className="return-order-customer">
            {record.order?.customer_first_name || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Cửa hàng trả',
      dataIndex: ['return_store', 'name'],
      key: 'return_store',
      width: 150,
      render: (text, record) => (
        <div>
          <div className="return-store-name">{record.return_store?.name || 'N/A'}</div>
          <div className="return-store-code">
            {record.return_store?.store_code || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày trả hàng',
      dataIndex: 'return_date',
      key: 'return_date',
      width: 120,
      render: (date) => formatDate(date, 'DD/MM/YYYY'),
    },
    {
      title: 'Lý do trả hàng',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      render: (reason) => (
        <Tooltip title={reason}>
          <span>{reason ? (reason.length > 30 ? `${reason.substring(0, 30)}...` : reason) : 'N/A'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Số tiền hoàn',
      dataIndex: 'refund_amount',
      key: 'refund_amount',
      width: 120,
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={handleEdit}
          onDelete={() => handleCrudDelete(record.id)}
          onView={handleViewDetail}
          hasAccess={true}
          showEdit={true}
          showDelete={true}
          showView={true}
          size="small"
          additionalActions={[
            record.status === 'PENDING' && {
              key: 'approve',
              icon: <CheckOutlined />,
              title: '',
              tooltip: 'Duyệt',
              type: 'primary',
              style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
              onClick: () => handleApprove(record.id),
            },
            record.status === 'PENDING' && {
              key: 'reject',
              icon: <CloseOutlined />,
              title: '',
              tooltip: 'Từ chối',
              type: 'primary',
              style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' },
              onClick: () => {
                setRejectingOrderId(record.id);
                setRejectionReason('');
                setRejectModalVisible(true);
              },
            },
            record.status === 'APPROVED' && {
              key: 'complete',
              icon: <CheckOutlined />,
              title: '',
              tooltip: 'Hoàn thành',
              type: 'primary',
              style: { backgroundColor: '#1890ff', borderColor: '#1890ff' },
              onClick: () => handleComplete(record.id),
            },
            {
              key: 'products',
              icon: <ShoppingOutlined />,
              title: '',
              tooltip: 'Xem sản phẩm',
              type: 'primary',
              style: { backgroundColor: '#722ed1', borderColor: '#722ed1' },
              onClick: () => handleViewProducts(record),
            },
          ].filter(Boolean)}
        />
      ),
    },
  ];

  // Render thống kê
  return (
    <div className="admin-section">
      <Card>
        <Title level={2}>Quản lý đơn trả hàng</Title>
        <StatisticsCards 
          config={getReturnOrderStatisticsConfig(statistics)} 
          loading={statisticsLoading} 
        />
        
        {/* Search and Filter Section */}
        <Card size="small" className="return-filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Search
                placeholder="Tìm kiếm theo mã đơn trả, lý do..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="return-btn-search"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchDataWithFilters()}
                className="admin-btn return-btn-refresh"
              >
                Làm mới
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button 
                onClick={toggleFilters}
                icon={<FilterOutlined />} 
                className={`return-btn-filter ${showFilters ? 'showing' : ''}`}
              >
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button 
                onClick={handleClearFilters}
                icon={<ClearOutlined />} 
                className="return-btn-clear"
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>

          {showFilters && (
            <div className="return-filter-section">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Select
                    placeholder="Trạng thái đơn trả hàng"
                    value={filters?.status || ''}
                    onChange={(value) => handleFilterChange('status', value)}
                    allowClear
                    className="return-btn-filter-select"
                  >
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="APPROVED">Đã duyệt</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="REJECTED">Từ chối</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <DatePicker.RangePicker
                    placeholder={['Từ ngày', 'Đến ngày']}
                    value={filters?.date_range || null}
                    onChange={(dates) => handleFilterChange('date_range', dates)}
                    className="return-btn-date-picker"
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <AutoComplete
                    onSearch={searchOrders}
                    placeholder="Tìm kiếm đơn hàng..."
                    className="return-btn-auto-complete"
                    allowClear
                  />
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="return-action-section">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setSelectedOrder(null);
              setModalVisible(true);
            }}
          >
            Thêm đơn trả hàng mới
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={returnOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: localPageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} đơn trả hàng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            position: ['bottomCenter'],
            size: 'default',
            responsive: true,
          }}
          onChange={(pagination) => {
            if (pagination.pageSize !== localPageSize) {
              setLocalPageSize(pagination.pageSize);
              setCurrentPage(1);
            } else {
              setCurrentPage(pagination.current);
            }
          }}
          scroll={{ x: 1500 }}
          className="admin-table"
        />

      {/* Products Modal */}
      <Modal
        title={`Chi tiết sản phẩm - Đơn trả hàng ${selectedReturnOrder?.return_number || ''}`}
        open={productsModalVisible}
        onCancel={() => setProductsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProductsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        {productsLoading ? (
          <div className="return-loading-state">
            <div>Đang tải danh sách sản phẩm...</div>
          </div>
        ) : returnOrderProducts.length > 0 ? (
          <div className="return-order-products">
            {/* Action Buttons */}
            <div className="return-action-section">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
                disabled={selectedReturnOrder?.status !== 'PENDING'}
              >
                Thêm sản phẩm
              </Button>
            </div>
            
            <Table
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: ['product', 'name'],
                  key: 'product',
                  width: 200,
                  render: (text, record) => (
                    <div>
                      <div className="product-name">
                        {record.product?.name || 'N/A'}
                      </div>
                      <div className="product-description">
                        {record.product?.description || ''}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'SKU',
                  dataIndex: ['variant', 'sku'],
                  key: 'sku',
                  width: 150,
                  render: (text, record) => (
                    <div>
                      <div className="variant-sku">
                        {record.variant?.sku || 'N/A'}
                      </div>
                    </div>
                  ),
                },
                                 {
                   title: 'Số lượng gốc',
                   dataIndex: 'original_quantity',
                   key: 'original_quantity',
                   width: 120,
                   render: (quantity, record) => {
                     const orderDetail = orderDetails.find(d => d.id === record.order_detail);
                     const originalQuantity = orderDetail?.quantity || quantity || 0;
                     return (
                       <span className="quantity-original">
                         {originalQuantity}
                       </span>
                     );
                   },
                 },
                {
                  title: 'Số lượng trả',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 120,
                  render: (quantity) => (
                                         <span className="quantity-return">
                       {quantity || 0}
                     </span>
                  ),
                },
                                 {
                   title: 'Số lượng còn lại',
                   dataIndex: 'available_for_return',
                   key: 'available_for_return',
                   width: 120,
                   render: (quantity, record) => {
                     const orderDetail = orderDetails.find(d => d.id === record.order_detail);
                     const originalQuantity = orderDetail?.quantity || 0;
                     const currentReturnQuantity = record.quantity || 0;
                     const availableQuantity = originalQuantity - currentReturnQuantity;
                     
                     return (
                                            <span className="quantity-available">
                       {availableQuantity}
                     </span>
                     );
                   },
                 },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  width: 120,
                  render: (price) => (
                                         <span className="quantity-unit-price">
                       {formatCurrency(price)}
                     </span>
                  ),
                },
                {
                  title: 'Tổng tiền',
                  dataIndex: 'total_price',
                  key: 'total_price',
                  width: 120,
                  render: (price) => (
                                         <span className="quantity-total-price">
                       {formatCurrency(price)}
                     </span>
                  ),
                },
                {
                  title: 'Lý do trả',
                  dataIndex: 'reason',
                  key: 'reason',
                  width: 200,
                  render: (reason) => (
                    <Tooltip title={reason}>
                      <span>{reason ? (reason.length > 30 ? `${reason.substring(0, 30)}...` : reason) : 'N/A'}</span>
                    </Tooltip>
                  ),
                },
                                 {
                   title: 'Tình trạng',
                   dataIndex: 'condition',
                   key: 'condition',
                   width: 120,
                   render: (condition) => {
                     const getConditionColor = (cond) => {
                       switch (cond) {
                         case 'NEW':
                           return 'green';
                         case 'USED':
                           return 'orange';
                         case 'DAMAGED':
                           return 'red';
                         default:
                           return 'default';
                       }
                     };
                     const getConditionText = (cond) => {
                       switch (cond) {
                         case 'NEW':
                           return 'Mới';
                         case 'USED':
                           return 'Đã sử dụng';
                         case 'DAMAGED':
                           return 'Bị hỏng';
                         default:
                           return cond || 'N/A';
                       }
                     };
                     return (
                       <Tag color={getConditionColor(condition)}>
                         {getConditionText(condition)}
                       </Tag>
                     );
                   },
                 },
                 {
                   title: 'Thao tác',
                   key: 'actions',
                   width: 120,
                   fixed: 'right',
                   render: (_, record) => (
                     <Space>
                       <Tooltip title="Sửa">
                         <Button
                           type="primary"
                           icon={<EditOutlined />}
                           size="small"
                           onClick={() => handleEditProduct(record)}
                           disabled={selectedReturnOrder?.status !== 'PENDING'}
                         />
                       </Tooltip>
                       <Popconfirm
                         title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                         onConfirm={() => handleDeleteProduct(record.id)}
                         disabled={selectedReturnOrder?.status !== 'PENDING'}
                       >
                         <Tooltip title="Xóa">
                           <Button
                             danger
                             icon={<DeleteOutlined />}
                             size="small"
                             disabled={selectedReturnOrder?.status !== 'PENDING'}
                           />
                         </Tooltip>
                       </Popconfirm>
                     </Space>
                   ),
                 },
              ]}
              dataSource={returnOrderProducts}
              rowKey="id"
              pagination={false}
              size="small"
              className="admin-table"
            />
            
            {/* Summary */}
                        <div className="return-summary-section">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div className="return-summary-item">
                    <div className="return-summary-label">Tổng số sản phẩm</div>
                    <div className="return-summary-value products">
                      {returnOrderProducts.length}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="return-summary-item">
                    <div className="return-summary-label">Tổng số lượng trả</div>
                    <div className="return-summary-value quantity">
                      {returnOrderProducts.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="return-summary-item">
                    <div className="return-summary-label">Tổng tiền trả</div>
                    <div className="return-summary-value amount">
                      {formatCurrency(returnOrderProducts.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0))}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <div className="return-empty-state">
            <div>Không có sản phẩm nào trong đơn trả hàng này</div>
            {/* Action Buttons - hiển thị ngay cả khi không có sản phẩm */}
            <div className="return-action-section">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
                disabled={selectedReturnOrder?.status !== 'PENDING'}
              >
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        )}
       </Modal>

       {/* Product Add/Edit Modal */}
       <Modal
         title={editingProductId ? "Sửa sản phẩm trả hàng" : "Thêm sản phẩm trả hàng"}
         open={productModalVisible}
         onCancel={() => {
           setProductModalVisible(false);
           productForm.resetFields();
           setEditingProductId(null);
         }}
         footer={null}
         width={600}
       >
         <Form
           form={productForm}
           layout="vertical"
           onFinish={handleSubmitProduct}
         >
                     <Form.Item
            name="order_detail"
            label="Sản phẩm từ đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            extra={editingProductId ? 
              'Số lượng tối đa có thể trả = Số lượng gốc - Số lượng đã trả (không tính sản phẩm đang sửa)' : 
              'Số lượng tối đa có thể trả = Số lượng gốc - Số lượng đã trả'
            }
          >
                         <Select
              placeholder="Chọn sản phẩm từ đơn hàng gốc"
              disabled={editingProductId !== null} // Disable when editing
              onChange={(value) => {
                let maxQuantity;
                if (editingProductId) {
                  maxQuantity = getMaxQuantityForEditing(value, editingProductId);
                } else {
                  maxQuantity = getMaxQuantityForOrderDetail(value);
                }
                productForm.setFieldsValue({ quantity: maxQuantity });
              }}
            >
                             {getAvailableOrderDetails().map(detail => {
                const maxQuantity = editingProductId ? 
                  getMaxQuantityForEditing(detail.id, editingProductId) : 
                  getMaxQuantityForOrderDetail(detail.id);
                return (
                  <Option key={detail.id} value={detail.id}>
                    {detail.product?.name} - {detail.variant?.sku} (SL gốc: {detail.quantity}, SL có thể trả: {maxQuantity})
                  </Option>
                );
              })}
             </Select>
           </Form.Item>

                     <Form.Item
            name="quantity"
            label="Số lượng trả"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const orderDetailId = getFieldValue('order_detail');
                  let maxQuantity;
                  
                  if (editingProductId) {
                    // When editing, exclude current item from calculation
                    maxQuantity = getMaxQuantityForEditing(orderDetailId, editingProductId);
                  } else {
                    // When adding new item
                    maxQuantity = getMaxQuantityForOrderDetail(orderDetailId);
                  }
                  
                  if (value && value > maxQuantity) {
                    return Promise.reject(new Error(`Số lượng không được vượt quá ${maxQuantity} (số lượng gốc: ${orderDetails.find(d => d.id === orderDetailId)?.quantity || 0})`));
                  }
                  if (value && value <= 0) {
                    return Promise.reject(new Error('Số lượng phải lớn hơn 0'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              className="return-form-number"
              placeholder="Nhập số lượng trả..."
              min={1}
              max={editingProductId ? undefined : 999}
            />
          </Form.Item>

           <Form.Item
             name="reason"
             label="Lý do trả hàng"
             rules={[{ required: true, message: 'Vui lòng nhập lý do trả hàng' }]}
           >
             <TextArea rows={3} placeholder="Nhập lý do trả hàng..." />
           </Form.Item>

           <Form.Item
             name="condition"
             label="Tình trạng sản phẩm"
             rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
           >
             <Select placeholder="Chọn tình trạng sản phẩm">
               <Option value="NEW">Mới</Option>
               <Option value="USED">Đã sử dụng</Option>
               <Option value="DAMAGED">Bị hỏng</Option>
             </Select>
           </Form.Item>

           <Form.Item>
             <Space>
               <Button type="primary" htmlType="submit">
                 {editingProductId ? 'Cập nhật' : 'Thêm mới'}
               </Button>
               <Button onClick={() => {
                 setProductModalVisible(false);
                 productForm.resetFields();
                 setEditingProductId(null);
               }}>
                 Hủy
               </Button>
             </Space>
           </Form.Item>
         </Form>
       </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? "Sửa đơn trả hàng" : "Thêm đơn trả hàng mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
          setSelectedReturnOrder(null);
          setSelectedOrder(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCrudSubmit}
        >
          <Form.Item
            name="order"
            label="Đơn hàng gốc"
            rules={[{ required: true, message: 'Vui lòng chọn đơn hàng gốc' }]}
          >
            <AutoComplete
              onSearch={searchOrders}
              options={orderOptions}
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
              className="return-form-auto-complete"
              filterOption={false}
              onSelect={(value, option) => {
                form.setFieldsValue({ order: value });
                setSelectedOrder(option.order);
              }}
              allowClear
            />
          </Form.Item>

          {/* Hiển thị thông tin đơn hàng gốc đã chọn */}
          {selectedOrder && (
            <div className="selected-order-info">
              <h4>Thông tin đơn hàng gốc</h4>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Mã đơn hàng:</span>
                    <span className="info-value">#{selectedOrder.id}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Khách hàng:</span>
                    <span className="info-value">
                      {selectedOrder.customer_first_name || 'N/A'}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Cửa hàng:</span>
                    <span className="info-value">{selectedOrder.store_name || 'N/A'}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Tổng tiền:</span>
                    <span className="info-value">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          <Form.Item
            name="return_date"
            label="Ngày trả hàng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày trả hàng' }]}
          >
            <DatePicker className="return-form-date-picker" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái đơn trả hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            extra={editingId && selectedReturnOrder?.status === 'COMPLETED' && !isSuperUser() ? 
              'Không thể thay đổi trạng thái của đơn trả hàng đã hoàn thành' : 
              'Chọn trạng thái mới cho đơn trả hàng'
            }
          >
            <Select 
              placeholder="Chọn trạng thái đơn trả hàng"
              disabled={editingId && selectedReturnOrder?.status === 'COMPLETED' && !isSuperUser()}
            >
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="REJECTED">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do trả hàng"
            rules={[{ required: true, message: 'Vui lòng nhập lý do trả hàng' }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do trả hàng..." />
          </Form.Item>

          <Form.Item
            name="refund_amount"
            label="Số tiền hoàn"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền hoàn' }]}
          >
            <InputNumber
              className="return-form-number"
              placeholder="Nhập số tiền hoàn..."
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
                setSelectedReturnOrder(null);
                setSelectedOrder(null);
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối đơn trả hàng"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectingOrderId(null);
          setRejectionReason('');
        }}
        onOk={handleRejectSubmit}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div className="reject-modal-content">
          <p>Vui lòng nhập lý do từ chối đơn trả hàng:</p>
        </div>
        <Input.TextArea
          placeholder="Nhập lý do từ chối..."
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="reject-modal-textarea"
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn trả hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedReturnOrder && (
          <div className="return-detail-modal">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                                <div className="return-detail-section">
                  <h4>Thông tin đơn trả hàng</h4>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Mã đơn trả:</span>
                    <span className="return-detail-value">{selectedReturnOrder.return_number}</span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Trạng thái:</span>
                    <span className="value">
                      <Tag color={getStatusColor(selectedReturnOrder.status)}>
                        {getStatusText(selectedReturnOrder.status)}
                      </Tag>
                    </span>
                  </div>
                                    <div className="return-detail-item">
                    <span className="return-detail-label">Ngày trả hàng:</span>
                    <span className="return-detail-value">
                      {selectedReturnOrder.return_date ? 
                        new Date(selectedReturnOrder.return_date).toLocaleDateString('vi-VN') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Lý do trả hàng:</span>
                    <span className="return-detail-value">{selectedReturnOrder.reason || 'N/A'}</span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Số tiền hoàn:</span>
                    <span className="return-detail-value primary">
                      {formatCurrency(selectedReturnOrder.refund_amount)}
                    </span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Trạng thái hoàn tiền:</span>
                    <span className="value">
                      <Tag color={selectedReturnOrder.refund_status === 'PENDING' ? 'orange' : 
                                   selectedReturnOrder.refund_status === 'COMPLETED' ? 'green' : 'default'}>
                        {selectedReturnOrder.refund_status === 'PENDING' ? 'Chờ hoàn' : 
                         selectedReturnOrder.refund_status === 'COMPLETED' ? 'Đã hoàn' : 
                         selectedReturnOrder.refund_status || 'N/A'}
                      </Tag>
                    </span>
                  </div>
                  {selectedReturnOrder.status === 'REJECTED' && selectedReturnOrder.rejection_reason && (
                    <div className="reject-reason-container">
                      <span className="reject-reason-label">Lý do từ chối:</span>
                      <span className="reject-reason-value">
                        {selectedReturnOrder.rejection_reason}
                      </span>
                    </div>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Thông tin đơn hàng gốc</h4>
                  <div className="detail-item">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">{selectedReturnOrder.order?.order_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Khách hàng:</span>
                    <span className="value">
                      {selectedReturnOrder.order?.customer_first_name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cửa hàng gốc:</span>
                    <span className="value">{selectedReturnOrder.order?.store_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Tổng tiền đơn hàng:</span>
                    <span className="value">
                      {formatCurrency(selectedReturnOrder.order?.total_amount)}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} className="detail-row">
              <Col span={12}>
                <div className="detail-section">
                  <h4>Thông tin cửa hàng trả</h4>
                  <div className="detail-item">
                    <span className="label">Tên cửa hàng:</span>
                    <span className="value">{selectedReturnOrder.return_store?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Mã cửa hàng:</span>
                    <span className="value">{selectedReturnOrder.return_store?.store_code || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedReturnOrder.return_store?.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Số điện thoại:</span>
                    <span className="value">{selectedReturnOrder.return_store?.phone || 'N/A'}</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-item">
                    <span className="label">Người tạo:</span>
                    <span className="value">{selectedReturnOrder.created_by?.username || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Người duyệt:</span>
                    <span className="value">{selectedReturnOrder.approved_by?.username || 'N/A'}</span>
                  </div>
                  {selectedReturnOrder.status === 'APPROVED' && selectedReturnOrder.approved_date && (
                    <div className="detail-item">
                      <span className="label">Ngày duyệt:</span>
                      <span className="value approved-date-value">
                        {formatDate(selectedReturnOrder.approved_date)}
                      </span>
                    </div>
                  )}
                  {selectedReturnOrder.status === 'REJECTED' && (
                    <div className="detail-item">
                      <span className="label">Người từ chối:</span>
                      <span className="value rejected-user-value">
                        {selectedReturnOrder.updated_by?.username || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {formatDate(selectedReturnOrder.created_at)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày cập nhật:</span>
                    <span className="value">
                      {formatDate(selectedReturnOrder.updated_at)}
                    </span>
                  </div>
                  {selectedReturnOrder.status === 'REJECTED' && (
                    <div className="detail-item">
                      <span className="label">Ngày từ chối:</span>
                      <span className="value rejected-date-value">
                        {formatDate(selectedReturnOrder.updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
      </Card>
    </div>
  );
};

export default ReturnOrdersPage; 