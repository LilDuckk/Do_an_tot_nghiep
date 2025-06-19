import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, message, Modal, Form, Select, DatePicker, Card, Row, Col, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { PURCHASE_ENDPOINTS, SUPPLIER_ENDPOINTS, STORE_ENDPOINTS, EMPLOYEE_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { RangePicker } = DatePicker;

// Hàm lấy string đầu tiên từ object/array
function extractFirstString(obj) {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = extractFirstString(item);
      if (found) return found;
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const found = extractFirstString(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

const GoodsReceiptsPage = () => {
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
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [storeFilter, setStoreFilter] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [totalAmountRange, setTotalAmountRange] = useState([null, null]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const currentEmployeeId = currentUser.employee_id || currentUser.id;
  const currentStoreId = currentUser.store_id || null;
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchSuppliers();
    fetchStores();
    fetchEmployees().then(() => {
      if (!isSuperUser && currentStoreId) filterEmployeesByStore(currentStoreId);
    });
    fetchPurchaseOrders();
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
  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDERS, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders(data.results || []);
      }
    } catch {}
  };

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
        params.append('receipt_date_from', dateRange[0]?.format('YYYY-MM-DD'));
        params.append('receipt_date_to', dateRange[1]?.format('YYYY-MM-DD'));
      }
      if (totalAmountRange[0]) params.append('total_amount_min', totalAmountRange[0]);
      if (totalAmountRange[1]) params.append('total_amount_max', totalAmountRange[1]);
      const url = `${PURCHASE_ENDPOINTS.GOODS_RECEIPTS}?${params.toString()}`;
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
  const handleEdit = (record) => {
    setEditing(record);
    setModalVisible(true);
  };
  const handleDelete = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa phiếu nhập hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: record.receipt_number,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(record.id), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error('Xóa thất bại');
          message.success('Đã xóa phiếu nhập hàng');
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
      if (values.receipt_date) values.receipt_date = values.receipt_date.format('YYYY-MM-DD');
      if (!isSuperUser) {
        values.employee = currentEmployeeId;
        values.store = currentStoreId;
      }
      const token = localStorage.getItem('accessToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(editing.id) : PURCHASE_ENDPOINTS.GOODS_RECEIPTS;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values)
      });
      if (!res.ok) {
        let errorMsg = 'Có lỗi xảy ra';
        try {
          const errorData = await res.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              // Nếu là string dạng object Python repr, dùng regex lấy chuỗi trong ErrorDetail(string='...')
              const regex = /ErrorDetail\(string='([^']+)'/;
              const match = errorData.detail.match(regex);
              if (match && match[1]) errorMsg = match[1];
              else errorMsg = errorData.detail;
            } else {
              const extracted = extractFirstString(errorData.detail);
              if (extracted) errorMsg = extracted;
            }
          }
        } catch {}
        message.error(errorMsg);
        return;
      }
      message.success(editing ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Mã phiếu nhập', dataIndex: 'receipt_number', key: 'receipt_number', render: (text) => <b>{text}</b> },
    { title: 'Nhà cung cấp', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: 'Cửa hàng', dataIndex: 'store_name', key: 'store_name' },
    { title: 'Nhân viên', dataIndex: 'employee_name', key: 'employee_name' },
    { title: 'Đơn đặt hàng', dataIndex: 'purchase_order_number', key: 'purchase_order_number' },
    { title: 'Ngày nhập kho', dataIndex: 'receipt_date', key: 'receipt_date', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color="default">{status}</Tag> },
    { title: 'Thanh toán', dataIndex: 'payment_status', key: 'payment_status', render: (status) => <Tag color="default">{status}</Tag> },
    { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', render: (amount) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
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

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý phiếu nhập hàng</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp, cửa hàng..."
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
                <Select.Option value="confirmed">Đã xác nhận</Select.Option>
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
        title={editing ? 'Chỉnh sửa phiếu nhập hàng' : 'Thêm phiếu nhập hàng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText={editing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnHidden
        width={800}
        afterOpenChange={(open) => {
          if (open && !editing) form.resetFields();
          if (open && editing) form.setFieldsValue({ ...editing, receipt_date: editing.receipt_date ? dayjs(editing.receipt_date) : null });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'draft', payment_status: 'pending' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchase_order" label="Đơn đặt hàng" rules={[{ required: true, message: 'Chọn đơn đặt hàng' }]}>
                <Select placeholder="Chọn đơn đặt hàng" showSearch>
                  {purchaseOrders.map(order => (
                    <Select.Option key={order.id} value={order.id}>{order.po_number}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplier" label="Nhà cung cấp" rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}>
                <Select placeholder="Chọn nhà cung cấp" showSearch>
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>{supplier.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="store" label="Cửa hàng" rules={[{ required: true, message: 'Chọn cửa hàng' }]}>
                <Select 
                  placeholder="Chọn cửa hàng" 
                  showSearch
                  disabled={!isSuperUser}
                  onChange={(storeId) => {
                    filterEmployeesByStore(storeId);
                    if (isSuperUser) form.setFieldsValue({ employee: undefined });
                  }}
                  value={isSuperUser ? undefined : currentStoreId}
                >
                  {stores.map(store => (
                    <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="receipt_date" label="Ngày nhập kho" rules={[{ required: true, message: 'Chọn ngày nhập kho' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Select.Option value="draft">Nháp</Select.Option>
                  <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                  <Select.Option value="cancelled">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
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
          <Form.Item name="delivery_note" label="Số phiếu giao hàng">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="vehicle_number" label="Biển số xe">
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="driver_name" label="Tên tài xế">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Form.Item name="employee" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên' }]}> 
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              allowClear
              disabled={!isSuperUser || !form.getFieldValue('store')}
              value={isSuperUser ? undefined : currentEmployeeId}
              filterOption={(input, option) => (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {filteredEmployees.map(employee => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.name || [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.employee_code || (employee.user_details && employee.user_details.username) || ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GoodsReceiptsPage; 