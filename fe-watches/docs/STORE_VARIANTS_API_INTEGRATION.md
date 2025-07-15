# Tích hợp API STORE_VARIANTS

## Tổng quan

Đã tích hợp API mới `GET /api/inventory/inventories/store_variants/` để lấy thông tin tồn kho của một cửa hàng cụ thể thay vì lấy toàn bộ biến thể tồn kho của tất cả các cửa hàng.

## API Endpoint

```javascript
// Thêm vào src/config/api.js
STORE_VARIANTS: `${API_BASE_URL}/inventory/inventories/store_variants/`,
```

## Cấu trúc dữ liệu API

### Request Parameters
- `store_id` (required): ID của cửa hàng
- `in_stock_only` (optional): Chỉ lấy sản phẩm có tồn kho (default: true)
- `search` (optional): Từ khóa tìm kiếm
- `ordering` (optional): Sắp xếp theo trường (default: product_variant__product__name)

### Response Format
```json
{
    "store_id": "1",
    "filters": {
        "in_stock_only": true,
        "search": "watch",
        "ordering": "product_variant__product__name"
    },
    "total_variants": 5,
    "variants": [
        {
            "id": 282,
            "product": 121,
            "product_name": "Test Watchs",
            "sku": "TEST-WATCHS-DAY-DA-MAY-PIN-HONG-6D2BC5B5",
            "price_adjustment": "20000.00",
            "barcode": null,
            "is_active": true,
            "attribute_values": [8, 10, 11],
            "attribute_values_detail": [
                {
                    "id": 8,
                    "value": "Dây da",
                    "attribute_type": {
                        "id": 4,
                        "name": "Dây"
                    }
                }
            ],
            "warranty_period": null,
            "effective_warranty_period": null,
            "quantity": 15,
            "last_updated": "2024-01-15T10:30:00Z"
        }
    ]
}
```

## Hook mới: useStoreVariants

### Tạo file: `src/admin/pages/orders/hooks/useStoreVariants.js`

```javascript
import { useState, useCallback, useRef } from 'react';
import { INVENTORY_ENDPOINTS } from '@/config/api';
import { apiCall } from '../utils';

export default function useStoreVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache để tránh gọi API trùng lặp
  const cache = useRef(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 phút

  // Fetch store variants
  const fetchStoreVariants = useCallback(async (params = {}) => {
    const {
      store_id,
      product_id = null,
      search = '',
      in_stock_only = true,
      ordering = 'product_variant__product__name'
    } = params;

    if (!store_id) {
      setVariants([]);
      setError('Store ID is required');
      return;
    }

    // Tạo cache key
    const cacheKey = JSON.stringify({ store_id, product_id, search, in_stock_only, ordering });
    
    // Kiểm tra cache
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      setVariants(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        store_id: store_id.toString(),
        in_stock_only: in_stock_only.toString(),
        ordering: ordering
      });

      if (search) {
        queryParams.append('search', search);
      }

      const result = await apiCall(`${INVENTORY_ENDPOINTS.STORE_VARIANTS}?${queryParams}`);

      if (result.success && result.data) {
        let storeVariants = result.data.variants || [];

        // Filter theo product_id nếu có
        if (product_id) {
          storeVariants = storeVariants.filter(variant => 
            variant.product === product_id || variant.product_id === product_id
          );
        }

        // Cache kết quả
        cache.current.set(cacheKey, {
          data: storeVariants,
          timestamp: Date.now()
        });

        setVariants(storeVariants);
      } else {
        setVariants([]);
        setError(result.message || 'Failed to fetch store variants');
      }
    } catch (error) {
      console.error('Error fetching store variants:', error);
      setVariants([]);
      setError('Error fetching store variants');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get variants for specific product in store
  const getProductVariants = useCallback(async (store_id, product_id) => {
    return fetchStoreVariants({ store_id, product_id });
  }, [fetchStoreVariants]);

  // Search variants in store
  const searchStoreVariants = useCallback(async (store_id, search) => {
    return fetchStoreVariants({ store_id, search });
  }, [fetchStoreVariants]);

  return {
    variants,
    loading,
    error,
    fetchStoreVariants,
    getProductVariants,
    searchStoreVariants,
    clearCache
  };
}
```

## Cập nhật useOrderDetailModal

### Thay đổi chính:

1. **Import hook mới**:
```javascript
import useStoreVariants from './useStoreVariants';
```

2. **Sử dụng hook**:
```javascript
const { variants, loading: variantsLoading, fetchStoreVariants, getProductVariants } = useStoreVariants();
```

3. **Cập nhật fetchVariants**:
```javascript
const fetchVariants = useCallback(async (productId, storeId = null) => {
  if (!productId) {
    return;
  }
  
  try {
    // Nếu có storeId, sử dụng API store variants mới
    if (storeId) {
      await getProductVariants(storeId, productId);
    } else {
      // Fallback về API cũ nếu không có storeId
      const result = await apiCall(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(productId));
      
      if (result.success && result.data) {
        // Cập nhật variants thông qua hook
        fetchStoreVariants({ 
          store_id: null, 
          product_id: productId,
          in_stock_only: false 
        });
      }
    }
  } catch (error) {
    console.error('Error fetching variants:', error);
  }
}, [getProductVariants, fetchStoreVariants]);
```

4. **Lấy store_id từ userInfo**:
```javascript
const getStoreId = useCallback(() => {
  // Ưu tiên lấy từ userInfo nếu không phải superuser
  if (userInfo && !userInfo.isSuperUser && userInfo.userStoreId) {
    return userInfo.userStoreId;
  }
  
  // Nếu là superuser, có thể lấy từ form hoặc để null
  return null;
}, [userInfo]);
```

## Cập nhật Components

### OrderDetailForm
- Thêm prop `variantsLoading`
- Hiển thị loading state khi đang tải variants
- Hiển thị thông tin tồn kho trong dropdown

```javascript
<Select
  placeholder={variantsLoading ? "Đang tải biến thể..." : "Chọn biến thể"}
  disabled={!selectedProductId || variantsLoading}
  loading={variantsLoading}
  // ...
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
```

### OrderDetailModal
- Truyền `variantsLoading` từ hook xuống component

### OrdersPage
- Truyền `userInfo` vào `useOrderDetailModal`

## Lợi ích

1. **Hiệu suất tốt hơn**: Chỉ lấy variants của cửa hàng cụ thể thay vì toàn bộ
2. **Thông tin tồn kho chính xác**: Hiển thị số lượng tồn kho thực tế của cửa hàng
3. **Cache thông minh**: Tránh gọi API trùng lặp trong 5 phút
4. **Fallback an toàn**: Vẫn sử dụng API cũ nếu không có store_id
5. **UX tốt hơn**: Hiển thị loading state và thông tin tồn kho

## Sử dụng

### Trong OrdersPage:
```javascript
const orderDetailModal = useOrderDetailModal(selectedOrderId, refreshOrderDetails, userInfo);
```

### Trong component:
```javascript
<OrderDetailModal
  // ... other props
  variants={orderDetailModal.variants}
  variantsLoading={orderDetailModal.variantsLoading}
  // ... other props
/>
```

## Lưu ý

1. API mới chỉ hoạt động khi có `store_id`
2. Nếu không có `store_id` (superuser), sẽ fallback về API cũ
3. Cache được tự động xóa sau 5 phút
4. Thông tin tồn kho được hiển thị trong dropdown variants
5. Loading state được hiển thị khi đang tải dữ liệu 