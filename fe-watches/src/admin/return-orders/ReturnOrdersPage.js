import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Statistic,
  Row,
  Col,
  Tag,
  Tooltip,
  InputNumber,
  AutoComplete,
  Alert,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { RETURN_ORDER_ENDPOINTS, ORDER_ENDPOINTS } from '../../config/api';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';

const { Option } = Select;
const { TextArea } = Input;

const ReturnOrdersPage = () => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnOrderProducts, setReturnOrderProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [form] = Form.useForm();
  const [productForm] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Statistics states
  const [statistics, setStatistics] = useState({
    total_returns: 0,
    pending_returns: 0,
    approved_returns: 0,
    completed_returns: 0,
    total_refund_amount: 0,
  });
  
  // Order search states
  const [orderOptions, setOrderOptions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch return orders
  const fetchReturnOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const paramsObj = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearchText) paramsObj.search = debouncedSearchText;
      if (statusFilter) paramsObj.status = statusFilter;
      if (dateRange && dateRange.length === 2) {
        paramsObj.return_date_from = dateRange[0].format('YYYY-MM-DD');
        paramsObj.return_date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (selectedOrder) paramsObj.order = selectedOrder;
      
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`${RETURN_ORDER_ENDPOINTS.RETURN_ORDERS}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setReturnOrders([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      
      const data = await response.json();
      setReturnOrders(data.results || []);
      setTotal(data.count || 0);
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / pageSize)));
      if ((data.count || 0) === 0 && currentPage !== 1) setCurrentPage(1);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đơn trả hàng');
      setReturnOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, statusFilter, dateRange, selectedOrder, currentPage, pageSize]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_STATISTICS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Search orders
  const searchOrders = async (value) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ search: value });
      const response = await fetch(`${ORDER_ENDPOINTS.ORDERS}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const options = data.results.map(order => ({
        value: String(order.id),
        label: `${order.order_number} - ${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`,
        order: order
      }));
      setOrderOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm đơn hàng');
    }
  };

  useEffect(() => {
    fetchReturnOrders();
    fetchStatistics();
  }, [fetchReturnOrders, fetchStatistics]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchText, statusFilter, dateRange, selectedOrder]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        ...values,
        return_date: values.return_date?.format('YYYY-MM-DD'),
      };

      // Check if status is being changed
      if (editingId && selectedReturnOrder && values.status !== selectedReturnOrder.status) {
        const statusChangeMessage = `Bạn có chắc chắn muốn thay đổi trạng thái từ "${getStatusText(selectedReturnOrder.status)}" sang "${getStatusText(values.status)}"?`;
        
        Modal.confirm({
          title: 'Xác nhận thay đổi trạng thái',
          content: statusChangeMessage,
          onOk: async () => {
            await submitForm(formattedValues, token);
          },
          onCancel: () => {
            // Do nothing, user cancelled
          }
        });
      } else {
        await submitForm(formattedValues, token);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const submitForm = async (formattedValues, token) => {
    try {
      if (editingId) {
        const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAIL(editingId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi cập nhật đơn trả hàng');
          return;
        }
        message.success('Cập nhật đơn trả hàng thành công');
      } else {
        const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi tạo đơn trả hàng');
          return;
        }
        message.success('Tạo đơn trả hàng mới thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setSelectedReturnOrder(null);
      fetchReturnOrders();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(RETURN_ORDER_ENDPOINTS.RETURN_ORDER_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa đơn trả hàng này.');
        return;
      }

      message.success('Xóa đơn trả hàng thành công');
      fetchReturnOrders();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
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
      fetchReturnOrders();
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
      fetchReturnOrders();
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
      fetchReturnOrders();
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
    setSearchText('');
    setStatusFilter('');
    setDateRange(null);
    setSelectedOrder(null);
    setCurrentPage(1);
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
          <div className="return-store-code" style={{ fontSize: '12px', color: '#666' }}>
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
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
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
      render: (amount) => amount ? `${parseFloat(amount).toLocaleString('vi-VN')} VNĐ` : 'N/A',
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
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Xem sản phẩm">
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              size="small"
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              onClick={() => handleViewProducts(record)}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="primary"
                  icon={<CloseOutlined />}
                  size="small"
                  style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
                  onClick={() => {
                    setRejectingOrderId(record.id);
                    setRejectionReason('');
                    setRejectModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Tooltip title="Hoàn thành">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                onClick={() => handleComplete(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="return-orders-page" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          Quản lý đơn trả hàng
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Quản lý và theo dõi tất cả đơn trả hàng từ khách hàng
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng đơn trả hàng"
              value={statistics.total_returns}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pending_returns}
              valueStyle={{ color: '#faad14' }}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Đã duyệt"
              value={statistics.approved_returns}
              valueStyle={{ color: '#1890ff' }}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Hoàn thành"
              value={statistics.completed_returns}
              valueStyle={{ color: '#52c41a' }}
              suffix="đơn"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Additional Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng tiền hoàn"
              value={statistics.total_refund_amount}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              suffix="VNĐ"
              formatter={(value) => `${parseFloat(value || 0).toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tỷ lệ đơn đã duyệt"
              value={statistics.total_returns > 0 ? 
                Math.round((statistics.approved_returns / statistics.total_returns) * 100) : 0}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <div className="search-filter-section" style={{ 
        background: '#fff', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm theo mã đơn trả, lý do..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchReturnOrders()}
              className="admin-btn"
              style={{ width: '100%' }}
            >
              Làm mới
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              icon={<FilterOutlined />} 
              style={{ width: '100%', background: showFilters ? '#52c41a' : '#1890ff', borderColor: showFilters ? '#52c41a' : '#1890ff', color: '#fff' }}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={handleClearFilters}
              icon={<ClearOutlined />} 
              style={{ width: '100%', background: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        {showFilters && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Trạng thái đơn trả hàng"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  allowClear
                  style={{ width: '100%' }}
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
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <AutoComplete
                  options={orderOptions}
                  onSearch={searchOrders}
                  onChange={(value) => setSelectedOrder(value)}
                  placeholder="Tìm kiếm đơn hàng..."
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm đơn trả hàng mới
        </Button>
      </div>

      {/* Table */}
      <div className="table-section" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table
          columns={columns}
          dataSource={returnOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
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
            if (pagination.pageSize !== pageSize) {
              setPageSize(pagination.pageSize);
              setCurrentPage(1);
            } else {
              setCurrentPage(pagination.current);
            }
          }}
          scroll={{ x: 1500 }}
          className="admin-table"
        />
      </div>

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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Đang tải danh sách sản phẩm...</div>
          </div>
        ) : returnOrderProducts.length > 0 ? (
          <div className="return-order-products">
            {/* Action Buttons */}
            <div style={{ marginBottom: '16px' }}>
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
                      <div className="product-name" style={{ fontWeight: 600 }}>
                        {record.product?.name || 'N/A'}
                      </div>
                      <div className="product-description" style={{ fontSize: '12px', color: '#666' }}>
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
                      <div className="variant-sku" style={{ fontWeight: 500 }}>
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
                       <span style={{ fontWeight: 600, color: '#1890ff' }}>
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
                    <span style={{ fontWeight: 600, color: '#52c41a' }}>
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
                       <span style={{ fontWeight: 600, color: '#faad14' }}>
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
                    <span style={{ fontWeight: 600 }}>
                      {price ? `${parseFloat(price).toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                    </span>
                  ),
                },
                {
                  title: 'Tổng tiền',
                  dataIndex: 'total_price',
                  key: 'total_price',
                  width: 120,
                  render: (price) => (
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>
                      {price ? `${parseFloat(price).toLocaleString('vi-VN')} VNĐ` : 'N/A'}
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
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e8e8e8'
            }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Tổng số sản phẩm</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
                      {returnOrderProducts.length}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Tổng số lượng trả</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#52c41a' }}>
                      {returnOrderProducts.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Tổng tiền trả</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
                      {returnOrderProducts.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div>Không có sản phẩm nào trong đơn trả hàng này</div>
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
              style={{ width: '100%' }}
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
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="order"
            label="Đơn hàng gốc"
            rules={[{ required: true, message: 'Vui lòng chọn đơn hàng gốc' }]}
          >
            <AutoComplete
              options={orderOptions}
              onSearch={searchOrders}
              placeholder="Tìm kiếm đơn hàng..."
              style={{ width: '100%' }}
              disabled={editingId !== null} // Disable when editing
            />
          </Form.Item>

          <Form.Item
            name="return_date"
            label="Ngày trả hàng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày trả hàng' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái đơn trả hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            extra={editingId && selectedReturnOrder?.status === 'COMPLETED' ? 
              'Không thể thay đổi trạng thái của đơn trả hàng đã hoàn thành' : 
              'Chọn trạng thái mới cho đơn trả hàng'
            }
          >
            <Select 
              placeholder="Chọn trạng thái đơn trả hàng"
              disabled={editingId && selectedReturnOrder?.status === 'COMPLETED'}
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
              style={{ width: '100%' }}
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
        <div style={{ marginBottom: '16px' }}>
          <p>Vui lòng nhập lý do từ chối đơn trả hàng:</p>
        </div>
        <Input.TextArea
          placeholder="Nhập lý do từ chối..."
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          style={{ width: '100%' }}
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
          <div className="return-order-detail-modal">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-section" style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px' 
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin đơn trả hàng</h4>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Mã đơn trả:</span>
                    <span className="value" style={{ fontWeight: 600 }}>{selectedReturnOrder.return_number}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Trạng thái:</span>
                    <span className="value">
                      <Tag color={getStatusColor(selectedReturnOrder.status)}>
                        {getStatusText(selectedReturnOrder.status)}
                      </Tag>
                    </span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày trả hàng:</span>
                    <span className="value">
                      {selectedReturnOrder.return_date ? 
                        new Date(selectedReturnOrder.return_date).toLocaleDateString('vi-VN') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Lý do trả hàng:</span>
                    <span className="value">{selectedReturnOrder.reason || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Số tiền hoàn:</span>
                    <span className="value" style={{ fontWeight: 600, color: '#1890ff' }}>
                      {selectedReturnOrder.refund_amount ? 
                        `${parseFloat(selectedReturnOrder.refund_amount).toLocaleString('vi-VN')} VNĐ` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Trạng thái hoàn tiền:</span>
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
                    <div className="detail-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '12px' 
                    }}>
                      <span className="label" style={{ fontWeight: 500, color: '#666' }}>Lý do từ chối:</span>
                      <span className="value" style={{ 
                        color: '#ff4d4f', 
                        fontWeight: 500,
                        maxWidth: '60%',
                        textAlign: 'right'
                      }}>
                        {selectedReturnOrder.rejection_reason}
                      </span>
                    </div>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section" style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px' 
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin đơn hàng gốc</h4>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Mã đơn hàng:</span>
                    <span className="value" style={{ fontWeight: 600 }}>{selectedReturnOrder.order?.order_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Khách hàng:</span>
                    <span className="value">
                      {selectedReturnOrder.order?.customer_first_name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Cửa hàng gốc:</span>
                    <span className="value">{selectedReturnOrder.order?.store_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Tổng tiền đơn hàng:</span>
                    <span className="value" style={{ fontWeight: 600 }}>
                      {selectedReturnOrder.order?.total_amount ? 
                        `${parseFloat(selectedReturnOrder.order.total_amount).toLocaleString('vi-VN')} VNĐ` : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <div className="detail-section" style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px' 
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin cửa hàng trả</h4>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Tên cửa hàng:</span>
                    <span className="value">{selectedReturnOrder.return_store?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Mã cửa hàng:</span>
                    <span className="value">{selectedReturnOrder.return_store?.store_code || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Địa chỉ:</span>
                    <span className="value">{selectedReturnOrder.return_store?.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Số điện thoại:</span>
                    <span className="value">{selectedReturnOrder.return_store?.phone || 'N/A'}</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-section" style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px' 
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin hệ thống</h4>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Người tạo:</span>
                    <span className="value">{selectedReturnOrder.created_by?.username || 'N/A'}</span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Người duyệt:</span>
                    <span className="value">{selectedReturnOrder.approved_by?.username || 'N/A'}</span>
                  </div>
                  {selectedReturnOrder.status === 'APPROVED' && selectedReturnOrder.approved_date && (
                    <div className="detail-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '12px' 
                    }}>
                      <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày duyệt:</span>
                      <span className="value" style={{ color: '#52c41a' }}>
                        {new Date(selectedReturnOrder.approved_date).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {selectedReturnOrder.status === 'REJECTED' && (
                    <div className="detail-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '12px' 
                    }}>
                      <span className="label" style={{ fontWeight: 500, color: '#666' }}>Người từ chối:</span>
                      <span className="value" style={{ color: '#ff4d4f' }}>
                        {selectedReturnOrder.updated_by?.username || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày tạo:</span>
                    <span className="value">
                      {selectedReturnOrder.created_at ? 
                        new Date(selectedReturnOrder.created_at).toLocaleString('vi-VN') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày cập nhật:</span>
                    <span className="value">
                      {selectedReturnOrder.updated_at ? 
                        new Date(selectedReturnOrder.updated_at).toLocaleString('vi-VN') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  {selectedReturnOrder.status === 'REJECTED' && (
                    <div className="detail-item" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '12px' 
                    }}>
                      <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày từ chối:</span>
                      <span className="value" style={{ color: '#ff4d4f' }}>
                        {selectedReturnOrder.updated_at ? 
                          new Date(selectedReturnOrder.updated_at).toLocaleString('vi-VN') : 
                          'N/A'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReturnOrdersPage; 