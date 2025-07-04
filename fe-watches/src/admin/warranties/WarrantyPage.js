import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
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
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { WARRANTY_ENDPOINTS, ORDER_ENDPOINTS, PRODUCT_ENDPOINTS } from '../../config/api';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';

// Cấu hình dayjs locale
dayjs.locale('vi');

// Cấu hình DatePicker để sử dụng dayjs
DatePicker.defaultProps = {
  ...DatePicker.defaultProps,
  format: 'DD/MM/YYYY',
};

// Cấu hình RangePicker
const { RangePicker } = DatePicker;
const { Option } = Select;

const WarrantyPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  
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
    total_warranties: 0,
    active_warranties: 0,
    expired_warranties: 0,
    claimed_warranties: 0,
  });
  
  // Order and product search states
  const [orderOptions, setOrderOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Customer search states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500);
  const debouncedCustomerName = useDebounce(customerName, 500);
  const debouncedCustomerPhone = useDebounce(customerPhone, 500);

  // Fetch warranties
  const fetchWarranties = useCallback(async () => {
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
        paramsObj.start_date = dateRange[0].format('YYYY-MM-DD');
        paramsObj.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (selectedOrder) paramsObj.order_detail = selectedOrder;
      if (selectedProduct) paramsObj.product = selectedProduct;
      if (debouncedCustomerName) paramsObj.customer_name = debouncedCustomerName;
      if (debouncedCustomerPhone) paramsObj.customer_phone = debouncedCustomerPhone;
      
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`${WARRANTY_ENDPOINTS.WARRANTIES}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setWarranties([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      
      const data = await response.json();
      setWarranties(data.results || []);
      setTotal(data.count || 0);
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / pageSize)));
      if ((data.count || 0) === 0 && currentPage !== 1) setCurrentPage(1);
    } catch (error) {
      message.error('Lỗi khi tải danh sách bảo hành');
      setWarranties([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, statusFilter, dateRange, selectedOrder, selectedProduct, debouncedCustomerName, debouncedCustomerPhone, currentPage, pageSize]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(WARRANTY_ENDPOINTS.WARRANTY_STATISTICS, {
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

  // Search products
  const searchProducts = async (value) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ search: value });
      const response = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const options = data.results.map(product => ({
        value: String(product.id),
        label: `${product.name} - ${product.brand_detail?.name || ''}`,
        product: product
      }));
      setProductOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm sản phẩm');
    }
  };



  useEffect(() => {
    fetchWarranties();
    fetchStatistics();
  }, [fetchWarranties, fetchStatistics]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchText, statusFilter, dateRange, selectedOrder, selectedProduct, debouncedCustomerName, debouncedCustomerPhone]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        warranty_start_date: values.warranty_start_date?.format('YYYY-MM-DD'),
        warranty_end_date: values.warranty_end_date?.format('YYYY-MM-DD'),
        serial_number: values.serial_number,
        notes: values.notes,
      };

      // Chỉ thêm order_detail khi tạo mới
      if (!editingId) {
        formattedValues.order_detail = values.order_detail;
      }

      // Thêm warranty_period và status khi chỉnh sửa
      if (editingId) {
        if (values.warranty_period) {
          formattedValues.warranty_period = values.warranty_period;
        }
        if (values.status) {
          formattedValues.status = values.status;
        }
      }

      if (editingId) {
        const response = await fetch(WARRANTY_ENDPOINTS.WARRANTY_DETAIL(editingId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi cập nhật bảo hành');
          return;
        }
        message.success('Cập nhật bảo hành thành công');
      } else {
        const response = await fetch(WARRANTY_ENDPOINTS.WARRANTIES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi tạo bảo hành');
          return;
        }
        message.success('Tạo bảo hành mới thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchWarranties();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(WARRANTY_ENDPOINTS.WARRANTY_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa bảo hành này.');
        return;
      }

      message.success('Xóa bảo hành thành công');
      fetchWarranties();
      fetchStatistics();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  // Fetch warranty detail by ID
  const fetchWarrantyDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(WARRANTY_ENDPOINTS.WARRANTY_DETAIL(id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        message.error('Bạn không có quyền xem chi tiết bảo hành này.');
        return null;
      }
      
      if (!response.ok) {
        message.error('Lỗi khi tải thông tin chi tiết bảo hành');
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải thông tin chi tiết');
      return null;
    }
  };

  const handleEdit = async (record) => {
    setDetailLoading(true);
    const warrantyDetail = await fetchWarrantyDetail(record.id);
    setDetailLoading(false);
    
    if (!warrantyDetail) return;
    
    setEditingId(record.id);
    form.setFieldsValue({
      warranty_number: warrantyDetail.warranty_number,
      order_detail: warrantyDetail.order_detail?.id,
      order_number: warrantyDetail.order_detail?.order?.order_number,
      customer_name: warrantyDetail.order_detail?.order?.customer ? 
        `${warrantyDetail.order_detail.order.customer.first_name} ${warrantyDetail.order_detail.order.customer.last_name}` : '',
      customer_phone: warrantyDetail.order_detail?.order?.customer?.phone || '',
      product_name: warrantyDetail.product?.name || '',
      variant_sku: warrantyDetail.variant?.sku || '',
      warranty_start_date: warrantyDetail.warranty_start_date ? dayjs(warrantyDetail.warranty_start_date) : null,
      warranty_end_date: warrantyDetail.warranty_end_date ? dayjs(warrantyDetail.warranty_end_date) : null,
      warranty_period: warrantyDetail.warranty_period,
      serial_number: warrantyDetail.serial_number,
      status: warrantyDetail.status,
      notes: warrantyDetail.notes,
    });
    setModalVisible(true);
  };

  const handleViewDetail = async (record) => {
    setDetailLoading(true);
    const warrantyDetail = await fetchWarrantyDetail(record.id);
    setDetailLoading(false);
    
    if (!warrantyDetail) return;
    
    setSelectedWarranty(warrantyDetail);
    setDetailModalVisible(true);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setDateRange(null);
    setSelectedOrder(null);
    setSelectedProduct(null);
    setCustomerName('');
    setCustomerPhone('');
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'EXPIRED':
        return 'red';
      case 'CLAIMED':
        return 'orange';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang bảo hành';
      case 'EXPIRED':
        return 'Hết hạn';
      case 'CLAIMED':
        return 'Đã khiếu nại';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Mã bảo hành',
      dataIndex: 'warranty_number',
      key: 'warranty_number',
      width: 150,
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product_name',
      width: 200,
      render: (text, record) => (
        <div>
          <div className="warranty-product-name">{record.product?.name || text}</div>
          <div className="warranty-product-sku">SKU: {record.variant?.sku || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="warranty-customer-name">{record.customer_name || ''}</div>
          <div className="warranty-customer-phone">{record.customer_phone || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'warranty_start_date',
      key: 'warranty_start_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'warranty_end_date',
      key: 'warranty_end_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Số ngày còn lại',
      key: 'remaining_days',
      width: 120,
      render: (_, record) => {
        if (record.remaining_days !== undefined) {
          const color = record.remaining_days <= 30 ? 'red' : record.remaining_days <= 90 ? 'orange' : 'green';
          return (
            <Tag color={color}>
              {record.remaining_days} ngày
            </Tag>
          );
        }
        return 'N/A';
      },
    },
    {
      title: 'Số serial',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 120,
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
      title: 'Thời hạn',
      dataIndex: 'warranty_period',
      key: 'warranty_period',
      width: 100,
      render: (period) => period ? `${period} tháng` : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              loading={detailLoading}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              loading={detailLoading}
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
    <div className="warranty-page" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          Quản lý bảo hành
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Quản lý và theo dõi tất cả bảo hành sản phẩm
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng bảo hành"
              value={statistics.total_warranties}
              suffix="bảo hành"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Đang bảo hành"
              value={statistics.active_warranties}
              valueStyle={{ color: '#52c41a' }}
              suffix="bảo hành"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Hết hạn"
              value={statistics.expired_warranties}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="bảo hành"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Đã khiếu nại"
              value={statistics.claimed_warranties}
              valueStyle={{ color: '#faad14' }}
              suffix="bảo hành"
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
            <Tooltip title="Tìm kiếm tổng hợp theo mã bảo hành, số serial, tên khách hàng, số điện thoại">
              <Input.Search
                placeholder="Tìm kiếm tổng hợp..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchWarranties()}
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
                  placeholder="Trạng thái bảo hành"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="ACTIVE">Đang bảo hành</Option>
                  <Option value="EXPIRED">Hết hạn</Option>
                  <Option value="CLAIMED">Đã khiếu nại</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
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
              <Col xs={24} sm={12} md={8}>
                <AutoComplete
                  options={productOptions}
                  onSearch={searchProducts}
                  onChange={(value) => setSelectedProduct(value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Số điện thoại khách hàng"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
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
          Thêm bảo hành mới
        </Button>
      </div>

      {/* Table */}
      <div className="table-section" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table
          columns={columns}
          dataSource={warranties}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} bảo hành`,
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
          scroll={{ x: 1200 }}
          className="admin-table"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? "Sửa bảo hành" : "Thêm bảo hành mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={800}
        className="warranty-edit-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {editingId && (
            <>
              {/* Thông tin hiển thị (chỉ đọc) */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="Mã bảo hành">
                    <Input 
                      value={form.getFieldValue('warranty_number')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Mã đơn hàng">
                    <Input 
                      value={form.getFieldValue('order_number')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="Tên khách hàng">
                    <Input 
                      value={form.getFieldValue('customer_name')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số điện thoại">
                    <Input 
                      value={form.getFieldValue('customer_phone')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="Sản phẩm">
                    <Input 
                      value={form.getFieldValue('product_name')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="SKU">
                    <Input 
                      value={form.getFieldValue('variant_sku')} 
                      disabled 
                      className="warranty-form-disabled"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {!editingId && (
            <Form.Item
              name="order_detail"
              label="Đơn hàng chi tiết"
              rules={[{ required: true, message: 'Vui lòng chọn đơn hàng chi tiết' }]}
            >
              <AutoComplete
                options={orderOptions}
                onSearch={searchOrders}
                placeholder="Tìm kiếm đơn hàng..."
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="warranty_start_date"
                label="Ngày bắt đầu bảo hành"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warranty_end_date"
                label="Ngày kết thúc bảo hành"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="serial_number"
                label="Số serial"
                rules={[{ required: true, message: 'Vui lòng nhập số serial' }]}
              >
                <Input placeholder="Nhập số serial" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warranty_period"
                label="Thời hạn bảo hành (tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập thời hạn bảo hành' }]}
              >
                <InputNumber 
                  min={1} 
                  max={60} 
                  style={{ width: '100%' }} 
                  placeholder="Nhập số tháng"
                />
              </Form.Item>
            </Col>
          </Row>

          {editingId && (
            <Form.Item
              name="status"
              label="Trạng thái bảo hành"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">Đang bảo hành</Option>
                <Option value="EXPIRED">Hết hạn</Option>
                <Option value="CLAIMED">Đã khiếu nại</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
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
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết bảo hành"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {selectedWarranty && (
          <div className="warranty-detail-modal">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="warranty-detail-section">
                  <h4>Thông tin bảo hành</h4>
                  <div className="warranty-detail-item"><strong>Mã bảo hành:</strong> {selectedWarranty.warranty_number}</div>
                  <div className="warranty-detail-item"><strong>Trạng thái:</strong> <Tag color={getStatusColor(selectedWarranty.status)} style={{ marginLeft: '8px' }}>{getStatusText(selectedWarranty.status)}</Tag></div>
                  <div className="warranty-detail-item"><strong>Ngày bắt đầu:</strong> {selectedWarranty.warranty_start_date ? dayjs(selectedWarranty.warranty_start_date).format('DD/MM/YYYY') : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Ngày kết thúc:</strong> {selectedWarranty.warranty_end_date ? dayjs(selectedWarranty.warranty_end_date).format('DD/MM/YYYY') : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Thời hạn:</strong> {selectedWarranty.warranty_period ? `${selectedWarranty.warranty_period} tháng` : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Số ngày còn lại:</strong> {selectedWarranty.remaining_days !== undefined ? (<Tag color={selectedWarranty.remaining_days <= 30 ? 'red' : selectedWarranty.remaining_days <= 90 ? 'orange' : 'green'}>{selectedWarranty.remaining_days} ngày</Tag>) : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Số serial:</strong> {selectedWarranty.serial_number || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Ghi chú:</strong> {selectedWarranty.notes || 'Không có ghi chú'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="warranty-detail-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="warranty-detail-item"><strong>Mã đơn hàng:</strong> {selectedWarranty.order_detail?.order?.order_number || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>ID đơn hàng:</strong> {selectedWarranty.order_detail?.order?.id || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Số lượng:</strong> {selectedWarranty.order_detail?.quantity || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Đơn giá:</strong> {selectedWarranty.order_detail?.unit_price ? `${parseFloat(selectedWarranty.order_detail.unit_price).toLocaleString('vi-VN')} VNĐ` : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Giá cuối:</strong> {selectedWarranty.order_detail?.final_price ? `${parseFloat(selectedWarranty.order_detail.final_price).toLocaleString('vi-VN')} VNĐ` : 'N/A'}</div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <div className="warranty-detail-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="warranty-detail-item"><strong>ID khách hàng:</strong> {selectedWarranty.order_detail?.order?.customer?.id || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Họ tên:</strong> {selectedWarranty.order_detail?.order?.customer ? `${selectedWarranty.order_detail.order.customer.first_name} ${selectedWarranty.order_detail.order.customer.last_name}` : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Số điện thoại:</strong> {selectedWarranty.order_detail?.order?.customer?.phone || 'N/A'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="warranty-detail-section">
                  <h4>Thông tin sản phẩm</h4>
                  <div className="warranty-detail-item"><strong>ID sản phẩm:</strong> {selectedWarranty.product?.id || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Tên sản phẩm:</strong> {selectedWarranty.product?.name || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Mô tả:</strong> {selectedWarranty.product?.description || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Danh mục:</strong> {selectedWarranty.product?.category?.name || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Thương hiệu:</strong> {selectedWarranty.product?.brand?.name || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>SKU:</strong> {selectedWarranty.variant?.sku || 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Điều chỉnh giá:</strong> {selectedWarranty.variant?.price_adjustment ? `${parseFloat(selectedWarranty.variant.price_adjustment).toLocaleString('vi-VN')} VNĐ` : 'N/A'}</div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={24}>
                <div className="warranty-detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="warranty-detail-item"><strong>Ngày tạo:</strong> {selectedWarranty.created_at ? dayjs(selectedWarranty.created_at).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Ngày cập nhật:</strong> {selectedWarranty.updated_at ? dayjs(selectedWarranty.updated_at).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}</div>
                  <div className="warranty-detail-item"><strong>Trạng thái hoạt động:</strong> <Tag color={selectedWarranty.is_active ? 'green' : 'red'}>{selectedWarranty.is_active ? 'Hoạt động' : 'Không hoạt động'}</Tag></div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarrantyPage; 