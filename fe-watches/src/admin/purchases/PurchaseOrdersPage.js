import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, message, Modal, Form, Select, DatePicker, Card, Row, Col, InputNumber, Spin, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PURCHASE_ENDPOINTS, SUPPLIER_ENDPOINTS, STORE_ENDPOINTS, EMPLOYEE_ENDPOINTS, PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { RangePicker } = DatePicker;

const PurchaseOrdersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [storeFilter, setStoreFilter] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [totalAmountRange, setTotalAmountRange] = useState([null, null]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // State cho chi tiết đơn đặt hàng
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetailForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [editingOrderDetail, setEditingOrderDetail] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  // Lấy thông tin user từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const currentEmployeeId = currentUser.employee_id || currentUser.id;
  const currentStoreId = currentUser.store_id || null;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchSuppliers();
    fetchStores();
    fetchEmployees();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(SUPPLIER_ENDPOINTS.SUPPLIERS_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setSuppliers(await res.json());
    } catch {}
  };
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setStores(await res.json());
    } catch {}
  };
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(EMPLOYEE_ENDPOINTS.EMPLOYEES_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setEmployees(await res.json());
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCTS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    }
  };

  const fetchVariants = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(productId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách biến thể');
      setVariants([]);
    }
  };

  // Thêm hàm lọc nhân viên theo cửa hàng
  const filterEmployeesByStore = (storeId) => {
    if (!storeId) {
      setFilteredEmployees([]);
      return;
    }
    const filtered = employees.filter(emp => emp.store === storeId);
    setFilteredEmployees(filtered);
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (supplierFilter) params.append('supplier', supplierFilter);
      if (storeFilter) params.append('store', storeFilter);
      if (employeeFilter) params.append('employee', employeeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('payment_status', paymentStatusFilter);
      if (dateRange && dateRange.length === 2) {
        params.append('order_date_from', dateRange[0]?.format('YYYY-MM-DD'));
        params.append('order_date_to', dateRange[1]?.format('YYYY-MM-DD'));
      }
      if (totalAmountRange[0]) params.append('total_amount_min', totalAmountRange[0]);
      if (totalAmountRange[1]) params.append('total_amount_max', totalAmountRange[1]);
      const url = `${PURCHASE_ENDPOINTS.PURCHASE_ORDERS}?${params.toString()}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách');
      const data = await res.json();
      setData(data.results || []);
      setPagination({ current: page, pageSize, total: data.count });
    } catch (err) {
      message.error(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setOrderDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAILS}?purchase_order=${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrderDetails(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn đặt hàng');
      setOrderDetails([]);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
    // eslint-disable-next-line
  }, [debouncedSearch, supplierFilter, storeFilter, employeeFilter, statusFilter, paymentStatusFilter, dateRange, totalAmountRange]);

  const handleTableChange = (pag) => {
    setPagination(pag);
    fetchData(pag.current, pag.pageSize);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAIL(record.id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không lấy được thông tin đơn đặt hàng');
      const detail = await res.json();
      setEditing(detail);
      setModalVisible(true);
      // Lọc nhân viên theo cửa hàng trước khi set form
      if (detail.store) filterEmployeesByStore(detail.store);
      form.setFieldsValue({
        ...detail,
        order_date: detail.order_date ? dayjs(detail.order_date) : null,
        expected_delivery_date: detail.expected_delivery_date ? dayjs(detail.expected_delivery_date) : null,
        employee: detail.employee || detail.employee_id || null,
        store: detail.store || null,
        supplier: detail.supplier || null,
        status: detail.status || 'draft',
        payment_status: detail.payment_status || 'pending',
      });
    } catch (err) {
      message.error(err.message || 'Lỗi khi lấy thông tin đơn đặt hàng');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa đơn đặt hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: record.po_number,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAIL(record.id), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error('Xóa thất bại');
          message.success('Đã xóa đơn đặt hàng');
          fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
          message.error('Không thể xóa');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.order_date) values.order_date = values.order_date.format('YYYY-MM-DD');
      if (values.expected_delivery_date) values.expected_delivery_date = values.expected_delivery_date.format('YYYY-MM-DD');
      
      // Tự động điền employee ID nếu không phải superuser
      if (!isSuperUser && !values.employee) {
        values.employee = currentEmployeeId;
      }
      
      const token = localStorage.getItem('accessToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAIL(editing.id) : PURCHASE_ENDPOINTS.PURCHASE_ORDERS;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error(editing ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
      message.success(editing ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message);
    }
  };

  const handleProductChange = (productId) => {
    if (productId) {
      fetchVariants(productId);
    } else {
      setVariants([]);
    }
  };

  const handleOrderDetailSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Kiểm tra selectedOrderId
      if (!selectedOrderId) {
        message.error('Không tìm thấy ID đơn đặt hàng');
        console.error('selectedOrderId is null or undefined');
        return false;
      }
      
      console.log('Form values:', values);
      console.log('selectedOrderId:', selectedOrderId);
      console.log('Type of selectedOrderId:', typeof selectedOrderId);
      
      const baseData = {
        product_variant: values.product_variant,
        quantity: values.quantity,
        unit_price: values.unit_price || 0,
        discount_percent: "0.00", // Mặc định 0%
        tax_percent: "0.00", // Mặc định 0%
        notes: values.notes || ""
      };

      if (editingOrderDetail) {
        // Update
        const response = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAIL_ITEM(editingOrderDetail.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...baseData,
            id: editingOrderDetail.id
          }),
        });
        if (response.status === 403) {
          message.error('Bạn không có quyền sửa chi tiết đơn đặt hàng.');
          return false;
        }
        message.success('Cập nhật chi tiết đơn đặt hàng thành công');
      } else {
        // Thêm mới - sử dụng trường purchase_order theo API spec trong exp.txt
        const requestData = {
          ...baseData,
          purchase_order: selectedOrderId
        };
        
        console.log('Sending purchase order detail data:', requestData);
        console.log('Selected Order ID:', selectedOrderId);
        console.log('Current Employee ID:', currentEmployeeId);
        
        const response = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAILS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData),
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          message.error(`Lỗi: ${errorData.detail || 'Không thể thêm chi tiết đơn đặt hàng'}`);
          return false;
        }
        
        if (response.status === 403) {
          message.error('Bạn không có quyền thêm chi tiết đơn đặt hàng.');
          return false;
        }
        message.success('Thêm chi tiết đơn đặt hàng thành công');
      }
      return true; // Trả về true nếu thêm/sửa thành công
    } catch (error) {
      console.error('Error in handleOrderDetailSubmit:', error);
      message.error('Có lỗi xảy ra khi thêm/sửa chi tiết đơn đặt hàng');
      return false; // Trả về false nếu có lỗi
    }
  };

  const handleDeleteOrderDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAIL_ITEM(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa chi tiết đơn đặt hàng này.');
        return;
      }

      message.success('Xóa chi tiết đơn đặt hàng thành công');
      fetchOrderDetails(selectedOrderId);
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa chi tiết đơn đặt hàng');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `${parseFloat(amount).toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}đ`;
  };

  const orderDetailColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product_variant_info',
      key: 'product_name',
      render: (info) => info?.product_name || '-',
    },
    {
      title: 'SKU',
      dataIndex: 'product_variant_info',
      key: 'sku',
      render: (info) => info?.sku || '-',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (_, record) => formatCurrency(record.quantity * record.unit_price),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            className="action-btn"
            onClick={() => {
              setEditingOrderDetail(record);
              const productId = record.variant?.product || record.product?.id;
              setSelectedProductId(productId);
              fetchVariants(productId).then(() => {
                orderDetailForm.setFieldsValue({
                  product: productId,
                  product_variant: record.variant?.id || record.product_variant,
                  quantity: record.quantity,
                  unit_price: record.unit_price,
                  notes: record.notes || ""
                });
                setSelectedVariant(record.variant || null);
              });
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteOrderDetail(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} className="action-btn" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = [
    { title: 'Mã đơn hàng', dataIndex: 'po_number', key: 'po_number', render: (text) => <b>{text}</b> },
    { title: 'Nhà cung cấp', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: 'Cửa hàng', dataIndex: 'store_name', key: 'store_name' },
    { title: 'Nhân viên', dataIndex: 'employee_name', key: 'employee_name' },
    { title: 'Ngày đặt hàng', dataIndex: 'order_date', key: 'order_date', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Ngày giao dự kiến', dataIndex: 'expected_delivery_date', key: 'expected_delivery_date', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={statusTagColor(status)}>{statusVN[status] || status}</Tag> },
    { title: 'Thanh toán', dataIndex: 'payment_status', key: 'payment_status', render: (status) => <Tag color={paymentStatusTagColor(status)}>{paymentStatusVN[status] || status}</Tag> },
    { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', render: (amount) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="action-btn"
            onClick={() => {
              setSelectedOrderId(record.id);
              fetchOrderDetails(record.id);
              setOrderDetailModalVisible(true);
            }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="action-btn"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />} className="action-btn" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const clearFilters = () => {
    setSupplierFilter(null);
    setStoreFilter(null);
    setEmployeeFilter(null);
    setStatusFilter(null);
    setPaymentStatusFilter(null);
    setDateRange(null);
    setTotalAmountRange([null, null]);
  };

  // Thêm hàm ánh xạ trạng thái sang tiếng Việt
  const statusVN = {
    draft: 'Nháp',
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    ordered: 'Đã đặt hàng',
    receiving: 'Đang nhận hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  const paymentStatusVN = {
    pending: 'Chưa thanh toán',
    partial: 'Thanh toán một phần',
    paid: 'Đã thanh toán',
  };

  // Thêm hàm lấy màu tag trạng thái
  const statusTagColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'ordered': return 'cyan';
      case 'receiving': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };
  const paymentStatusTagColor = (status) => {
    switch (status) {
      case 'pending': return 'red';
      case 'partial': return 'blue';
      case 'paid': return 'green';
      default: return 'default';
    }
  };

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý đơn đặt hàng mua</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng, nhà cung cấp, cửa hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
          <Button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
        </div>
      </div>
      {showFilters && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Nhà cung cấp"
                value={supplierFilter}
                onChange={setSupplierFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {suppliers.map(supplier => (
                  <Select.Option key={supplier.id} value={supplier.id}>{supplier.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Cửa hàng"
                value={storeFilter}
                onChange={setStoreFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {stores.map(store => (
                  <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Nhân viên"
                value={employeeFilter}
                onChange={setEmployeeFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {employees.map(employee => (
                  <Select.Option key={employee.id} value={employee.id}>{employee.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="draft">Nháp</Select.Option>
                <Select.Option value="pending">Chờ xác nhận</Select.Option>
                <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                <Select.Option value="ordered">Đã đặt hàng</Select.Option>
                <Select.Option value="receiving">Đang nhận hàng</Select.Option>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Trạng thái thanh toán"
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="pending">Chưa thanh toán</Select.Option>
                <Select.Option value="partial">Thanh toán một phần</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Group compact>
                <Input
                  placeholder="Từ"
                  value={totalAmountRange[0]}
                  onChange={e => setTotalAmountRange([e.target.value, totalAmountRange[1]])}
                  style={{ width: '50%' }}
                />
                <Input
                  placeholder="Đến"
                  value={totalAmountRange[1]}
                  onChange={e => setTotalAmountRange([totalAmountRange[0], e.target.value])}
                  style={{ width: '50%' }}
                />
              </Input.Group>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button onClick={clearFilters} style={{ width: '100%' }}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      )}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        className="admin-table"
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
      <Modal
        title={editing ? 'Chỉnh sửa đơn đặt hàng' : 'Thêm đơn đặt hàng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText={editing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnHidden
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'draft', payment_status: 'pending' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplier" label="Nhà cung cấp" rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}>
                <Select placeholder="Chọn nhà cung cấp" showSearch>
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>{supplier.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="store" label="Cửa hàng" rules={[{ required: true, message: 'Chọn cửa hàng' }]}>
                <Select 
                  placeholder="Chọn cửa hàng" 
                  showSearch
                  onChange={(storeId) => {
                    filterEmployeesByStore(storeId);
                    // Reset employee field when store changes
                    form.setFieldsValue({ employee: undefined });
                  }}
                >
                  {stores.map(store => (
                    <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employee" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên' }]}>
                <Select
                  placeholder="Chọn nhân viên"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={!isSuperUser || !form.getFieldValue('store')}
                >
                  {filteredEmployees.map(employee => (
                    <Select.Option key={employee.id} value={employee.id}>
                      {employee.name
                        || [employee.first_name, employee.last_name].filter(Boolean).join(' ')
                        || employee.employee_code
                        || (employee.user_details && employee.user_details.username)
                        || ''}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="order_date" label="Ngày đặt hàng" rules={[{ required: true, message: 'Chọn ngày đặt hàng' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expected_delivery_date" label="Ngày giao dự kiến" rules={[
                { required: true, message: 'Chọn ngày giao dự kiến' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('order_date')) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue('order_date'), 'day')) {
                      return Promise.reject(new Error('Ngày giao hàng dự kiến phải sau ngày đặt hàng'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Select.Option value="draft">Nháp</Select.Option>
                  <Select.Option value="pending">Chờ xác nhận</Select.Option>
                  <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                  <Select.Option value="ordered">Đã đặt hàng</Select.Option>
                  <Select.Option value="receiving">Đang nhận hàng</Select.Option>
                  <Select.Option value="completed">Hoàn thành</Select.Option>
                  <Select.Option value="cancelled">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="payment_status" label="Trạng thái thanh toán">
                <Select>
                  <Select.Option value="pending">Chưa thanh toán</Select.Option>
                  <Select.Option value="partial">Thanh toán một phần</Select.Option>
                  <Select.Option value="paid">Đã thanh toán</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="payment_terms" label="Điều khoản thanh toán">
            <Input.TextArea rows={2} maxLength={200} />
          </Form.Item>
          <Form.Item name="shipping_address" label="Địa chỉ giao hàng">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="shipping_method" label="Phương thức giao hàng">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết đơn đặt hàng */}
      <Modal
        title="Chi tiết đơn đặt hàng"
        open={orderDetailModalVisible}
        onCancel={() => {
          setOrderDetailModalVisible(false);
          setEditingOrderDetail(null);
          setSelectedProductId(null);
          setSelectedVariant(null);
          setShowAddProductForm(false);
          orderDetailForm.resetFields();
          fetchData(pagination.current, pagination.pageSize);
        }}
        footer={null}
        width={1200}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAddProductForm(true);
              setEditingOrderDetail(null);
              orderDetailForm.resetFields();
              setSelectedProductId(null);
              setVariants([]);
              setSelectedVariant(null);
            }}
          >
            Thêm sản phẩm
          </Button>
        </div>

        <Table
          columns={orderDetailColumns}
          dataSource={orderDetails}
          loading={orderDetailLoading}
          rowKey="id"
        />

        {showAddProductForm && (
          <Form
            form={orderDetailForm}
            onFinish={async (values) => {
              console.log('Form submitted with selectedOrderId:', selectedOrderId);
              const success = await handleOrderDetailSubmit(values);
              if (success) {
                // Chỉ reset form và cập nhật danh sách nếu thêm thành công
                orderDetailForm.resetFields();
                setSelectedProductId(null);
                setVariants([]);
                setSelectedVariant(null);
                fetchOrderDetails(selectedOrderId);
              }
            }}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="product"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                placeholder="Chọn sản phẩm"
                onChange={(productId) => {
                  setSelectedProductId(productId);
                  if (productId) {
                    fetchVariants(productId);
                  } else {
                    setVariants([]);
                  }
                  orderDetailForm.setFieldsValue({ 
                    product_variant: undefined,
                    quantity: undefined,
                    unit_price: undefined
                  });
                  setSelectedVariant(null);
                }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={selectedProductId}
              >
                {products.map(product => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="product_variant"
              label="Biến thể"
              rules={[{ required: true, message: 'Vui lòng chọn biến thể' }]}
            >
              <Select
                placeholder="Chọn biến thể"
                disabled={!selectedProductId || !variants.length}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(variantId) => {
                  const variant = variants.find(v => v.id === variantId);
                  setSelectedVariant(variant);
                  orderDetailForm.setFieldsValue({ 
                    quantity: 1,
                    unit_price: variant?.price_adjustment || 0
                  });
                }}
                value={orderDetailForm.getFieldValue('product_variant')}
              >
                {variants.map(variant => (
                  <Select.Option key={variant.id} value={variant.id}>
                    {variant.attribute_values_detail?.map(attr => 
                      `${attr.attribute_type.name}: ${attr.value}`
                    ).join(', ')}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedVariant && (
              <div style={{ marginBottom: 16, padding: 12, background: '#f6f6f6', borderRadius: 6 }}>
                <div><b>Tên sản phẩm:</b> {selectedVariant.product_name}</div>
                <div><b>SKU:</b> {selectedVariant.sku}</div>
                <div><b>Giá:</b> {selectedVariant.price_adjustment ? formatCurrency(selectedVariant.price_adjustment) : 'Không có'}</div>
                <div><b>Thuộc tính:</b> {selectedVariant.attribute_values_detail?.map(attr => `${attr.attribute_type.name}: ${attr.value}`).join(', ')}</div>
                {selectedVariant.images && selectedVariant.images.length > 0 && (
                  <img src={selectedVariant.images[0].image} alt="" style={{ maxWidth: 120, marginTop: 8 }} />
                )}
              </div>
            )}

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="unit_price"
              label="Đơn giá"
              rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <Input.TextArea rows={2} maxLength={200} placeholder="Ghi chú về sản phẩm này..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingOrderDetail ? 'Cập nhật' : 'Thêm vào đơn hàng'}
                </Button>
                <Button onClick={() => {
                  setShowAddProductForm(false);
                  orderDetailForm.resetFields();
                  setSelectedProductId(null);
                  setVariants([]);
                  setSelectedVariant(null);
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;
