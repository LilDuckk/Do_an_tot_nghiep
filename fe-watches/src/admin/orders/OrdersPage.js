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
      
      const response = await fetch(`http://localhost:8000/api/orders/orders/?${queryParams}`, {
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
      const response = await fetch(`http://localhost:8000/api/orders/customers/?search=${searchText}`, {
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

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/stores/employees/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmployees(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/products/products/', {
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
      const response = await fetch(`http://localhost:8000/api/products/variants/list_all/?product=${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Variants data:', data);
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách biến thể');
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/orders/coupons/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCoupons(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách mã giảm giá');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
    fetchProducts();
    fetchCoupons();
  }, [fetchOrders]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        customer: values.customer || null,
        store: values.store || null,
        employee: values.employee || null,
        order_date: values.order_date ? values.order_date.format('YYYY-MM-DD HH:mm:ss') : null,
        status: values.status || null,
        payment_method: values.payment_method || null,
        payment_status: values.payment_status || null,
        shipping_address: values.shipping_address || null,
        shipping_method: values.shipping_method || null,
        tracking_number: values.tracking_number || null,
        subtotal: parseFloat(values.subtotal) || 0,
        tax: parseFloat(values.tax) || 0,
        shipping_fee: parseFloat(values.shipping_fee) || 0,
        discount: parseFloat(values.discount) || 0,
        total_amount: parseFloat(values.total_amount) || 0,
        note: values.note || null,
        is_online_order: values.is_online_order || false
      };

      if (editingId) {
        const response = await fetch(`http://localhost:8000/api/orders/orders/${editingId}/`, {
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
        const response = await fetch('http://localhost:8000/api/orders/orders/', {
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
      fetchOrders();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/orders/orders/${id}/`, {
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

  const fetchOrderDetails = async (orderId) => {
    try {
      setOrderDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/orders/order-details/?order=${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrderDetails(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn hàng');
    } finally {
      setOrderDetailLoading(false);
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
      const response = await fetch('http://localhost:8000/api/orders/order-details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order: selectedOrderId,
          product_variant: values.product_variant,
          quantity: values.quantity,
          coupon_id: values.coupon_id || null
        }),
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền thêm chi tiết đơn hàng.');
        return;
      }

      message.success('Thêm chi tiết đơn hàng thành công');
      setOrderDetailModalVisible(false);
      orderDetailForm.resetFields();
      fetchOrderDetails(selectedOrderId);
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm chi tiết đơn hàng');
    }
  };

  const handleDeleteOrderDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/orders/order-details/${id}/`, {
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

  const orderDetailColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (product) => product?.name || '-',
    },
    {
      title: 'Biến thể',
      dataIndex: 'variant',
      key: 'variant',
      render: (variant) => {
        if (!variant) return '-';
        const attributes = variant.attribute_values_detail?.map(attr => 
          `${attr.attribute_type.name}: ${attr.value}`
        ).join(', ');
        return attributes || variant.sku || '-';
      },
    },
    {
      title: 'Mã biến thể',
      dataIndex: 'variant',
      key: 'variant_sku',
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
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount) => discount ? `${discount.toLocaleString('vi-VN')}đ` : '-',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDeleteOrderDetail(record.id)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_first_name',
      key: 'customer_first_name',
      render: (text, record) => record.customer_first_name || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `${amount.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
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
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue({
                ...record,
                order_date: record.order_date ? dayjs(record.order_date) : null,
              });
              setModalVisible(true);
            }}
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
            <Select allowClear>
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
            <Select allowClear>
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {`${employee.first_name} ${employee.last_name}`}
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
        onCancel={() => setOrderDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => orderDetailForm.resetFields()}
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

        <Form
          form={orderDetailForm}
          onFinish={handleOrderDetailSubmit}
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
              onChange={handleProductChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
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
              disabled={!variants.length}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {variants && variants.length > 0 ? (
                variants.map(variant => (
                  <Option key={variant.id} value={variant.id}>
                    {variant.attribute_values_detail?.map(attr => 
                      `${attr.attribute_type.name}: ${attr.value}`
                    ).join(', ')}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có biến thể</Option>
              )}
            </Select>
          </Form.Item>

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
              <Button onClick={() => setOrderDetailModalVisible(false)}>
                Đóng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage; 