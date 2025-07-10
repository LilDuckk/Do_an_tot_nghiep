# Hướng dẫn sử dụng hệ thống Import tối ưu

## Tổng quan

Dự án đã được cấu hình với hệ thống path mapping và import tập trung để dễ dàng quản lý và refactor.

## Cấu trúc Path Mapping

### 1. jsconfig.json
File này định nghĩa các alias path cho dự án:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/admin/*": ["admin/*"],
      "@/admin/pages/*": ["admin/pages/*"],
      "@/client/*": ["client/*"],
      "@/services/*": ["services/*"],
      "@/config/*": ["config/*"]
    }
  }
}
```

### 2. Các file index.js tập trung

#### `src/admin/pages/index.js`
Export tất cả các trang admin:
```javascript
export { default as OrdersPage } from './orders/OrdersPage';
export { default as ProductsPage } from './products/ProductsPage';
// ... và nhiều trang khác
```

#### `src/client/index.js`
Export tất cả các component client:
```javascript
export { default as ClientHome } from './ClientHome';
export { default as ProductList } from './ProductList';
// ... và nhiều component khác
```

#### `src/services/index.js`
Export tất cả các services:
```javascript
export { authService } from './authService';
export { default as axiosConfig } from './axiosConfig';
// ... và nhiều service khác
```

## Cách sử dụng Import mới

### Trước đây:
```javascript
import OrdersPage from './admin/pages/orders/OrdersPage';
import { authService } from './services/authService';
import ProductList from './client/ProductList';
```

### Bây giờ:
```javascript
import { OrdersPage } from '@/admin/pages';
import { authService } from '@/services';
import { ProductList } from '@/client';
```

## Script tự động sửa Import

### Chạy script:
```bash
npm run fix-imports
```

### Hoặc chạy trực tiếp:
```bash
node scripts/fix-imports.js
```

Script này sẽ:
1. Tìm tất cả file `.js` và `.jsx` trong thư mục `src`
2. Tự động thay thế các import cũ bằng import mới
3. Hiển thị báo cáo về số file đã được sửa

## Lợi ích của hệ thống mới

### 1. Dễ dàng refactor
- Khi di chuyển file, chỉ cần cập nhật trong file index.js tương ứng
- Không cần sửa từng import statement

### 2. Import ngắn gọn
- Giảm độ dài của import statements
- Dễ đọc và hiểu hơn

### 3. Tập trung quản lý
- Tất cả exports được tập trung trong các file index.js
- Dễ dàng xem danh sách các component/module có sẵn

### 4. IDE Support
- VS Code và các IDE khác sẽ hiểu được path mapping
- Auto-complete và go-to-definition hoạt động tốt

## Quy tắc khi thêm component mới

### 1. Thêm vào file index.js tương ứng
```javascript
// Trong src/admin/pages/index.js
export { default as NewPage } from './new-feature/NewPage';
```

### 2. Sử dụng import mới
```javascript
import { NewPage } from '@/admin/pages';
```

### 3. Cập nhật script fix-imports nếu cần
Thêm mapping mới vào `scripts/fix-imports.js` nếu có pattern import cũ cần chuyển đổi.

## Troubleshooting

### Lỗi "Module not found"
1. Kiểm tra file đã được export trong index.js chưa
2. Kiểm tra đường dẫn trong file index.js có đúng không
3. Restart IDE để nhận diện path mapping mới

### Script không chạy được
1. Kiểm tra đã cài đặt `glob` dependency chưa: `npm install --save-dev glob`
2. Kiểm tra file `scripts/fix-imports.js` có tồn tại không

### Import không hoạt động
1. Kiểm tra `jsconfig.json` có đúng cấu hình không
2. Restart IDE
3. Kiểm tra syntax import có đúng không

## Ví dụ thực tế

### Trước khi refactor:
```javascript
// App.js - 50+ dòng import
import OrdersPage from './admin/pages/orders/OrdersPage';
import ProductsPage from './admin/pages/products/ProductsPage';
import StoresPage from './admin/pages/stores/StoresPage';
// ... 40+ dòng import khác
```

### Sau khi refactor:
```javascript
// App.js - chỉ 10 dòng import
import { authService } from '@/services';
import AdminLogin from '@/admin/AdminLogin';
import ClientHome from '@/client/ClientHome';
import Dashboard from '@/admin/Dashboard';
import AdminLayout from '@/admin/AdminLayout';
import ProductList from '@/client/ProductList';
import ProductDetail from '@/client/ProductDetail';
import CartDetail from '@/client/CartDetail';
import Maintenance from '@/client/Maintenance';
import Contact from '@/client/Contact';

// Import tất cả admin pages từ file index tập trung
import {
  OrdersPage,
  ProductsPage,
  StoresPage,
  // ... và nhiều trang khác
} from '@/admin/pages';
```

## Kết luận

Hệ thống import mới giúp:
- Giảm 80% số dòng import trong các file
- Dễ dàng refactor và maintain code
- Tăng productivity khi phát triển
- Giảm lỗi import path 