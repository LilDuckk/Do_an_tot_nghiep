import React from 'react';
import { Form, Select, InputNumber, Button, Space } from 'antd';
import OrderDetailProductInfo from './OrderDetailProductInfo';
import { formatCurrency } from '@/admin/utils/formatters';

const { Option } = Select;

export default function OrderDetailForm({
  form,
  onSubmit,
  products,
  variants,
  variantsLoading = false,
  coupons,
  selectedProductId,
  selectedVariant,
  onProductChange,
  onVariantChange,
  editingOrderDetail,
  onCancel,
  productSearchText = '',
  onProductSearch = () => {},
}) {
  return (
    <Form
      form={form}
      onFinish={onSubmit}
      layout="vertical"
      className="form-top-margin"
    >
      <Form.Item
        name="product"
        label="Sản phẩm"
        rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
      >
        <Select
          placeholder="Chọn sản phẩm"
          onChange={onProductChange}
          showSearch
          filterOption={false}
          onSearch={onProductSearch}
          value={selectedProductId}
          defaultActiveFirstOption={false}
          notFoundContent={productSearchText ? 'Không tìm thấy sản phẩm' : null}
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
          placeholder={variantsLoading ? "Đang tải biến thể..." : "Chọn biến thể"}
          disabled={!selectedProductId || variantsLoading}
          loading={variantsLoading}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={onVariantChange}
          value={form.getFieldValue('product_variant')}
        >
          {variants.map(variant => (
            <Option key={variant.id} value={variant.id}>
              {variant.attribute_values_detail?.map(attr => 
                `${attr.attribute_type.name}: ${attr.value}`
              ).join(', ')}
              {variant.quantity !== undefined && ` (Tồn kho: ${variant.quantity})`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <OrderDetailProductInfo 
        selectedVariant={selectedVariant} 
        selectedProductId={selectedProductId} 
      />

      <Form.Item
        name="quantity"
        label="Số lượng"
        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
      >
        <InputNumber min={1} className="input-number-full" />
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
              {`${coupon.code} - ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {editingOrderDetail ? 'Cập nhật sản phẩm' : 'Thêm vào đơn hàng'}
          </Button>
          <Button onClick={onCancel}>
            Hủy
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
} 