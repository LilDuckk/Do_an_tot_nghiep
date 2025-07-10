# Hướng dẫn sử dụng Access Control System

## Tổng quan

Hệ thống Access Control đã được cải tiến để tích hợp với hệ thống quyền từ `permission.js` và `userInfo.js`. Hệ thống sẽ tự động kiểm tra quyền của user khi truy cập các trang admin.

## Cách sử dụng

### 1. Trong các trang Admin

```javascript
import React from 'react';
import { useAccessControl } from '@/hooks';
import { AccessDeniedAlert } from '@/common';

// Ví dụ cho trang Users
export default function UsersPage() {
  // Kiểm tra quyền view user
  const { hasAccess, userInfo, isSuperUser } = useAccessControl('user', 'view');
  
  // Nếu không có quyền, hiển thị alert
  if (!hasAccess) {
    return (
      <AccessDeniedAlert 
        hasAccess={hasAccess}
        module="user"
        action="view"
        showUserInfo={true}
      />
    );
  }

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      {/* Nội dung trang */}
    </div>
  );
}
```

### 2. Kiểm tra quyền cho các action cụ thể

```javascript
import React from 'react';
import { useAccessControl } from '@/hooks';

export default function ProductsPage() {
  const { 
    hasAccess, 
    checkModulePermission, 
    getModuleAccess,
    isSuperUser 
  } = useAccessControl('product', 'view');

  // Lấy tất cả quyền của module product
  const productPermissions = getModuleAccess('product');
  
  // Kiểm tra quyền tạo mới
  const canCreate = checkModulePermission('product', 'create');
  
  // Kiểm tra quyền chỉnh sửa
  const canEdit = checkModulePermission('product', 'edit');
  
  // Kiểm tra quyền xóa
  const canDelete = checkModulePermission('product', 'delete');

  return (
    <div>
      {hasAccess ? (
        <>
          <h1>Quản lý sản phẩm</h1>
          {canCreate && <button>Tạo mới</button>}
          {canEdit && <button>Chỉnh sửa</button>}
          {canDelete && <button>Xóa</button>}
        </>
      ) : (
        <AccessDeniedAlert 
          hasAccess={hasAccess}
          module="product"
          action="view"
        />
      )}
    </div>
  );
}
```

### 3. Sử dụng với CRUD operations

```javascript
import React from 'react';
import { useAccessControl, useCRUD } from '@/hooks';

export default function OrdersPage() {
  // Kiểm tra quyền view order
  const { hasAccess, checkModulePermission } = useAccessControl('order', 'view');
  
  // CRUD operations với kiểm tra quyền
  const { 
    data: orders, 
    loading, 
    createData, 
    updateData, 
    deleteData 
  } = useCRUD('/orders/', {
    canCreate: checkModulePermission('order', 'create'),
    canEdit: checkModulePermission('order', 'edit'),
    canDelete: checkModulePermission('order', 'delete')
  });

  if (!hasAccess) {
    return <AccessDeniedAlert hasAccess={hasAccess} module="order" action="view" />;
  }

  return (
    <div>
      {/* Nội dung trang */}
    </div>
  );
}
```

## Các module được hỗ trợ

Dựa trên `AdminLayout.js`, các module sau được hỗ trợ:

### Người dùng
- `user` - Quản lý người dùng
- `group` - Nhóm quyền  
- `permission` - Quyền

### Sản phẩm
- `product` - Quản lý sản phẩm
- `category` - Danh mục
- `brand` - Thương hiệu
- `productvariant` - Biến thể
- `attributetype` - Thuộc tính
- `attributevalue` - Giá trị thuộc tính

### Đơn hàng
- `order` - Quản lý đơn hàng
- `returnorder` - Trả hàng
- `coupon` - Mã giảm giá
- `customer` - Khách hàng
- `warranty` - Bảo hành

### Cửa hàng
- `store` - Quản lý cửa hàng
- `employee` - Nhân viên
- `inventory` - Tồn kho
- `inventorytransaction` - Giao dịch kho
- `stocktake` - Kiểm kê
- `stocktransfer` - Chuyển kho
- `supplier` - Nhà cung cấp
- `purchaseorder` - Đơn đặt hàng mua
- `goodsreceipt` - Phiếu nhập hàng

### Hệ thống
- `banner` - Banner
- `contactinfo` - Thông tin liên hệ
- `footercategory` - Danh mục chân trang
- `footerlink` - Liên kết chân trang
- `news` - Tin tức
- `auditlog` - Lịch sử thao tác

## Các action được hỗ trợ

- `view` - Xem
- `create` - Tạo mới
- `edit` - Chỉnh sửa
- `delete` - Xóa

## Tính năng đặc biệt

### 1. Superuser
Superuser có tất cả quyền và không bị giới hạn.

### 2. Thông báo lỗi tự động
Hệ thống sẽ tự động hiển thị thông báo lỗi khi user không có quyền.

### 3. Thông tin user chi tiết
`AccessDeniedAlert` có thể hiển thị thông tin chi tiết về user hiện tại.

### 4. Tương thích ngược
Các function cũ vẫn hoạt động để đảm bảo tương thích với code hiện có.

## Lưu ý

1. Đảm bảo user đã đăng nhập và có thông tin quyền trong localStorage
2. Hook sẽ tự động kiểm tra quyền khi component mount
3. Có thể sử dụng `resetAccessControl()` để reset trạng thái
4. Thông báo lỗi chỉ hiển thị 1 lần để tránh spam 