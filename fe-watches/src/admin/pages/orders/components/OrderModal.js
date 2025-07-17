/**
 * Component modal đơn hàng
 * 
 * Yêu cầu:
 * - Sử dụng Ant Design Modal và Form
 * - Form validation đầy đủ
 * - Upload file (nếu có)
 * - Tích hợp với useOrderModal hook
 * - Responsive design
 * - Loading states
 * - Error handling
 * - Tối ưu performance với React.memo
 * - Tích hợp với useOrderData để refresh list
 */

import React, { useMemo } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Space, 
  Spin,
  message
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_METHOD_OPTIONS,
  ONLINE_ORDER_OPTIONS,
  FORM_RULES,
  validateOrderForm,
  validateCustomerInfo,
  validatePaymentInfo,
  validateShippingInfo,
  validateOrderDate,
  calculateOrderTotal
} from '@/admin/pages/orders/utils';

const { Option } = Select;
const { TextArea } = Input;

const OrderModal = React.memo(({
  visible,
  loading = false,
  form,
  onSubmit,
  onCancel,
  initialValues = {},
  isEdit = false,
  customers = [],
  stores = [],
  employees = [],
  filteredEmployees = [],
  customerSearchLoading = false,
  isSuperUser = false,
  onCustomerSearch,
  onStoreChange,
  onEmployeeChange
}) => {
  // Memoize options để tối ưu performance
  const memoizedOptions = useMemo(() => ({
    orderStatus: ORDER_STATUS_OPTIONS,
    paymentMethod: PAYMENT_METHOD_OPTIONS,
    paymentStatus: PAYMENT_STATUS_OPTIONS,
    shippingMethod: SHIPPING_METHOD_OPTIONS,
    onlineOrder: ONLINE_ORDER_OPTIONS
  }), []);

  const handleSubmit = async (values) => {
    try {
      // Validate form trước khi submit
      const validation = validateOrderForm(values);
      if (!validation.isValid) {
        // Hiển thị lỗi validation
        Object.keys(validation.errors).forEach(field => {
          form.setFields([
            {
              name: field,
              errors: [validation.errors[field]]
            }
          ]);
        });
        return;
      }
      
      // Validate thêm các thông tin khác
      const customerValidation = validateCustomerInfo(customers.find(c => c.id === values.customer));
      const paymentValidation = validatePaymentInfo({
        payment_method: values.payment_method,
        payment_status: values.payment_status,
        total_amount: values.total_amount
      });
      const shippingValidation = validateShippingInfo({
        shipping_address: values.shipping_address,
        shipping_method: values.shipping_method,
        shipping_fee: values.shipping_fee
      });
      
      if (!customerValidation.isValid || !paymentValidation.isValid || !shippingValidation.isValid) {
        message.error('Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }
      
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting order form:', error);
      message.error('Có lỗi xảy ra khi lưu đơn hàng');
    }
  };

  const handleCustomerChange = (customerId) => {
    // Không gọi validation ngay khi chọn
  };

  const handlePaymentMethodChange = (method) => {
    // Không gọi validation ngay
  };

  const handleShippingMethodChange = (method) => {
    // Không gọi validation ngay
  };

  const handleOrderDateChange = (date) => {
    // Không gọi validation ngay
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical"
        disabled={loading}
      >
        {/* --- Trường Khách hàng --- */}
        <Form.Item
          name="customer"
          label="Khách hàng"
          rules={FORM_RULES.customer}
        >
          <Select
            showSearch
            allowClear
            loading={customerSearchLoading}
            placeholder="Nhập tên khách hàng để tìm kiếm"
            filterOption={false}
            onSearch={onCustomerSearch}
            notFoundContent={customerSearchLoading ? <Spin size="small" /> : null}
          >
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {`${customer.first_name} ${customer.last_name} - ${customer.phone}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* --- Trường Cửa hàng --- */}
        <Form.Item
          name="store"
          label="Cửa hàng"
          rules={FORM_RULES.store}
        >
          <Select
            allowClear
            onChange={storeId => {
              form.setFieldsValue({ employee: undefined });
              onStoreChange(storeId);
            }}
          >
            {stores.map(store => (
              <Option key={store.id} value={store.id}>
                {store.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* --- Trường Nhân viên --- */}
        <Form.Item
          name="employee"
          label="Nhân viên"
          rules={FORM_RULES.employee}
        >
          <Select
            showSearch
            allowClear
            placeholder={
              form.getFieldValue('store')
                ? (filteredEmployees.length === 0
                    ? "Không có nhân viên nào cho cửa hàng này"
                    : `Có ${filteredEmployees.length} nhân viên - Tìm kiếm nhân viên`)
                : "Chọn cửa hàng trước"
            }
            disabled={!form.getFieldValue('store')}
            notFoundContent={
              form.getFieldValue('store')
                ? (filteredEmployees.length === 0
                    ? "Không có nhân viên nào cho cửa hàng này"
                    : "Không tìm thấy nhân viên")
                : "Chọn cửa hàng trước"
            }
          >
            {filteredEmployees.map(employee => (
              <Option key={employee.id} value={employee.id}>
                {employee.name || employee.employee_code || (employee.user_details && employee.user_details.username) || ''}
                {employee.phone && ` - ${employee.phone}`}
                {employee.position && ` (${employee.position})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="order_date"
          label="Ngày đặt hàng"
          rules={FORM_RULES.order_date}
        >
          <DatePicker 
            showTime 
            className="date-picker-full"
            onChange={handleOrderDateChange}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={FORM_RULES.status}
        >
          <Select allowClear>
            {memoizedOptions.orderStatus.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="payment_method"
          label="Phương thức thanh toán"
          rules={FORM_RULES.payment_method}
        >
          <Select 
            allowClear
            onChange={handlePaymentMethodChange}
          >
            {memoizedOptions.paymentMethod.map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.value === 'cash' && '💵 '}
                {opt.value === 'credit_card' && '💳 '}
                {opt.value === 'bank_transfer' && '🏦 '}
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="payment_status"
          label="Trạng thái thanh toán"
          rules={FORM_RULES.payment_status}
        >
          <Select allowClear>
            {memoizedOptions.paymentStatus.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="shipping_address"
          label="Địa chỉ giao hàng"
          rules={FORM_RULES.shipping_address}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="shipping_method"
          label="Phương thức vận chuyển"
          rules={FORM_RULES.shipping_method}
        >
          <Select 
            allowClear
            onChange={handleShippingMethodChange}
          >
            {memoizedOptions.shippingMethod.map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.value === 'standard' && '🚚 '}
                {opt.value === 'express' && '⚡ '}
                {opt.value === 'overnight' && '🌙 '}
                {opt.label}
              </Option>
            ))}
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
          label="Tổng tiền hàng (tự động tính)"
          rules={FORM_RULES.subtotal}
        >
          <Input type="number" min={0} step={0.01} disabled placeholder="Được tính tự động từ sản phẩm" />
        </Form.Item>

        <Form.Item
          name="tax"
          label="Thuế (tùy chọn)"
          rules={FORM_RULES.tax}
        >
          <Input type="number" min={0} step={0.01} placeholder="Nhập thuế nếu có" />
        </Form.Item>

        <Form.Item
          name="shipping_fee"
          label="Phí vận chuyển (tùy chọn)"
          rules={FORM_RULES.shipping_fee}
        >
          <Input type="number" min={0} step={0.01} placeholder="Nhập phí vận chuyển nếu có" />
        </Form.Item>

        <Form.Item
          name="discount"
          label="Giảm giá (tùy chọn)"
          rules={FORM_RULES.discount}
        >
          <Input type="number" min={0} step={0.01} placeholder="Nhập giảm giá nếu có" />
        </Form.Item>

        <Form.Item
          name="total_amount"
          label="Tổng tiền (tự động tính)"
          rules={FORM_RULES.total_amount}
        >
          <Input type="number" min={0} step={0.01} disabled placeholder="Được tính tự động" />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú"
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="is_online_order"
          label="Đơn hàng online"
        >
          <Select>
            {memoizedOptions.onlineOrder.map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.value === true && '🌐 '}
                {opt.value === false && '🏪 '}
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={isEdit ? null : <PlusOutlined />}
            >
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            <Button onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
});

OrderModal.displayName = 'OrderModal';

export default OrderModal; 