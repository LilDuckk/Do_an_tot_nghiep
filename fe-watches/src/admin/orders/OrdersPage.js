import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
  InputNumber,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ORDER_ENDPOINTS, STORE_ENDPOINTS, PRODUCT_ENDPOINTS, CUSTOMER_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

const { Option } = Select;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetailForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [editingOrderDetail, setEditingOrderDetail] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const userEmployeeId = user.employee_id || null;
  const userStoreId = user.store_id || null;

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (debouncedSearchText) {
        queryParams.append('customer_first_name', debouncedSearchText);
      }
      
      const response = await fetch(`${ORDER_ENDPOINTS.ORDERS}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setOrders([]);
        return;
      }

      const data = await response.json();
      setOrders(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText]);

  const searchCustomers = async (searchText) => {
    try {
      setCustomerSearchLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${CUSTOMER_ENDPOINTS.CUSTOMERS}?search=${searchText}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomers(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm khách hàng');
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearchText) {
        searchCustomers(customerSearchText);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customerSearchText]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
      setStores([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.EMPLOYEES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên');
      setEmployees([]);
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
      console.log('Variants data:', data);
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách biến thể');
      setVariants([]);
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(ORDER_ENDPOINTS.COUPONS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCoupons(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách mã giảm giá');
      setCoupons([]);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setOrderDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${ORDER_ENDPOINTS.ORDER_DETAILS}?order=${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrderDetails(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn hàng');
      setOrderDetails([]);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStores();
    fetchEmployees();
    fetchProducts();
    fetchCoupons();
  }, [fetchOrders]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        customer: values.customer || null,
        store: isSuperUser ? values.store : userStoreId,
        employee_id: isSuperUser ? values.employee : userEmployeeId,
        order_date: values.order_date ? values.order_date.format('YYYY-MM-DDTHH:mm:ss[Z]') : null,
        status: values.status || null,
        payment_method: values.payment_method || null,
        payment_status: values.payment_status || null,
        shipping_address: values.shipping_address || null,
        shipping_method: values.shipping_method || null,
        tracking_number: values.tracking_number || null,
        subtotal: values.subtotal ? parseFloat(values.subtotal).toFixed(2) : "0.00",
        tax: values.tax ? parseFloat(values.tax).toFixed(2) : "0.00",
        shipping_fee: values.shipping_fee ? parseFloat(values.shipping_fee).toFixed(2) : "0.00",
        discount: values.discount ? parseFloat(values.discount).toFixed(2) : "0.00",
        total_amount: values.total_amount ? parseFloat(values.total_amount).toFixed(2) : "0.00",
        note: values.note || null,
        is_online_order: values.is_online_order || false,
        order_details: orderDetails.map(detail => ({
          id: detail.id,
          product_variant: detail.variant?.id || detail.product_variant,
          quantity: detail.quantity,
          coupon_id: detail.coupon?.id || null
        }))
      };

      if (editingId) {
        const response = await fetch(`${ORDER_ENDPOINTS.ORDERS}${editingId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật đơn hàng này.');
          return;
        }

        message.success('Cập nhật đơn hàng thành công');
      } else {
        const response = await fetch(ORDER_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo đơn hàng mới.');
          return;
        }

        message.success('Tạo đơn hàng thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setOrderDetails([]);
      if (!isSuperUser) {
        form.setFieldsValue({
          employee: userEmployeeId,
          store: userStoreId
        });
        filterEmployeesByStore(userStoreId);
      }
      fetchOrders();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(ORDER_ENDPOINTS.ORDER_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa đơn hàng này.');
        return;
      }

      message.success('Xóa đơn hàng thành công');
      fetchOrders();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
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
      const orderDetailData = {
        product_variant: values.product_variant,
        quantity: values.quantity,
        coupon_id: values.coupon_id || null
      };

      if (editingOrderDetail) {
        // Update
        const response = await fetch(ORDER_ENDPOINTS.ORDER_DETAIL_ITEM(editingOrderDetail.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...orderDetailData,
            id: editingOrderDetail.id
          }),
        });
        if (response.status === 403) {
          message.error('Bạn không có quyền sửa chi tiết đơn hàng.');
          return;
        }
        message.success('Cập nhật chi tiết đơn hàng thành công');
      } else {
        // Thêm mới
        const response = await fetch(ORDER_ENDPOINTS.ORDER_DETAILS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...orderDetailData,
            order: selectedOrderId
          }),
        });
        if (response.status === 403) {
          message.error('Bạn không có quyền thêm chi tiết đơn hàng.');
          return;
        }
        message.success('Thêm chi tiết đơn hàng thành công');
      }
      return true; // Trả về true nếu thêm/sửa thành công
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm/sửa chi tiết đơn hàng');
      return false; // Trả về false nếu có lỗi
    }
  };

  const handleDeleteOrderDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(ORDER_ENDPOINTS.ORDER_DETAIL_ITEM(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa chi tiết đơn hàng này.');
        return;
      }

      message.success('Xóa chi tiết đơn hàng thành công');
      fetchOrderDetails(selectedOrderId);
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa chi tiết đơn hàng');
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
      dataIndex: 'variant',
      key: 'product_name',
      render: (variant) => variant?.product_name || '-',
    },
    {
      title: 'SKU',
      dataIndex: 'variant',
      key: 'sku',
      render: (variant) => variant?.sku || '-',
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
      dataIndex: 'final_price',
      key: 'final_price',
      render: (total) => formatCurrency(total),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingOrderDetail(record);
              const productId = record.variant?.product || record.product?.id;
              setSelectedProductId(productId);
              fetchVariants(productId).then(() => {
                orderDetailForm.setFieldsValue({
                  product: productId,
                  product_variant: record.variant?.id || record.product_variant,
                  quantity: record.quantity,
                  coupon_id: record.coupon?.id || null,
                });
                setSelectedVariant(record.variant || null);
              });
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteOrderDetail(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = async (record) => {
    try {
      setEditingId(record.id);
      const token = localStorage.getItem('accessToken');
      
      // Lấy thông tin chi tiết đơn hàng
      const response = await fetch(`${ORDER_ENDPOINTS.ORDERS}${record.id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        message.error('Bạn không có quyền xem thông tin đơn hàng này.');
        return;
      }

      const orderData = await response.json();
      
      // Lọc nhân viên theo cửa hàng
      if (orderData.store) {
        filterEmployeesByStore(orderData.store);
      }

      // Set giá trị cho form
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

      setModalVisible(true);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lấy thông tin đơn hàng');
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_first_name',
      key: 'customer_first_name',
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'pending': 'Chờ xử lý',
          'processing': 'Đang xử lý',
          'shipped': 'Đã giao hàng',
          'delivered': 'Đã nhận hàng',
          'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        const methodMap = {
          'cash': 'Tiền mặt',
          'credit_card': 'Thẻ tín dụng',
          'bank_transfer': 'Chuyển khoản'
        };
        return methodMap[method] || '-';
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employee',
      key: 'employee',
      render: (employee) => employee || '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              setSelectedOrderId(record.id);
              fetchOrderDetails(record.id);
              setOrderDetailModalVisible(true);
            }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <div className="admin-list-header">
        <h2>Quản lý đơn hàng</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm theo tên khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setOrderDetails([]);
              if (!isSuperUser) {
                form.setFieldsValue({
                  employee: userEmployeeId,
                  store: userStoreId
                });
                filterEmployeesByStore(userStoreId);
              }
              setModalVisible(true);
            }}
          >
            Thêm đơn hàng
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        className="orders-table"
      />

      <Modal
        title={editingId ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="customer"
            label="Khách hàng"
          >
            <Select
              showSearch
              allowClear
              loading={customerSearchLoading}
              placeholder="Nhập tên khách hàng để tìm kiếm"
              filterOption={false}
              onSearch={setCustomerSearchText}
              notFoundContent={customerSearchLoading ? <Spin size="small" /> : null}
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {`${customer.first_name} ${customer.last_name} - ${customer.phone}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="store"
            label="Cửa hàng"
          >
            <Select 
              allowClear
              onChange={(storeId) => {
                filterEmployeesByStore(storeId);
                // Reset employee field when store changes
                form.setFieldsValue({ employee: undefined });
              }}
            >
              {stores.map(store => (
                <Option key={store.id} value={store.id}>
                  {store.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="employee"
            label="Nhân viên"
          >
            <Select
              showSearch
              allowClear
              placeholder="Tìm kiếm nhân viên"
              filterOption={(input, option) =>
                (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={!isSuperUser || !form.getFieldValue('store')}
              value={isSuperUser ? undefined : userEmployeeId}
            >
              {filteredEmployees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name
                    || [employee.first_name, employee.last_name].filter(Boolean).join(' ')
                    || employee.employee_code
                    || (employee.user_details && employee.user_details.username)
                    || ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="order_date"
            label="Ngày đặt hàng"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select allowClear>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="shipped">Đã giao hàng</Option>
              <Option value="delivered">Đã nhận hàng</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Phương thức thanh toán"
          >
            <Select allowClear>
              <Option value="cash">Tiền mặt</Option>
              <Option value="credit_card">Thẻ tín dụng</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_status"
            label="Trạng thái thanh toán"
          >
            <Select allowClear>
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="failed">Thanh toán thất bại</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="shipping_address"
            label="Địa chỉ giao hàng"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="shipping_method"
            label="Phương thức vận chuyển"
          >
            <Select allowClear>
              <Option value="standard">Tiêu chuẩn</Option>
              <Option value="express">Nhanh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tracking_number"
            label="Mã vận đơn"
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="subtotal"
            label="Tổng tiền hàng"
          >
            <Input type="number" min={0} step={0.01} disabled />
          </Form.Item>

          <Form.Item
            name="tax"
            label="Thuế"
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="shipping_fee"
            label="Phí vận chuyển"
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Giảm giá"
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Tổng tiền"
          >
            <Input type="number" min={0} step={0.01} disabled />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="is_online_order"
            label="Đơn hàng online"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết đơn hàng"
        open={orderDetailModalVisible}
        onCancel={() => {
          setOrderDetailModalVisible(false);
          setEditingOrderDetail(null);
          setSelectedProductId(null);
          setSelectedVariant(null);
          setShowAddProductForm(false);
          orderDetailForm.resetFields();
          fetchOrders();
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
                    quantity: undefined 
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
                  <Option key={product.id} value={product.id}>
                    {product.name}
                  </Option>
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
                  orderDetailForm.setFieldsValue({ quantity: 1 });
                }}
                value={orderDetailForm.getFieldValue('product_variant')}
              >
                {variants.map(variant => (
                  <Option key={variant.id} value={variant.id}>
                    {variant.attribute_values_detail?.map(attr => 
                      `${attr.attribute_type.name}: ${attr.value}`
                    ).join(', ')}
                  </Option>
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
              name="coupon_id"
              label="Mã giảm giá"
            >
              <Select
                placeholder="Chọn mã giảm giá (không bắt buộc)"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {coupons.map(coupon => (
                  <Option key={coupon.id} value={coupon.id}>
                    {`${coupon.code} - ${coupon.discount_value}%`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Thêm vào đơn hàng
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

export default OrdersPage; 