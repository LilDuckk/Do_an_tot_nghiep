import React from 'react';
import { Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import OrderDetailTable from './OrderDetailTable';
import OrderDetailForm from './OrderDetailForm';

export default function OrderDetailModal({
  visible,
  onCancel,
  orderDetails,
  orderDetailLoading,
  showAddProductForm,
  onAddNewProduct,
  orderDetailForm,
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
  onCancelAddProduct,
  onEditOrderDetail,
  onDeleteOrderDetail,
  productSearchText = '',
  onProductSearch = () => {},
}) {
  return (
    <Modal
      title="Chi tiết đơn hàng"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
    >
      <div className="form-section-margin">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddNewProduct}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <OrderDetailTable
        orderDetails={orderDetails}
        loading={orderDetailLoading}
        onEdit={onEditOrderDetail}
        onDelete={onDeleteOrderDetail}
      />

      {showAddProductForm && (
        <OrderDetailForm
          form={orderDetailForm}
          onSubmit={onSubmit}
          products={products}
          variants={variants}
          variantsLoading={variantsLoading}
          coupons={coupons}
          selectedProductId={selectedProductId}
          selectedVariant={selectedVariant}
          onProductChange={onProductChange}
          onVariantChange={onVariantChange}
          editingOrderDetail={editingOrderDetail}
          onCancel={onCancelAddProduct}
          productSearchText={productSearchText}
          onProductSearch={onProductSearch}
        />
      )}
    </Modal>
  );
} 