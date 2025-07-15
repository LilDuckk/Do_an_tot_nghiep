import React from 'react';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/admin/utils/formatters';
import { copyToClipboard } from '@/admin/pages/orders/utils';

export default function OrderDetailProductInfo({ selectedVariant, selectedProductId }) {
  if (!selectedVariant) return null;

  return (
    <div className="product-selection-info">
      <div><b>Tên sản phẩm:</b> {selectedVariant.product_name}</div>
      <div><b>SKU:</b> {selectedVariant.sku}</div>
      <div><b>Giá:</b> {selectedVariant.price_adjustment ? formatCurrency(selectedVariant.price_adjustment) : 'Không có'}</div>
      <div><b>Thuộc tính:</b> {selectedVariant.attribute_values_detail?.map(attr => `${attr.attribute_type.name}: ${attr.value}`).join(', ')}</div>
      <div className="product-selection-row">
        <b>Bảo hành:</b> 
        <span>{selectedVariant.effective_warranty_period ? `${selectedVariant.effective_warranty_period} tháng` : 'Không có bảo hành'}</span>
        {selectedVariant.effective_warranty_period && (
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              // Tạo mã bảo hành tạm thời cho form (vì chưa có warranty_number thực tế)
              const tempWarrantyCode = `W-${selectedVariant.sku}-${selectedProductId}`;
              copyToClipboard(tempWarrantyCode, `Đã copy mã bảo hành: ${tempWarrantyCode}`);
            }}
            className="warranty-copy-btn"
          >
            Copy
          </Button>
        )}
      </div>
      {selectedVariant.images && selectedVariant.images.length > 0 && (
        <img src={selectedVariant.images[0].image} alt="" className="product-selection-image" />
      )}
    </div>
  );
} 