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

import React, { useEffect, useMemo, useRef } from 'react';
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
  // Set initial values khi modal mở
  useEffect(() => {
    if (visible && form) {
      console.log('Modal opened - isEdit:', isEdit, 'initialValues:', initialValues);
      if (isEdit && initialValues) {
        // Format date cho DatePicker
        const formattedValues = {
          ...initialValues,
          order_date: initialValues.order_date ? dayjs(initialValues.order_date) : null
        };
        console.log('Setting form values for edit:', formattedValues);
        form.setFieldsValue(formattedValues);
      } else {
        console.log('Resetting form fields for create');
        form.resetFields();
      }
    }
  }, [visible, form, isEdit, initialValues]);

  // Auto calculate total amount when form values change
  useEffect(() => {
    if (form && visible) {
      const values = form.getFieldsValue();
      const { subtotal, tax, shipping_fee, discount } = values;
      
      if (subtotal !== undefined || tax !== undefined || shipping_fee !== undefined || discount !== undefined) {
        const total = calculateOrderTotal(subtotal, tax, shipping_fee, discount);
        form.setFieldsValue({ total_amount: total.toFixed(2) });
      }
    }
  }, [form, visible]);

  // Debug form values
  useEffect(() => {
    if (form && visible) {
      const values = form.getFieldsValue();
      console.log('Form values in OrderModal:', values);
    }
  }, [form, visible]);

  // Debug when filteredEmployees change
  useEffect(() => {
    if (visible) {
      console.log('FilteredEmployees changed:', filteredEmployees.length);
      const values = form?.getFieldsValue();
      console.log('Form values after filteredEmployees change:', values);
    }
  }, [filteredEmployees, visible, form]);

  // Debug when customers or stores change
  useEffect(() => {
    if (visible) {
      console.log('Customers changed:', customers.length);
      console.log('Stores changed:', stores.length);
      const values = form?.getFieldsValue();
      console.log('Form values after customers/stores change:', values);
    }
  }, [customers, stores, visible, form]);

  // Preserve form values when customers/stores change
  useEffect(() => {
    if (visible && form) {
      const currentValues = form.getFieldsValue();
      const hasValues = Object.values(currentValues).some(value => value !== undefined && value !== null && value !== '');
      
      if (hasValues) {
        console.log('Preserving form values:', currentValues);
        // Force form to keep current values
        setTimeout(() => {
          form.setFieldsValue(currentValues);
        }, 0);
      }
    }
  }, [customers, stores, visible, form]);

  // Alternative approach: Use ref to track form values
  const formValuesRef = useRef({});
  
  useEffect(() => {
    if (visible && form) {
      const values = form.getFieldsValue();
      formValuesRef.current = values;
      console.log('Form values stored in ref:', values);
    }
  }, [visible, form]);

  // Restore form values when customers/stores change
  useEffect(() => {
    if (visible && form && Object.keys(formValuesRef.current).length > 0) {
      const storedValues = formValuesRef.current;
      const hasStoredValues = Object.values(storedValues).some(value => value !== undefined && value !== null && value !== '');
      
      if (hasStoredValues) {
        console.log('Restoring form values from ref:', storedValues);
        form.setFieldsValue(storedValues);
      }
    }
  }, [customers, stores, visible, form]);

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
    // Chỉ log để debug, không validate ngay
    console.log('Customer changed:', customerId);
    // Không gọi validation ngay khi chọn
  };

  const handlePaymentMethodChange = (method) => {
    // Chỉ log để debug, không validate ngay
    console.log('Payment method changed:', method);
  };

  const handleShippingMethodChange = (method) => {
    // Chỉ log để debug, không validate ngay
    console.log('Shipping method changed:', method);
  };

  const handleOrderDateChange = (date) => {
    // Chỉ log để debug, không validate ngay
    console.log('Order date changed:', date);
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
            onSearch={(searchText) => {
              console.log('Customer search:', searchText);
              // Lưu giá trị hiện tại của form trước khi search
              const currentValues = form.getFieldsValue();
              console.log('Current form values before customer search:', currentValues);
              
              // Gọi onCustomerSearch
              onCustomerSearch(searchText);
              
              // Restore form values sau khi search
              setTimeout(() => {
                console.log('Restoring form values after customer search:', currentValues);
                form.setFieldsValue(currentValues);
              }, 100);
            }}
            notFoundContent={customerSearchLoading ? <Spin size="small" /> : null}
            onChange={handleCustomerChange}
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
          rules={FORM_RULES.store}
        >
          <Select
            allowClear
            onChange={(storeId) => {
              console.log('Store changed to:', storeId);
              // Lưu giá trị hiện tại của form trước khi thay đổi
              const currentValues = form.getFieldsValue();
              console.log('Current form values before store change:', currentValues);
              
              // Gọi onStoreChange
              onStoreChange(storeId);
              
              // Restore form values sau khi thay đổi
              setTimeout(() => {
                console.log('Restoring form values after store change:', currentValues);
                form.setFieldsValue(currentValues);
              }, 100);
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
          rules={FORM_RULES.employee}
        >
          <Select
            showSearch
            allowClear
            placeholder={
              form?.getFieldValue('store')
                ? (filteredEmployees.length === 0
                    ? "Không có nhân viên nào cho cửa hàng này"
                    : `Có ${filteredEmployees.length} nhân viên - Tìm kiếm nhân viên`)
                : "Chọn cửa hàng trước"
            }
            filterOption={(input, option) =>
              (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            disabled={!isSuperUser || !form?.getFieldValue('store')}
            notFoundContent={
              form?.getFieldValue('store')
                ? (filteredEmployees.length === 0
                    ? "Không có nhân viên nào cho cửa hàng này"
                    : "Không tìm thấy nhân viên")
                : "Chọn cửa hàng trước"
            }
            onChange={onEmployeeChange}
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